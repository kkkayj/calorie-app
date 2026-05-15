# CalorieApp — Deployment Guide

## Hosting: Vercel (recommended, free tier available)

Vercel is made by the same team as Next.js. Deploying takes about 5 minutes.

---

## Pre-flight checklist (do these BEFORE deploying)

### 1. Build passes locally
Run this in your terminal:
```
npm run build
```
Must say "Compiled successfully" with no errors before you deploy.

### 2. All environment variables are filled in
Open `.env.local` and make sure every value is set:
- NEXT_PUBLIC_SUPABASE_URL ✓
- NEXT_PUBLIC_SUPABASE_ANON_KEY ✓
- SUPABASE_SERVICE_ROLE_KEY ✓
- STRIPE_SECRET_KEY ✓
- STRIPE_WEBHOOK_SECRET (you'll get a new one from Stripe after deploying)
- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ✓
- STRIPE_PRICE_ID ✓
- ANTHROPIC_API_KEY (add when ready)
- NEXT_PUBLIC_APP_URL (update to your live domain after deploying)

---

## Step-by-step: Deploy to Vercel

### Step 1 — Push your code to GitHub
1. Go to https://github.com and create a new repository called `calorie-app`
2. Make it Private (so your code stays safe)
3. In your terminal run:
   ```
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR-USERNAME/calorie-app.git
   git push -u origin main
   ```

### Step 2 — Connect to Vercel
1. Go to https://vercel.com and sign up (use your GitHub account)
2. Click "Add New Project"
3. Find your `calorie-app` repo and click "Import"
4. Leave all settings as default — Vercel detects Next.js automatically
5. Before clicking Deploy, click "Environment Variables"

### Step 3 — Add environment variables in Vercel
Add every variable from your `.env.local` file:
- Click "Add" for each one
- Name = the variable name (e.g. NEXT_PUBLIC_SUPABASE_URL)
- Value = the value
- Set NEXT_PUBLIC_APP_URL to your Vercel URL (you'll see it after first deploy)

Then click **Deploy**. Vercel will build and deploy your app automatically.

### Step 4 — Update Supabase auth URLs
After deploying, Supabase needs to know your production URL:
1. Go to Supabase → Authentication → URL Configuration
2. Set "Site URL" to your Vercel URL (e.g. https://calorie-app.vercel.app)
3. Add to "Redirect URLs": https://calorie-app.vercel.app/**

### Step 5 — Create a production Stripe webhook
The webhook secret you have now only works on your local machine (from the Stripe CLI).
For production you need a separate one:
1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. URL: https://your-vercel-url.vercel.app/api/stripe/webhook
4. Select events: checkout.session.completed, invoice.paid,
   customer.subscription.deleted, invoice.payment_failed
5. Copy the signing secret → update STRIPE_WEBHOOK_SECRET in Vercel settings
6. Redeploy (Vercel → your project → Deployments → Redeploy)

---

## Dev vs Production — what changes

| Thing | Development (localhost) | Production (Vercel) |
|---|---|---|
| URL | http://localhost:3000 | https://your-app.vercel.app |
| Stripe keys | Test keys (sk_test_, pk_test_) | Live keys (sk_live_, pk_live_) |
| Stripe webhook | Stripe CLI on your machine | Registered in Stripe dashboard |
| Supabase | Same project is fine to start | Can create a separate prod project later |
| ANTHROPIC_API_KEY | Optional for testing | Required for AI plans to work |

---

## After deploying — quick smoke test

1. Visit your live URL — landing page should appear
2. Register a new account — should redirect to onboarding
3. Complete onboarding → calculator should load with your stats
4. Add a food in the tracker — should save and appear instantly
5. Visit /plan — upgrade CTA should appear (or AI plan if you have Anthropic key)
