# NGO Match Tool — Agent Notes

## Prototype status

**This Next.js app is a prototype only.** It is not production-ready.

- Matching logic and NGO data are **mocked / static** (bundled `src/data/ngos.json`), not live from gemeinnuetzig.li APIs.
- There is **no authentication**, persistence, analytics, or admin tooling.
- Images and copy are for demonstration; data may be stale vs. the public directory.
- The original Python/FastAPI implementation lives under `PycharmProjects/Charity-Match-Tool/` for reference.

Do **not** treat this codebase as the canonical production system unless explicitly promoted by the project owners.

## Prototype tracks (from interviews)

Before changing matching UX or adding NGO/project pages, read [`../transcripts/PROTOTYPE_GUIDELINES.md`](../transcripts/PROTOTYPE_GUIDELINES.md) for funder/NGO requirements, acceptance hints, and anti-patterns.

## Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js (App Router), React, TypeScript |
| Styling | Tailwind CSS v4 + compiled LESS (`src/styles/custom.less` → `custom.css`) |
| API | `POST /api/match` — in-process matcher (`src/lib/matcher.ts`) |
| State | `sessionStorage` for quiz results and user name |

## Run locally

```bash
cd web
npm install
npm run dev
```

Open http://localhost:3000

## Key paths

- `src/app/page.tsx` — landing + name capture
- `src/app/quiz/page.tsx` — 8-step quiz
- `src/app/results/page.tsx` — top 5 matches
- `src/app/api/match/route.ts` — match endpoint
- `src/lib/matcher.ts` — scoring (ported from Python)
- `src/data/ngos.json` — NGO dataset
- `public/images/ngo-pics/` — logo assets for marquee

## Future production work (out of scope for prototype)

- Live data sync from gemeinnuetzig.li (scraper/API)
- Database, caching, and data validation
- Proper i18n (full DE translations for quiz steps)
- Tests, CI, deployment, and security review
- Replace `sessionStorage` with server sessions or URL-safe state
