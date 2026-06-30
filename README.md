<div align="center">

<img src="https://img.shields.io/badge/-%E2%9C%A6%20ProPrompter-F5A623?style=for-the-badge&logoColor=black" alt="ProPrompter" height="40"/>

### Transform vague ideas into lean, structured AI prompts.
### Optimized for ChatGPT, Claude, Midjourney, and Cursor.

<br/>

[![Live Demo](https://img.shields.io/badge/Live%20App-proprompter.vercel.app-F5A623?style=flat-square&logo=vercel&logoColor=white)](https://proprompter.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-utkarshcodehub-181717?style=flat-square&logo=github)](https://github.com/utkarshcodehub/proprompter)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com)
[![Groq](https://img.shields.io/badge/Groq-LLaMA%203.3%2070b-F55036?style=flat-square)](https://console.groq.com)

<br/>

![ProPrompter Demo](https://raw.githubusercontent.com/utkarshcodehub/proprompter/main/assets/demo.png)

</div>

---

## The Problem

Most people waste tokens — and money — not because AI is bad, but because their prompts are vague, bloated, or structured for the wrong model.

- A prompt written for ChatGPT won't work the same way on Claude
- A Midjourney prompt written in sentences produces mediocre images
- Cursor needs framework context or it guesses the wrong stack every time
- Filler openers like *"can you please write me a..."* consume tokens with zero value

**ProPrompter fixes all of this in one click.**

---

## How It Works

```
Your vague input        →    ProPrompter engine    →    Optimized prompt + explanation
"write a login          →    Detects: Cursor /     →    "Python 3.11, FastAPI.
function in python"          CREATE intent              POST /auth/login — accepts
                             Applies Cursor rules       {email, password}, returns
                                                        JWT on success, raises
                                                        HTTP 401 on failure.
                                                        Supabase auth SDK."
```

Every result includes:
- The optimized, ready-to-paste prompt
- A quality score (0–100) with breakdown
- Token count before and after
- A plain-English explanation of every change made
- An insight into what the other mode would have done differently

---

## Two Optimization Modes

| | Lean | Structured |
|---|---|---|
| **Goal** | Minimum tokens, maximum clarity | Full framework, production-ready |
| **Adds** | Only what's genuinely missing | Complete model-specific framework |
| **Strips** | All filler, redundancy, implied content | Nothing — covers every decision |
| **Best for** | Personal use, quick iterations | Teams, templates, repeatable results |
| **Token delta** | Often shorter than input | Longer but pre-resolves all ambiguity |

---

## Model-Specific Optimization

### ChatGPT
Applies: role assignment → task sentence → audience → output format → tone → constraints

```
Before: "explain machine learning"
After:  "You are a data science educator. Explain supervised learning to a
         software developer who understands programming but has never studied ML.
         Use a code analogy. Keep under 300 words. Bullet the key concepts."
```

### Claude
Applies: XML tag structure with `<context>` `<task>` `<constraints>` `<format>`

```
Before: "help me understand neural networks"
After:  <task>Explain how neural networks learn — forward pass, loss, and
        backpropagation — using a programming analogy.</task>
        <constraints>No math without explanation. Under 350 words.</constraints>
        <format>1. Core idea 2. Analogy 3. How learning works 4. Real example</format>
```

### Midjourney
Applies: sentence → descriptor chain, lighting, color palette, technical params

```
Before: "cool futuristic city at night"
After:  "neon-drenched cyberpunk megacity, aerial view, rain-soaked reflective
         streets, volumetric fog, dramatic rim lighting, electric blue palette
         --ar 16:9 --v 6 --style raw --no blur, watermark, text"
```

### Cursor
Applies: language/framework context, I/O contract, error handling spec

```
Before: "write a login function in python"
After:  "Python 3.11, FastAPI. POST /auth/login — accepts {email, password},
         returns JWT on success, raises HTTP 401 on failure.
         Use Supabase auth SDK. No custom password hashing."
```

---

## Features

### Core
- [x] Lean + Structured optimization modes with live toggle
- [x] Auto-detect target model from prompt content
- [x] Quality score (0–100) with visual ring indicator
- [x] Token count before vs after with delta
- [x] Explanation of every change made
- [x] One-click copy

### User Layer
- [x] Google OAuth via Supabase
- [x] Prompt history — searchable, filterable, expandable
- [x] Collections / folders — organise saved prompts
- [x] Side-by-side mode comparison with recommendation
- [x] User dashboard — stats, activity chart, model breakdown

### Community
- [x] Community template library — browse shared prompts
- [x] Upvote templates (atomic with Supabase RPC)
- [x] Submit your own template
- [x] One-click "Use this" — pre-fills the optimizer

### Infrastructure
- [x] Daily rate limiting (10 free optimizations / day)
- [x] Row Level Security — users only access their own data
- [x] IP-based rate limiting on backend
- [x] Deployed on Vercel + Render

### Coming in Phase 3
- [ ] Chrome extension — optimize prompts from any webpage
- [ ] Public API with key-based auth for developers
- [ ] Share public prompt links
- [ ] Freemium gate with Stripe

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| **Frontend** | Next.js 16, Tailwind CSS 4 | App Router, SSR, fast Vercel deploy |
| **Fonts** | Syne (display), JetBrains Mono (code), DM Sans (body) | Distinctive, technical feel |
| **Backend** | FastAPI 0.115, Python 3.11 | Async, fast, familiar |
| **AI Engine** | Groq API — LLaMA 3.3 70b | Ultra-fast inference, free tier |
| **Database** | Supabase (PostgreSQL) | Auth, RLS, real-time, free tier |
| **Auth** | Supabase + Google OAuth | One-click sign in |
| **Frontend deploy** | Vercel | Instant CD from GitHub |
| **Backend deploy** | Render | Free tier, auto-deploy from GitHub |

---

## Project Structure

```
proprompter/
│
├── backend/                          # FastAPI application
│   ├── app/
│   │   ├── routers/
│   │   │   └── optimize.py           # POST /optimize  POST /compare  GET /usage
│   │   ├── services/
│   │   │   └── groq_service.py       # LLM calls + dual-mode engine + master system prompt
│   │   ├── middleware/
│   │   │   └── rate_limiter.py       # IP-based daily limits (swap for Redis in prod)
│   │   ├── main.py                   # FastAPI entry + CORS
│   │   ├── config.py                 # All env vars via pydantic-settings
│   │   └── schemas.py                # Pydantic request/response models
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
│
├── frontend/                         # Next.js application
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.jsx              # Main optimizer (Screen 1)
│   │   │   ├── history/page.jsx      # Prompt history (Screen 2)
│   │   │   ├── compare/page.jsx      # Side-by-side compare (Screen 3)
│   │   │   ├── collections/page.jsx  # Folders (Screen 4)
│   │   │   ├── dashboard/page.jsx    # User stats (Screen 5)
│   │   │   ├── community/page.jsx    # Template library (Screen 6)
│   │   │   ├── login/page.jsx        # Google auth
│   │   │   ├── auth/callback/        # OAuth handler
│   │   │   ├── layout.jsx            # Fonts + metadata
│   │   │   └── globals.css           # Design tokens + animations
│   │   ├── components/
│   │   │   └── Navbar.jsx            # Shared navbar across all pages
│   │   ├── hooks/
│   │   │   ├── useAuth.js            # Auth state + sign in/out
│   │   │   ├── useHistory.js         # Supabase history CRUD
│   │   │   └── useCollections.js     # Supabase collections CRUD
│   │   ├── lib/
│   │   │   └── supabase.js           # Supabase client singleton
│   │   └── middleware.js             # Route protection (auth guard)
│   ├── package.json
│   ├── vercel.json
│   └── .env.example
│
├── supabase/
│   ├── schema.sql                    # Core tables + RLS policies
│   └── community_schema.sql         # Community templates + upvotes
│
├── .gitignore
└── README.md
```

---

## Database Schema

```sql
-- Core tables
prompt_history        -- id, user_id, input, mode, detected_model,
                      -- optimized_prompt, explanation, changes_made,
                      -- token_estimate_before/after, tokens_delta,
                      -- quality_score, mode_insight, created_at

collections           -- id, user_id, name, emoji, description, created_at, updated_at

collection_prompts    -- id, collection_id, history_id, added_at

-- Community tables
community_templates   -- id, user_id, title, description, prompt,
                      -- model, mode, tags[], upvotes, created_at

template_upvotes      -- id, template_id, user_id, created_at
                      -- UNIQUE(template_id, user_id) — one upvote per user

-- All tables have Row Level Security enabled
-- Users can only read/write their own rows
-- community_templates are public to read
```

---

## API Reference

### `POST /api/v1/optimize`

Transform a vague input into an optimized prompt.

**Request:**
```json
{
  "input": "write a login function in python",
  "mode": "lean",
  "model": "cursor"
}
```

**Response:**
```json
{
  "mode": "lean",
  "detected_model": "cursor",
  "detected_intent": "create",
  "gap_analysis": {
    "missing": ["language", "framework", "I/O contract"],
    "redundant": ["write a"]
  },
  "optimized_prompt": "Python 3.11, FastAPI. POST /auth/login...",
  "explanation": "Added language and framework context...",
  "changes_made": [
    { "type": "added", "detail": "Language + framework context block" },
    { "type": "specified", "detail": "Full I/O contract and error handling" }
  ],
  "token_estimate_before": 9,
  "token_estimate_after": 27,
  "tokens_delta": 18,
  "quality_score": 95,
  "mode_insight": "Structured mode would also add constraint list..."
}
```

### `POST /api/v1/compare`

Run both modes on the same input and return a recommendation.

```json
{ "input": "explain neural networks", "model": "claude" }
```

Returns: `{ lean: OptimizeResult, structured: OptimizeResult, delta: { token_difference, score_difference, recommendation } }`

> Costs 2 Groq API calls. Rate limited to 3/day on free tier.

### `GET /api/v1/usage`

Returns daily quota remaining for the current IP.

### `GET /health`

```json
{ "status": "ok", "env": "production", "model": "llama-3.3-70b-versatile" }
```

---

## Local Setup

### Prerequisites
- Python 3.11
- Node.js 18+
- Groq API key — [console.groq.com](https://console.groq.com)
- Supabase project — [supabase.com](https://supabase.com)

### 1. Clone

```bash
git clone https://github.com/utkarshcodehub/proprompter.git
cd proprompter
```

### 2. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# Add GROQ_API_KEY to .env

uvicorn app.main:app --reload
# API docs: http://localhost:8000/docs
```

### 3. Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. SQL Editor → New Query → paste `supabase/schema.sql` → Run
3. SQL Editor → New Query → paste `supabase/community_schema.sql` → Run
4. Authentication → Providers → Google → enable + add credentials
5. Authentication → URL Configuration → add `http://localhost:3000/auth/callback` to Redirect URLs

### 4. Frontend

```bash
cd frontend
npm install

cp .env.example .env.local
# Fill in all three values

npm run dev
# App: http://localhost:3000
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `GROQ_API_KEY` | ✅ | — | From [console.groq.com](https://console.groq.com) |
| `ENV` | | `development` | `development` or `production` |
| `CORS_ORIGINS` | | `["http://localhost:3000"]` | Allowed frontend origins |
| `FREE_OPTIMIZE_LIMIT` | | `10` | Free optimizations per IP per day |
| `FREE_COMPARE_LIMIT` | | `3` | Free compares per IP per day |
| `SECRET_KEY` | | `change-me` | Used for signing |

### Frontend (`frontend/.env.local`)

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | ✅ | FastAPI backend URL |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | From Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | From Supabase → Settings → API |

---

## Deployment

### Backend → Render

1. [render.com](https://render.com) → New Web Service → Connect GitHub repo
2. Root directory: `backend`
3. Build command: `pip install -r requirements.txt`
4. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables in Render dashboard:
   ```
   GROQ_API_KEY    = gsk_...
   ENV             = production
   CORS_ORIGINS    = ["https://your-app.vercel.app"]
   PYTHON_VERSION  = 3.11.9
   ```

### Frontend → Vercel

1. [vercel.com](https://vercel.com) → New Project → Import GitHub repo
2. Root directory: `frontend`
3. Add environment variables in Vercel dashboard:
   ```
   NEXT_PUBLIC_API_URL            = https://your-api.onrender.com
   NEXT_PUBLIC_SUPABASE_URL       = https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY  = eyJ...
   ```
4. After deploying, add your Vercel URL to Supabase Redirect URLs

---

## The Prompt Engine

The core of ProPrompter is a carefully designed system prompt that runs on LLaMA 3.3 70b via Groq. The engine follows a 4-step process on every request:

**Step 1 — Detect**
Identifies the target model (from text signals or explicit selection) and the primary intent (create / explain / fix / analyze / transform / brainstorm).

**Step 2 — Gap Analysis**
Finds what's genuinely missing (audience, output format, scope, key constraint) vs what's redundant (filler openers, implied quality expectations, repeated instructions).

**Step 3 — Apply Mode Rules**

In **Lean mode**, a token only survives if it:
- Resolves genuine ambiguity the model can't infer
- Prevents the most common failure mode for this task
- Specifies output structure when multiple valid formats exist

In **Structured mode**, the full model-specific framework is applied — role, context, task, constraints, output format — leaving nothing to chance.

**Step 4 — Score and Return**
Scores the result 0–100 across ambiguity elimination, token efficiency, failure mode coverage, and model fit. Returns structured JSON with the prompt, explanation, changes, and token delta.

---

## Screens

| Screen | Route | Description |
|---|---|---|
| Optimizer | `/` | Main prompt optimization interface |
| History | `/history` | All past optimizations, searchable and filterable |
| Compare | `/compare` | Side-by-side lean vs structured with recommendation |
| Collections | `/collections` | Saved prompt folders |
| Dashboard | `/dashboard` | User stats, activity chart, model breakdown |
| Community | `/community` | Browse, upvote, and share templates |
| Login | `/login` | Google OAuth sign in |

---

## Roadmap

### Phase 1 — MVP ✅
Core optimizer, both modes, all four models, quality scoring, token delta, auth, deployed.

### Phase 2 — User Layer ✅
Prompt history, collections, side-by-side compare, user dashboard, community templates with upvoting.

### Phase 3 — Growth 🔜
Chrome extension, public API with key-based auth, shareable prompt links, Stripe freemium gate.

---

## License

MIT — built by [Utkarsh Raj](https://github.com/utkarshcodehub)

---

<div align="center">

**ProPrompter** — Write better prompts, spend fewer tokens.

[Try it live →](https://proprompter.vercel.app)

</div>
