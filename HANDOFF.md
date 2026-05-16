# CalorieApp — Handoff Notes

## Where we left off

Everything is running on **localhost only** — nothing has been pushed to GitHub yet. The plan is to finish and test everything locally first, then push all at once.

---

## What's been built (complete)

### Core app (all 9 phases)
- Landing page with animated floating fruits + gradient hero
- Auth: register, login, onboarding
- Calculator: TDEE/BMR, saves to profile, redirects to `/next-steps` after saving
- Next-steps page: shows calorie target + two options (log food / get AI plan)
- Food Log (tracker): food search with USDA + Malaysian/Asian database, macro tracking (P/C/F), date navigation, progress bar
- Plan page: upgrade CTA (purple gradient) for free users, AI plan generator for Pro users
- Stripe: checkout, webhook, billing portal
- Supabase: 4 tables with RLS

### Recent additions this session
- **Malaysian/Asian food database** (`lib/local-foods.ts`) — 100+ foods including Korean, Japanese, Middle Eastern/kebab, Thai, drinks
- **Food search** (`app/api/food/search/route.ts`) — searches local foods first, then USDA
- **Macro tracking** — protein/carbs/fat saved per food entry, shown in tracker
- **Streak counter** — 🔥 shows consecutive days logged on the Food Log page
- **Animated floating fruits** — all background fruits now float with CSS animations
- **Alignment fixes** — calculator, tracker, plan pages all `mx-auto` centred

---

## What to build next (free plan features)

### 1. 7-day calorie chart
- Bar chart showing last 7 days
- Green bar = hit target, red bar = over target, grey = no data
- Goes on the tracker page or its own section
- Use Recharts library (or simple div-based bars — no library needed)

### 2. Weekly summary card
- "This week you averaged 1,820 cal/day and hit your target 5 out of 7 days"
- Show on tracker page, recalculates each time logs change

### 3. Water tracking
- Simple glass counter (tap + to add, shows X/8 glasses)
- Store in Supabase (`water_logs` table) or localStorage
- Show on tracker page

---

## Pro plan features (build after free plan is done)

Saved in memory but listed here too:
1. **Weekly AI nutrition report** — Monday summary via Claude: avg cal, days hit, nutrient gaps, one suggestion. Needs `/api/ai/weekly-report` endpoint + Pro gate.
2. **Custom macro targets** — Pro users set own protein/carbs/fat goals. Add 3 nullable columns to `profiles` table.
3. **Extended chart history** — free = 7 days, Pro = 30/90 days toggle.
4. **Save past AI plans** — free users limited to 1 plan, Pro keeps full history.

---

## Important technical notes

- **Working directory has a space**: `c:\Users\heynn\OneDrive\Documents\calories app` — always quote paths
- **next.config.mjs** must stay `.mjs` (not `.ts`)
- **Stripe apiVersion** must stay `'2024-06-20'`
- **USDA_API_KEY** is filled in `.env.local` — key: `FW9pZatGA9Rs2GES6oCUAzRcClyPoB7czEaSmVBI`
- **ANTHROPIC_API_KEY** is empty — AI meal plan won't work until filled in
- **Supabase macro columns** — `protein_g`, `carbs_g`, `fat_g` were added to `calorie_logs` table this session (user confirmed done)
- **Register flow** — always does `signUp` then immediate `signInWithPassword` — do not change this

## Key files
- `lib/local-foods.ts` — Malaysian/Asian food database (add foods here)
- `app/api/food/search/route.ts` — food search API (local first, then USDA)
- `app/api/streak/route.ts` — streak calculation
- `app/(dashboard)/tracker/page.tsx` — main food log page
- `app/(dashboard)/plan/upgrade-cta.tsx` — purple gradient Pro upgrade card
- `app/(dashboard)/plan/plan-generator.tsx` — AI meal plan UI
- `supabase/schema.sql` — all table definitions

---

## Deployment (not done yet)
- Code is committed locally (`git commit` done) but not pushed to GitHub
- Vercel project was set up and env vars added — waiting for push
- After pushing: update Supabase auth URLs + create production Stripe webhook
- See `DEPLOYMENT.md` for full steps
