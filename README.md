# Sacred Living Planner

A luxury digital planner with subscription monetization, cross-device sync, and beautiful themes.

## Tech Stack

- **Frontend:** Next.js 14 + React + TypeScript + Tailwind CSS
- **Backend:** Supabase (Auth, PostgreSQL, Realtime, Storage)
- **Payments:** Stripe (web) + Apple In-App Purchase (native)
- **PWA:** next-pwa + workbox
- **State:** Zustand + Immer
- **Date:** date-fns

## Setup

### 1. Supabase

1. Create a new Supabase project at https://supabase.com
2. Go to SQL Editor → New Query
3. Copy and paste the contents of `sql/schema.sql`
4. Run the query

### 2. Environment Variables

Copy `.env.local.example` to `.env.local` and fill in:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID=price_...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Stripe Setup

1. Create products in Stripe Dashboard:
   - **Pro Monthly** - $5.99/month
   - **Pro Yearly** - $49.99/year (save 30%)
2. Copy price IDs to `.env.local`
3. Set webhook endpoint to `https://your-app.com/api/webhook/stripe`

### 4. Run Locally

```bash
npm install
npm run dev
```

## Project Structure

```
src/
  app/              # Next.js App Router
    auth/           # Login, signup, callback
    planner/        # Daily, weekly, monthly, yearly views
    api/            # API routes (auth, webhooks, subscription)
  components/       # React components
    ui/             # Reusable UI components
    planner/        # Planner-specific components
    layout/         # Layout components
    theme/          # Theme provider and switcher
  lib/              # Utilities, Supabase client, Stripe
  types/            # TypeScript types
  hooks/            # Custom React hooks
  stores/           # Zustand stores
```

## Features

### Free Tier
- ✅ Full planner functionality
- ✅ 3 themes (Sacred Living, Midnight Bloom, Sage Garden)
- ✅ Local + cloud sync
- ✅ Habit tracking
- ✅ Daily/weekly/monthly views
- ✅ Notes
- ✅ Health tracking (manual entry)

### Pro Tier ($5.99/mo or $49.99/yr)
- ✅ All free features
- ✅ 4+ premium themes (Blush Rose, Ocean Mist, Terracotta Sun)
- ✅ Custom theme creation (upload your own backgrounds)
- ✅ Unlimited habits
- ✅ Oura Ring integration
- ✅ Apple Health integration
- ✅ Data export (PDF, CSV)
- ✅ Priority sync

## Roadmap

### Phase 1: PWA (Current)
- [x] Database schema
- [ ] Next.js app structure
- [ ] Auth (email, Google, Apple)
- [ ] Core planner views
- [ ] Theme system
- [ ] Offline sync
- [ ] Stripe subscriptions
- [ ] PWA install

### Phase 2: Polish
- [ ] More themes
- [ ] Oura Health API
- [ ] Apple HealthKit (via Capacitor)
- [ ] Notifications
- [ ] Data import/export

### Phase 3: Native App
- [ ] Capacitor wrapper
- [ ] Apple In-App Purchase
- [ ] App Store submission

## License

MIT
