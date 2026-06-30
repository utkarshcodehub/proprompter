"""
PromptCraft — Schemas
======================
All Pydantic models for request validation and response serialization.
FastAPI uses these for automatic docs, input validation, and type safety.
"""

from pydantic import BaseModel, Field, field_validator
from typing import Literal, List, Optional
from enum import Enum


# ── Enums ─────────────────────────────────────────────────────

class Mode(str, Enum):
    lean       = "lean"
    structured = "structured"

class TargetModel(str, Enum):
    auto       = "auto"
    chatgpt    = "chatgpt"
    claude     = "claude"
    midjourney = "midjourney"
    cursor     = "cursor"

class Intent(str, Enum):
    create     = "create"
    explain    = "explain"
    fix        = "fix"
    analyze    = "analyze"
    transform  = "transform"
    brainstorm = "brainstorm"

class ChangeType(str, Enum):
    added        = "added"
    stripped     = "stripped"
    restructured = "restructured"
    specified    = "specified"
    reframed     = "reframed"


# ── Request Models ────────────────────────────────────────────

class OptimizeRequest(BaseModel):
    input: str = Field(
        ...,
        min_length=3,
        max_length=2000,
        description="The raw, vague prompt to optimize",
        examples=["write a linkedin post about my internship"]
    )
    mode: Mode = Field(
        default=Mode.lean,
        description="lean = token-efficient | structured = comprehensive"
    )
    model: TargetModel = Field(
        default=TargetModel.auto,
        description="Target AI model. 'auto' detects from content."
    )

    @field_validator("input")
    @classmethod
    def strip_and_validate(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Input cannot be empty or whitespace only")
        return v

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "input": "write a linkedin post about my internship",
                    "mode": "lean",
                    "model": "chatgpt"
                }
            ]
        }
    }


class CompareRequest(BaseModel):
    input: str = Field(
        ...,
        min_length=3,
        max_length=2000,
        description="The raw prompt to compare across both modes"
    )
    model: TargetModel = Field(
        default=TargetModel.auto,
        description="Target AI model"
    )

    @field_validator("input")
    @classmethod
    def strip_and_validate(cls, v: str) -> str:
        return v.strip()


# ── Response Models ───────────────────────────────────────────

class GapAnalysis(BaseModel):
    missing:   List[str] = Field(description="What was genuinely absent from the input")
    redundant: List[str] = Field(description="What was stripped (lean mode only)")


class Change(BaseModel):
    type:   ChangeType = Field(description="Nature of the change")
    detail: str        = Field(description="What changed and why")


class OptimizeResult(BaseModel):
    mode:             Mode         = Field(description="Mode used for optimization")
    detected_model:   TargetModel  = Field(description="Model detected or confirmed")
    detected_intent:  Intent       = Field(description="Primary intent of the input")
    gap_analysis:     GapAnalysis
    optimized_prompt: str          = Field(description="The ready-to-use optimized prompt")
    explanation:      str          = Field(description="Plain-English summary of what changed and why")
    changes_made:     List[Change]
    token_estimate_before: int     = Field(description="Approximate token count of raw input")
    token_estimate_after:  int     = Field(description="Approximate token count of optimized prompt")
    tokens_delta:          int     = Field(description="Difference — negative means shorter")
    quality_score:         int     = Field(ge=0, le=100, description="0–100 quality score")
    mode_insight:          str     = Field(description="What the other mode would have done differently")


class ModeDelta(BaseModel):
    token_difference: int = Field(description="Structured tokens − Lean tokens")
    score_difference: int = Field(description="Structured score − Lean score")
    recommendation:   Literal["lean", "structured"] = Field(
        description="Which mode is recommended for this input"
    )


class CompareResult(BaseModel):
    input:      str
    model:      TargetModel
    lean:       OptimizeResult
    structured: OptimizeResult
    delta:      ModeDelta


# ── Error Models ──────────────────────────────────────────────

class ErrorDetail(BaseModel):
    code:    str
    message: str
    hint:    Optional[str] = None


class ErrorResponse(BaseModel):
    error: ErrorDetail
