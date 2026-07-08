# RentFlow 🏠

> Simple property management for independent landlords with 1–20 units.

## Tech Stack
- **Frontend:** React 18 + Vite + TailwindCSS
- **Backend:** Supabase (Auth, PostgreSQL, Storage, Realtime)
- **State:** Zustand
- **Routing:** React Router v6
- **Hosting:** Vercel (recommended)

---

## 🚀 Quick Start

### 1. Clone & install
```bash
git clone <your-repo>
cd rentflow
npm install
```

### 2. Create a Supabase project
1. Go to https://supabase.com and create a new project
2. Go to **Settings → API** and copy your `Project URL` and `anon public` key

### 3. Set up environment variables
```bash
cp .env.example .env.local
```
Edit `.env.local` and fill in:
```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_APP_URL=http://localhost:5173
```

### 4. Run database migrations
In your Supabase dashboard, go to **SQL Editor** and run each file in order:
```
supabase/migrations/001_profiles.sql
supabase/migrations/002_properties.sql
supabase/migrations/003_tenants.sql
supabase/migrations/004_leases.sql
supabase/migrations/005_rent_ledger.sql
supabase/migrations/006_maintenance.sql
supabase/migrations/007_messages.sql
supabase/migrations/008_documents.sql
```

### 5. Create Storage Buckets
In Supabase dashboard → **Storage**, create 3 buckets:
- `documents` (private)
- `avatars` (public)
- `maintenance-photos` (private)

### 6. Start dev server
```bash
npm run dev
```
Open http://localhost:5173

---

## 📁 Project Structure
```
src/
├── lib/          # Supabase client, utils, constants
├── store/        # Zustand state (auth, properties, tenants)
├── hooks/        # Data fetching hooks
├── pages/        # Route pages (public + dashboard)
├── components/   # Reusable UI components
└── styles/       # Tailwind CSS
supabase/
└── migrations/   # SQL schema files (run in order)
```

---

## 🏗️ Build Phases

| Phase | Status | Description |
|-------|--------|-------------|
| 1 — Foundation | ✅ Done | Supabase schema, auth, routing, layouts |
| 2 — Landing Page | ✅ Done | Marketing page, login, register |
| 3 — Dashboard | 🔜 Next | Properties, tenants, rent ledger |
| 4 — Tenant Portal | 🔜 | Public portal with unique token URL |
| 5 — Maintenance | 🔜 | Ticket submission and tracking |
| 6 — Messages & Docs | 🔜 | In-app messaging, document uploads |
| 7 — Billing | 🔜 | Lemon Squeezy integration |

---

## 🌐 Deploy to Vercel
```bash
npm install -g vercel
vercel
```
Add your environment variables in Vercel dashboard → Project Settings → Environment Variables.

---

## 💰 Pricing Tiers
| Plan | Price | Units |
|------|-------|-------|
| Free | $0/mo | 3 |
| Pro | $29/mo | 20 |
| Growth | $49/mo | Unlimited |
