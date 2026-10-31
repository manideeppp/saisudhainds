# Sai Sudha Rice Mill — Expense Management

Premium web app for tracking mill expenses, categories, and customer receivables. Built with React, TypeScript, Tailwind CSS, Recharts, and Supabase.

## Quick start

1. **Install dependencies**

   ```bash
   npm install --legacy-peer-deps
   ```

2. **Configure Supabase** (see below), then copy environment variables:

   ```bash
   cp .env.example .env
   ```

3. **Run locally**

   ```bash
   npm run dev
   ```

4. **Production build**

   ```bash
   npm run build
   ```

## Supabase setup

### 1. Create a project

- Go to [supabase.com](https://supabase.com) and create a new project.
- In **Project Settings → API**, copy:
  - **Project URL** → `VITE_SUPABASE_URL`
  - **anon public** key → `VITE_SUPABASE_ANON_KEY`  
  Never put the **service_role** key in this app.

### 2. Run the database migration

In the Supabase **SQL Editor**, run the contents of:

`supabase/schema.sql`

This single file has finance, paddy intake, gunny dispatch, default categories, indexes, and RLS. **Safe to re-run the whole file** on an existing database (skips existing tables). Add future changes at the bottom of the same file.

### 3. Create the login user (one time)

Login uses **username** `9515320303` and **password** `Ssi@7007`. Supabase Auth needs an email, so the app maps username → email automatically:

- **Email (in Supabase only):** `9515320303@saisudhainds.local`
- **Password:** `Ssi@7007`

Steps: **Authentication → Users → Add user → Create new user**, enter the email and password above, then save.

Optional: disable public sign-ups under **Authentication → Providers** so no one else can register.

### 4. Environment variables

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon (public) key |

## Features

- **Dashboard** — monthly/today expenses, receivables summary, charts, recent activity
- **Expenses** — full CRUD with search and filters
- **Categories** — add/edit, activate/deactivate (history preserved)
- **Receivables** — partial/full payments, status and overdue days
- **Farmer paddy intake** — farmer, village, vehicle, way bill, bags, quintals, payment & due
- **IKP / PACS intake** — Grade A & Common bags/quintals, gunny old/new
- **Gunny dispatch** — gunnies sent to PPC centres with mandal
- **Rice delivery** — godown, variety, B/R, consignment, CK serial
- **By-products** — Bran/Thoudu, Nookalu, Param, Husk, Boodidha (separate pages under sidebar accordion)
- **Mill reports** — month-wise profit calculator, cash & dues, PDF profit report, full Excel workbook, CSV exports for paddy/rice/by-products

All amounts use Indian locale formatting (₹, lakh/crore grouping).

After pulling updates, re-run `supabase/schema.sql` in Supabase (adds **Boodidha** product type).
