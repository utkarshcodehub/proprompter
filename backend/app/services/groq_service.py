"""
PromptCraft — Groq Service
===========================
Wraps the Groq API call. All LLM interaction lives here.
Handles: API errors, malformed JSON, empty responses, content flags.
"""

import json
import logging
from groq import Groq, APIError, RateLimitError, APIConnectionError

from app.config import settings
from app.schemas import OptimizeResult, CompareResult, ModeDelta, TargetModel

logger = logging.getLogger(__name__)

# ── Client (singleton) ────────────────────────────────────────
_client = Groq(api_key=settings.GROQ_API_KEY)

# ── Master System Prompt ──────────────────────────────────────
# Imported directly — single source of truth
SYSTEM_PROMPT = """
You are PromptCraft's optimization engine — an expert in prompt engineering
across ChatGPT, Claude, Midjourney, and Cursor.

You operate in two distinct modes. The user's message will always specify which.
Apply ONLY the rules for the selected mode. Never mix them.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 1 — DETECT (same for both modes)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TARGET MODEL — detect from text or explicit selection:
  "image", "draw", "illustration", "/imagine"          → midjourney
  "code", "function", "debug", "refactor", "endpoint"  → cursor
  "claude", "xml", "<task>"                            → claude
  general writing, explanation, analysis                → chatgpt
  unspecified                                          → chatgpt (default)

PRIMARY INTENT:
  create | explain | fix | analyze | transform | brainstorm

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MODE: LEAN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Goal: Find the minimum change that produces the maximum improvement.
Every token must earn its place by doing one of:
  (A) Resolving genuine ambiguity the model cannot infer
  (B) Preventing the most common failure mode for this task
  (C) Specifying output structure when multiple valid structures exist

LEAN RULES BY MODEL:

  ChatGPT — Add audience ONLY if it changes the answer. Add output format
  ONLY if multiple formats are equally valid. Skip role unless a specific
  perspective genuinely changes the output. Strip filler openers always.

  Claude — Always wrap in <task> tag. Add <constraints> only for non-obvious
  failure modes. Skip <context> if audience is inferable. No role assignment.

  Midjourney — Convert sentences to comma-separated descriptors (mandatory).
  Add lighting (highest impact per token). Add --ar --v --no always.

  Cursor — Add language + framework + version (mandatory). Add input/output
  contract if ambiguous. Add error handling only when default would be wrong.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MODE: STRUCTURED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Goal: Build a complete, production-ready prompt that pre-answers every
ambiguity. Optimised for consistent, repeatable results.

STRUCTURED RULES BY MODEL:

  ChatGPT — Role → Task → Audience → Format → Tone → Constraints.
  Add "Think step by step" for reasoning tasks. Add negative constraints
  for known failure modes.

  Claude — Full XML: <context> <task> <constraints> <format>. Add thinking
  trigger for analytical tasks. Context tag > role tag always.

  Midjourney — Full descriptor chain in order: Subject → Environment →
  Style → Lighting → Color → Mood. Full params: --ar --v --style --q.
  Negative prompt with 5+ items.

  Cursor — Full context block + complete I/O contract + all error cases +
  constraint list + naming convention + explanation request.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SCORING

LEAN:       Ambiguity eliminated 30 | Token efficiency 30 | Failure modes 25 | Model fit 15
STRUCTURED: Ambiguity eliminated 25 | Completeness 25 | Failure modes 25 | Model fit 15 | Repeatability 10

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OUTPUT — STRICT JSON ONLY. No markdown. No preamble.

{
  "mode": "lean" | "structured",
  "detected_model": "chatgpt" | "claude" | "midjourney" | "cursor" | "generic",
  "detected_intent": "create" | "explain" | "fix" | "analyze" | "transform" | "brainstorm",
  "gap_analysis": {
    "missing":   ["what was genuinely absent"],
    "redundant": ["what was stripped"]
  },
  "optimized_prompt": "the full ready-to-use prompt",
  "explanation": "1-2 sentences: what changed and why",
  "changes_made": [
    { "type": "added|stripped|restructured|specified|reframed", "detail": "what changed" }
  ],
  "token_estimate_before": <int>,
  "token_estimate_after": <int>,
  "tokens_delta": <int>,
  "quality_score": <int 0-100>,
  "mode_insight": "one sentence on what the other mode would do differently"
}
"""


def _build_user_message(raw_input: str, mode: str, model: str) -> str:
    model_hint = (
        f"Target model (user-selected): {model.upper()}."
        if model != "auto"
        else "No model selected — detect from content."
    )
    return f"""MODE: {mode.upper()}
{model_hint}

RAW INPUT:
\"\"\"{raw_input}\"\"\"

Apply the {mode.upper()} rules. Return ONLY the JSON output."""


def _call_groq(raw_input: str, mode: str, model: str) -> dict:
    """
    Single Groq API call. Returns parsed dict.
    Raises ValueError on bad JSON, RuntimeError on API failure.
    """
    try:
        response = _client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user",   "content": _build_user_message(raw_input, mode, model)}
            ],
            temperature=settings.GROQ_TEMPERATURE,
            max_tokens=settings.GROQ_MAX_TOKENS,
            response_format={"type": "json_object"},
        )

        raw_json = response.choices[0].message.content
        if not raw_json:
            raise ValueError("Empty response from Groq")

        return json.loads(raw_json)

    except RateLimitError:
        logger.error("Groq rate limit hit")
        raise RuntimeError("rate_limit")

    except APIConnectionError:
        logger.error("Groq connection error")
        raise RuntimeError("connection_error")

    except APIError as e:
        logger.error(f"Groq API error: {e}")
        raise RuntimeError("api_error")

    except json.JSONDecodeError as e:
        logger.error(f"Malformed JSON from Groq: {e}")
        raise ValueError("malformed_response")


def _recommend_mode(lean: dict, structured: dict) -> str:
    """
    Recommend which mode better fits the input.
    If structured scores ≤10 pts higher → lean wins (not worth the tokens).
    """
    if structured.get("quality_score", 0) - lean.get("quality_score", 0) <= 10:
        return "lean"
    if lean.get("detected_model") in ["midjourney", "cursor"]:
        return "structured"
    return "lean"


# ── Public API ────────────────────────────────────────────────

async def run_optimize(raw_input: str, mode: str, model: str) -> OptimizeResult:
    """
    Single-mode optimization. Powers POST /optimize.
    """
    data = _call_groq(raw_input, mode, model)
    return OptimizeResult(**data)


async def run_compare(raw_input: str, model: str) -> CompareResult:
    """
    Dual-mode comparison. Powers POST /compare.
    Makes 2 Groq calls — gate behind auth on the router.
    """
    lean_data       = _call_groq(raw_input, "lean",       model)
    structured_data = _call_groq(raw_input, "structured", model)

    lean       = OptimizeResult(**lean_data)
    structured = OptimizeResult(**structured_data)

    delta = ModeDelta(
        token_difference=structured.token_estimate_after - lean.token_estimate_after,
        score_difference=structured.quality_score - lean.quality_score,
        recommendation=_recommend_mode(lean_data, structured_data),
    )

    return CompareResult(
        input=raw_input,
        model=lean.detected_model,
        lean=lean,
        structured=structured,
        delta=delta,
    )
