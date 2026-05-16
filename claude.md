# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# CalorieApp — Claude Code Project Guide

## Commands

```bash
npm run dev      # start local dev server at http://localhost:3000
npm run build    # production build — must pass before deploying
npm run lint     # ESLint check
npm run start    # run production build locally
```

**Local Stripe webhooks** (requires Stripe CLI installed):
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook --api-key sk_test_...
```

## Project Overview
A subscription-based calorie tracking and meal planning web app. Users can calculate their TDEE, log food, and get AI-generated calorie plans to gain or lose weight. Premium plans are gated behind a Stripe subscription.

## Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **Payments:** Stripe
- **AI Plans:** Anthropic Claude API (claude-sonnet-4-20250514)
- **Deployment:** Vercel

## Project Structure
```
app/
  (auth)/           # login, register, onboarding
  (dashboard)/      # protected pages for logged-in users
    calculator/     # TDEE + BMR calculator
    tracker/        # daily food log
    plan/           # AI-generated meal plan (Pro only)
    profile/        # user goals + settings
  (marketing)/      # landing page, pricing, about
  api/
    auth/           # auth helpers
    stripe/         # checkout + webhook
    plans/          # calorie plan CRUD
    ai/             # Claude API route

components/         # shared UI components
lib/
  supabase.ts         # Supabase browser client (use in client components)
  supabase-server.ts  # Supabase server client + admin client (use in API routes / server components)
  stripe.ts           # Stripe client
  claude.ts           # Anthropic client (server-side only)
  tdee.ts             # BMR/TDEE calculation logic
middleware.ts       # protect dashboard routes
```

## Database Tables
- `profiles` — user info: age, weight, height, goal, activity level, subscription tier
- `subscriptions` — Stripe subscription status per user
- `calorie_logs` — daily food entries (meal type, food name, calories, macros)
- `calorie_plans` — AI-generated plans stored as JSON

## Subscription Tiers
- **Free:** TDEE calculator + basic food logging
- **Pro (~$9/mo):** AI meal plan generation, macro tracking, unlimited plan history

## Known Quirks

- **`next.config.mjs`** — must be `.mjs`, not `.ts`. Next.js 14 does not support TypeScript config files.
- **Stripe `apiVersion`** — must be `'2024-06-20'` (the version supported by the installed `stripe@16` package). Do not change it.
- **`setAll` cookie type** — `@supabase/ssr` requires explicit typing: `(cookiesToSet: { name: string; value: string; options?: object }[])`. Without it, TypeScript raises an implicit-any error.
- **Working directory has a space** — `c:\Users\heynn\OneDrive\Documents\calories app`. Always quote paths in terminal commands.
- **Register flow** — after `signUp`, immediately calls `signInWithPassword` so the session is created even if email confirmation is disabled. Do not change this pattern.

## Key Rules
- Always use TypeScript — no plain JS files
- Use Supabase server client (with service role) for API routes, browser client for components
- Gate Pro features with a `requiresPro()` middleware check using the `subscriptions` table
- Claude API calls only happen server-side (never expose API key to client)
- All Stripe webhook events must verify the `stripe-signature` header
- Use the Mifflin-St Jeor formula for BMR calculations
- Keep components small — split UI and logic clearly

## Environment Variables Required
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ANTHROPIC_API_KEY
NEXT_PUBLIC_APP_URL
```

## BMR Formula (Mifflin-St Jeor)
- Men: `(10 × weight_kg) + (6.25 × height_cm) − (5 × age) + 5`
- Women: `(10 × weight_kg) + (6.25 × height_cm) − (5 × age) − 161`
- Multiply by activity multiplier for TDEE:
  - Sedentary: 1.2 | Light: 1.375 | Moderate: 1.55 | Active: 1.725 | Very active: 1.9

## AI Plan Generation (Pro)
- Endpoint: `POST /api/ai/generate-plan`
- Input: user profile (goal, TDEE, macros)
- Output: 7-day meal plan JSON with daily calories, meals, and macros
- Model: `claude-sonnet-4-20250514`
- Always respond with structured JSON — no markdown

## Code Style
- Functional components only, no class components
- Use `async/await`, not `.then()`
- Prefer `zod` for API input validation
- Name files in kebab-case, components in PascalCase

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.