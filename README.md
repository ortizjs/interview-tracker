# Interview Tracker — Server (Step 1)

Minimal Express + TypeScript server with one working route: `POST /api/chat`,
which round-trips a message through the Claude API.

## Setup

```bash
cd interview-tracker-server
npm install
cp .env.example .env
# then paste your real Anthropic API key into .env
npx prisma generate
npm run dev
```

Server starts on http://localhost:3001

## Test it

```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Say hello in 5 words or less."}'
```

You should get back `{ "reply": "..." }`.

## Next steps (not built yet)

- Step 2: Add Prisma models (Company, InterviewRound, Feedback, SkillGap) and
  a migration.
- Step 3: Add tool/function calling to `askClaude` so the model can call
  `logInterviewRound()` etc.
- Step 4+: RAG, agent loop, evals, React frontend.

## Git

This directory is ready for `git init`. `.env` and `node_modules` are
already gitignored — double check `git status` before your first commit to
make sure your API key never gets staged.
