<div align="center">

<img src="https://img.shields.io/badge/-%E2%9C%A6%20ProPrompter-F5A623?style=for-the-badge&logoColor=black" alt="ProPrompter" height="40"/>

### Transform vague ideas into lean, structured AI prompts.
### Optimized for ChatGPT, Claude, Midjourney, and Cursor.

<br/>

[![Live Demo](https://img.shields.io/badge/Live%20App-proprompter--smoky.vercel.app-F5A623?style=flat-square&logo=vercel&logoColor=white)](https://proprompter-smoky.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-utkarshcodehub-181717?style=flat-square&logo=github)](https://github.com/utkarshcodehub/proprompter)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com)
[![Groq](https://img.shields.io/badge/Groq-LLaMA%203.3%2070b-F55036?style=flat-square)](https://console.groq.com)

</div>

---

## The Problem

Most people waste tokens not because AI is bad, but because their prompts are vague, bloated, or structured for the wrong model. A prompt written for ChatGPT won't work the same on Claude. A Midjourney prompt written in sentences produces mediocre images. Filler openers like *"can you please write me a..."* burn tokens with zero value.

**ProPrompter fixes this in one click.**

---

## Two Modes

| | Lean | Structured |
|---|---|---|
| **Goal** | Minimum tokens, maximum clarity | Full framework, production-ready |
| **Best for** | Personal use, quick iterations | Teams, templates, repeatable results |

---

## Features

- **Optimizer** — Lean + Structured modes, auto model detection, quality score (0–100), token delta, explanation of every change
- **History** — Every optimization saved, searchable and filterable by model and mode
- **Compare** — Side-by-side lean vs structured with a recommendation
- **Collections** — Organise saved prompts into folders
- **Dashboard** — Stats, activity chart, model breakdown
- **Community** — Browse, upvote, and share prompt templates
- **Auth** — Google OAuth via Supabase

---

## Tech Stack

| | |
|---|---|
| Frontend | Next.js 16, Tailwind CSS 4 |
| Backend | FastAPI 0.115, Python 3.11 |
| AI Engine | Groq — LLaMA 3.3 70b |
| Database + Auth | Supabase (PostgreSQL + Google OAuth) |
| Deploy | Vercel (frontend) + Render (backend) |

---

## Local Setup

**Backend**
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env        # add your GROQ_API_KEY
uvicorn app.main:app --reload
```

**Supabase**
1. Create a project at [supabase.com](https://supabase.com)
2. Run `supabase/schema.sql` then `supabase/community_schema.sql` in the SQL Editor
3. Enable Google OAuth under Authentication → Providers

**Frontend**
```bash
cd frontend
npm install
cp .env.example .env.local  # fill in all three values
npm run dev
```

---

## Environment Variables

**Backend**
```
GROQ_API_KEY      = gsk_...
ENV               = development
CORS_ORIGINS      = ["http://localhost:3000"]
```

**Frontend**
```
NEXT_PUBLIC_API_URL             = http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL        = https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY   = eyJ...
```

---

## Roadmap

- [x] Phase 1 — Core optimizer, both modes, all four models, auth, deployed
- [x] Phase 2 — History, collections, compare, dashboard, community templates
- [ ] Phase 3 — Chrome extension, public API, shareable links, Stripe

---

## License

MIT — built by [Utkarsh Raj](https://github.com/utkarshcodehub)

<div align="center">

[Try it live →](https://proprompter-smoky.vercel.app)

</div>
