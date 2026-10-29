# ERA @ UT Dallas

Website for ERA, the tech and entrepreneurial network at UT Dallas. ERA helps students land internships and works with companies that hire them.

- `/` landing page
- `/join` sign-up for students (`@utdallas.edu` email) and companies (`/join?type=company`)

## Stack

Next.js 15 (App Router), Tailwind CSS v4, GSAP (ScrollTrigger, SplitText), Lenis smooth scroll, a raw WebGL background shader, zod validation.

## Run locally

```bash
npm install
npm run dev -- -p 3002
```

In development, sign-ups are appended to `.data/signups.jsonl` (gitignored).

## Sign-ups in production

`POST /api/signup` forwards each sign-up as JSON to `SIGNUP_WEBHOOK_URL` (a Google Sheets Apps Script, Zapier or Make hook, etc). Without that variable set, production returns 503 and tells visitors to join the Discord instead.

```bash
vercel env add SIGNUP_WEBHOOK_URL production
```

## Content

Copy lives in `src/lib/content.ts`. Only facts ERA has published are used. Add partner companies, numbers or photos there once ERA supplies them.
