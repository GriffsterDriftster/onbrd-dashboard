# Onbrd Dashboard — v3.2
Clerk SSO • Stripe subscriptions & portal • Client picker (header) • Admin-only invites • Per-seat billing • Intercom importer

## Quick start (Windows / VS Code)
```powershell
npm install
copy .env.example .env
notepad .env   # paste Clerk + Stripe keys (below)
npx prisma generate
npx prisma migrate dev --name init
npm run seed   # optional demo data
npm run dev    # http://localhost:3001
```

### .env (required)
```
# DB (SQLite for local)
DATABASE_URL="file:./dev.db"

# App
NEXT_PUBLIC_APP_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=Onbrd Dashboard

# Clerk (Auth)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx

# Stripe (Billing)
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PRICE_ID=price_base_xxx
STRIPE_SEAT_PRICE_ID=price_seat_xxx     # optional, for per-seat
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Ingestion (optional)
DASHBOARD_AUTH_TOKEN=change-me

# Intercom importer (optional)
INTERCOM_ACCESS_TOKEN=xo_token_from_intercom
```

### Stripe webhook (local)
```powershell
stripe listen --forward-to localhost:3001/api/stripe/webhook
# put printed whsec_... in .env as STRIPE_WEBHOOK_SECRET
```

### Routes to test
- `/sign-in`, `/sign-up` — Clerk UI
- `/dashboard` — requires sign-in + active subscription
- `/billing` — Subscribe / Manage / Sync seats
- `/clients` — switch active client (cookie)
- `/clients/invite` — **admin-only** invites
- `/api/import/intercom` — POST importer (see code comments)
