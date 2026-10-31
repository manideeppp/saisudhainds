-- =============================================================================
-- Sai Sudha Rice Mill — full database schema (single file)
-- Safe to run the ENTIRE file in Supabase SQL Editor anytime (new or existing DB).
-- Append future changes at the bottom in dated sections (use IF NOT EXISTS / DROP IF EXISTS).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Shared
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- Finance: categories, expenses, receivables
-- -----------------------------------------------------------------------------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  expense_date date not null,
  category_id uuid not null references public.categories (id) on delete restrict,
  description text not null default '',
  paid_to text not null default '',
  payment_mode text not null check (
    payment_mode in ('Cash', 'UPI', 'Bank Transfer', 'Cheque')
  ),
  amount numeric(14, 2) not null check (amount > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.receivables (
  id uuid primary key default gen_random_uuid(),
  date_given date not null,
  party_name text not null,
  details text not null default '',
  amount_due numeric(14, 2) not null check (amount_due > 0),
  due_date date not null,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.receivable_payments (
  id uuid primary key default gen_random_uuid(),
  receivable_id uuid not null references public.receivables (id) on delete cascade,
  payment_date date not null,
  amount numeric(14, 2) not null check (amount > 0),
  notes text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists expenses_expense_date_idx on public.expenses (expense_date desc);
create index if not exists expenses_category_id_idx on public.expenses (category_id);
create index if not exists receivables_due_date_idx on public.receivables (due_date);
create index if not exists receivables_party_name_idx on public.receivables (party_name);
create index if not exists receivable_payments_receivable_id_idx on public.receivable_payments (receivable_id);

-- -----------------------------------------------------------------------------
-- Paddy & gunny
-- -----------------------------------------------------------------------------
create table if not exists public.farmer_paddy_intakes (
  id uuid primary key default gen_random_uuid(),
  intake_date date not null,
  farmer_name text not null,
  village text not null default '',
  vehicle_number text not null default '',
  way_bill_number text not null default '',
  paddy_name text not null default '',
  bags integer not null default 0 check (bags >= 0),
  quintals numeric(12, 3) not null check (quintals > 0),
  price_per_quintal numeric(14, 2) not null check (price_per_quintal >= 0),
  total_price numeric(14, 2) not null check (total_price >= 0),
  amount_paid numeric(14, 2) not null default 0 check (amount_paid >= 0),
  due_amount numeric(14, 2) not null default 0 check (due_amount >= 0),
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ikp_paddy_intakes (
  id uuid primary key default gen_random_uuid(),
  intake_date date not null,
  vehicle_number text not null default '',
  truck_sheet_number text not null default '',
  center_name text not null,
  grade_a_bags integer not null default 0 check (grade_a_bags >= 0),
  grade_a_quintals numeric(12, 3) not null default 0 check (grade_a_quintals >= 0),
  common_bags integer not null default 0 check (common_bags >= 0),
  common_quintals numeric(12, 3) not null default 0 check (common_quintals >= 0),
  gunny_old integer not null default 0 check (gunny_old >= 0),
  gunny_new integer not null default 0 check (gunny_new >= 0),
  price_per_quintal numeric(14, 2) not null default 0 check (price_per_quintal >= 0),
  total_price numeric(14, 2) not null default 0 check (total_price >= 0),
  amount_paid numeric(14, 2) not null default 0 check (amount_paid >= 0),
  due_amount numeric(14, 2) not null default 0 check (due_amount >= 0),
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.gunny_dispatches (
  id uuid primary key default gen_random_uuid(),
  dispatch_date date not null,
  ppc_center_name text not null,
  mandal text not null default '',
  gunny_count integer not null check (gunny_count > 0),
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists farmer_paddy_intakes_date_idx on public.farmer_paddy_intakes (intake_date desc);
create index if not exists farmer_paddy_intakes_farmer_idx on public.farmer_paddy_intakes (farmer_name);
create index if not exists ikp_paddy_intakes_date_idx on public.ikp_paddy_intakes (intake_date desc);
create index if not exists ikp_paddy_intakes_center_idx on public.ikp_paddy_intakes (center_name);
create index if not exists gunny_dispatches_date_idx on public.gunny_dispatches (dispatch_date desc);
create index if not exists gunny_dispatches_center_idx on public.gunny_dispatches (ppc_center_name);

-- -----------------------------------------------------------------------------
-- Rice delivery & by-products
-- -----------------------------------------------------------------------------
create table if not exists public.rice_deliveries (
  id uuid primary key default gen_random_uuid(),
  serial_no text not null default '',
  delivery_date date not null,
  vehicle_number text not null default '',
  way_bill_number text not null default '',
  godown_name text not null default '',
  variety text not null default '',
  community text not null default 'B' check (community in ('B', 'R')),
  bags integer not null default 0 check (bags >= 0),
  quintals numeric(12, 3) not null check (quintals > 0),
  consignment_number text not null default '',
  ck_serial text not null default '',
  price_per_quintal numeric(14, 2) not null default 0 check (price_per_quintal >= 0),
  total_price numeric(14, 2) not null default 0 check (total_price >= 0),
  amount_paid numeric(14, 2) not null default 0 check (amount_paid >= 0),
  due_amount numeric(14, 2) not null default 0 check (due_amount >= 0),
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.byproduct_sales (
  id uuid primary key default gen_random_uuid(),
  product_type text not null check (
    product_type in (
      'Bran / Thoudu',
      'Nookalu / Broken rice',
      'Param',
      'Husk',
      'Boodidha'
    )
  ),
  sale_date date not null,
  party_name text not null default '',
  quintals numeric(12, 3) not null check (quintals > 0),
  price_per_quintal numeric(14, 2) not null check (price_per_quintal >= 0),
  total_price numeric(14, 2) not null check (total_price >= 0),
  amount_given numeric(14, 2) not null default 0 check (amount_given >= 0),
  due_amount numeric(14, 2) not null default 0 check (due_amount >= 0),
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists rice_deliveries_date_idx on public.rice_deliveries (delivery_date desc);
create index if not exists rice_deliveries_godown_idx on public.rice_deliveries (godown_name);
create index if not exists byproduct_sales_date_idx on public.byproduct_sales (sale_date desc);
create index if not exists byproduct_sales_type_idx on public.byproduct_sales (product_type);

-- -----------------------------------------------------------------------------
-- updated_at triggers
-- -----------------------------------------------------------------------------
drop trigger if exists categories_set_updated_at on public.categories;
create trigger categories_set_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

drop trigger if exists expenses_set_updated_at on public.expenses;
create trigger expenses_set_updated_at
  before update on public.expenses
  for each row execute function public.set_updated_at();

drop trigger if exists receivables_set_updated_at on public.receivables;
create trigger receivables_set_updated_at
  before update on public.receivables
  for each row execute function public.set_updated_at();

drop trigger if exists farmer_paddy_intakes_set_updated_at on public.farmer_paddy_intakes;
create trigger farmer_paddy_intakes_set_updated_at
  before update on public.farmer_paddy_intakes
  for each row execute function public.set_updated_at();

drop trigger if exists ikp_paddy_intakes_set_updated_at on public.ikp_paddy_intakes;
create trigger ikp_paddy_intakes_set_updated_at
  before update on public.ikp_paddy_intakes
  for each row execute function public.set_updated_at();

drop trigger if exists gunny_dispatches_set_updated_at on public.gunny_dispatches;
create trigger gunny_dispatches_set_updated_at
  before update on public.gunny_dispatches
  for each row execute function public.set_updated_at();

drop trigger if exists rice_deliveries_set_updated_at on public.rice_deliveries;
create trigger rice_deliveries_set_updated_at
  before update on public.rice_deliveries
  for each row execute function public.set_updated_at();

drop trigger if exists byproduct_sales_set_updated_at on public.byproduct_sales;
create trigger byproduct_sales_set_updated_at
  before update on public.byproduct_sales
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Seed data
-- -----------------------------------------------------------------------------
insert into public.categories (name) values
  ('Paddy Purchase'),
  ('Labour & Wages'),
  ('Electricity'),
  ('Diesel & Fuel'),
  ('Transport'),
  ('Repairs & Maintenance'),
  ('Packing & Bags'),
  ('Food & Tea'),
  ('Office & Misc'),
  ('Other')
on conflict (name) do nothing;

-- -----------------------------------------------------------------------------
-- Row Level Security (authenticated users only)
-- -----------------------------------------------------------------------------
alter table public.categories enable row level security;
alter table public.expenses enable row level security;
alter table public.receivables enable row level security;
alter table public.receivable_payments enable row level security;
alter table public.farmer_paddy_intakes enable row level security;
alter table public.ikp_paddy_intakes enable row level security;
alter table public.gunny_dispatches enable row level security;
alter table public.rice_deliveries enable row level security;
alter table public.byproduct_sales enable row level security;

drop policy if exists "Authenticated full access on categories" on public.categories;
create policy "Authenticated full access on categories"
  on public.categories for all to authenticated using (true) with check (true);

drop policy if exists "Authenticated full access on expenses" on public.expenses;
create policy "Authenticated full access on expenses"
  on public.expenses for all to authenticated using (true) with check (true);

drop policy if exists "Authenticated full access on receivables" on public.receivables;
create policy "Authenticated full access on receivables"
  on public.receivables for all to authenticated using (true) with check (true);

drop policy if exists "Authenticated full access on receivable_payments" on public.receivable_payments;
create policy "Authenticated full access on receivable_payments"
  on public.receivable_payments for all to authenticated using (true) with check (true);

drop policy if exists "Authenticated full access on farmer_paddy_intakes" on public.farmer_paddy_intakes;
create policy "Authenticated full access on farmer_paddy_intakes"
  on public.farmer_paddy_intakes for all to authenticated using (true) with check (true);

drop policy if exists "Authenticated full access on ikp_paddy_intakes" on public.ikp_paddy_intakes;
create policy "Authenticated full access on ikp_paddy_intakes"
  on public.ikp_paddy_intakes for all to authenticated using (true) with check (true);

drop policy if exists "Authenticated full access on gunny_dispatches" on public.gunny_dispatches;
create policy "Authenticated full access on gunny_dispatches"
  on public.gunny_dispatches for all to authenticated using (true) with check (true);

drop policy if exists "Authenticated full access on rice_deliveries" on public.rice_deliveries;
create policy "Authenticated full access on rice_deliveries"
  on public.rice_deliveries for all to authenticated using (true) with check (true);

drop policy if exists "Authenticated full access on byproduct_sales" on public.byproduct_sales;
create policy "Authenticated full access on byproduct_sales"
  on public.byproduct_sales for all to authenticated using (true) with check (true);

-- -----------------------------------------------------------------------------
-- Column upgrades (safe if tables already existed before payment fields)
-- -----------------------------------------------------------------------------
alter table public.ikp_paddy_intakes
  add column if not exists price_per_quintal numeric(14, 2) not null default 0 check (price_per_quintal >= 0);

alter table public.ikp_paddy_intakes
  add column if not exists total_price numeric(14, 2) not null default 0 check (total_price >= 0);

alter table public.ikp_paddy_intakes
  add column if not exists amount_paid numeric(14, 2) not null default 0 check (amount_paid >= 0);

alter table public.ikp_paddy_intakes
  add column if not exists due_amount numeric(14, 2) not null default 0 check (due_amount >= 0);

alter table public.rice_deliveries
  add column if not exists price_per_quintal numeric(14, 2) not null default 0 check (price_per_quintal >= 0);

alter table public.rice_deliveries
  add column if not exists total_price numeric(14, 2) not null default 0 check (total_price >= 0);

alter table public.rice_deliveries
  add column if not exists amount_paid numeric(14, 2) not null default 0 check (amount_paid >= 0);

alter table public.rice_deliveries
  add column if not exists due_amount numeric(14, 2) not null default 0 check (due_amount >= 0);

-- Boodidha by-product (relax product_type check on existing DBs)
alter table public.byproduct_sales drop constraint if exists byproduct_sales_product_type_check;

update public.byproduct_sales
set product_type = 'Boodidha'
where product_type = 'Buddibha';

alter table public.byproduct_sales add constraint byproduct_sales_product_type_check check (
  product_type in (
    'Bran / Thoudu',
    'Nookalu / Broken rice',
    'Param',
    'Husk',
    'Boodidha'
  )
);

-- -----------------------------------------------------------------------------
-- Seasons (Kharif / Rabi) — run on existing DBs
-- -----------------------------------------------------------------------------
create table if not exists public.seasons (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  season_type text not null check (season_type in ('Kharif', 'Rabi')),
  start_date date not null,
  end_date date not null,
  status text not null default 'active' check (status in ('active', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists seasons_one_active_idx on public.seasons (status)
  where (status = 'active');

create table if not exists public.season_opening_stocks (
  season_id uuid primary key references public.seasons (id) on delete cascade,
  paddy_quintals numeric(14, 3) not null default 0 check (paddy_quintals >= 0),
  rice_quintals numeric(14, 3) not null default 0 check (rice_quintals >= 0),
  gunny_count integer not null default 0 check (gunny_count >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists public.rice_millings (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references public.seasons (id) on delete restrict,
  milling_date date not null,
  paddy_quintals numeric(14, 3) not null default 0 check (paddy_quintals >= 0),
  rice_quintals numeric(14, 3) not null check (rice_quintals > 0),
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.expenses add column if not exists season_id uuid references public.seasons (id);
alter table public.receivables add column if not exists season_id uuid references public.seasons (id);
alter table public.receivables add column if not exists carried_from_id uuid references public.receivables (id);
alter table public.farmer_paddy_intakes add column if not exists season_id uuid references public.seasons (id);
alter table public.ikp_paddy_intakes add column if not exists season_id uuid references public.seasons (id);
alter table public.gunny_dispatches add column if not exists season_id uuid references public.seasons (id);
alter table public.rice_deliveries add column if not exists season_id uuid references public.seasons (id);
alter table public.byproduct_sales add column if not exists season_id uuid references public.seasons (id);

create index if not exists expenses_season_id_idx on public.expenses (season_id);
create index if not exists receivables_season_id_idx on public.receivables (season_id);
create index if not exists farmer_paddy_intakes_season_id_idx on public.farmer_paddy_intakes (season_id);
create index if not exists ikp_paddy_intakes_season_id_idx on public.ikp_paddy_intakes (season_id);
create index if not exists gunny_dispatches_season_id_idx on public.gunny_dispatches (season_id);
create index if not exists rice_deliveries_season_id_idx on public.rice_deliveries (season_id);
create index if not exists byproduct_sales_season_id_idx on public.byproduct_sales (season_id);
create index if not exists rice_millings_season_id_idx on public.rice_millings (season_id);

-- Default season + backfill existing rows
do $$
declare
  default_season_id uuid;
begin
  if not exists (select 1 from public.seasons limit 1) then
    insert into public.seasons (name, season_type, start_date, end_date, status)
    values (
      'Season 2025–26',
      'Kharif',
      '2025-06-01',
      '2026-05-31',
      'active'
    )
    returning id into default_season_id;

    insert into public.season_opening_stocks (season_id) values (default_season_id);
  else
    select id into default_season_id from public.seasons where status = 'active' limit 1;
    if default_season_id is null then
      select id into default_season_id from public.seasons order by start_date desc limit 1;
    end if;
  end if;

  update public.expenses set season_id = default_season_id where season_id is null;
  update public.receivables set season_id = default_season_id where season_id is null;
  update public.farmer_paddy_intakes set season_id = default_season_id where season_id is null;
  update public.ikp_paddy_intakes set season_id = default_season_id where season_id is null;
  update public.gunny_dispatches set season_id = default_season_id where season_id is null;
  update public.rice_deliveries set season_id = default_season_id where season_id is null;
  update public.byproduct_sales set season_id = default_season_id where season_id is null;
end $$;

-- Enforce season_id on new rows (nullable only during migration above)
alter table public.expenses alter column season_id set not null;
alter table public.receivables alter column season_id set not null;
alter table public.farmer_paddy_intakes alter column season_id set not null;
alter table public.ikp_paddy_intakes alter column season_id set not null;
alter table public.gunny_dispatches alter column season_id set not null;
alter table public.rice_deliveries alter column season_id set not null;
alter table public.byproduct_sales alter column season_id set not null;

create or replace function public.assert_season_not_closed()
returns trigger
language plpgsql
as $$
declare
  s_status text;
  sid uuid;
begin
  if tg_op = 'DELETE' then
    sid := old.season_id;
  else
    sid := new.season_id;
  end if;

  if sid is null then
    raise exception 'season_id is required';
  end if;

  select status into s_status from public.seasons where id = sid;
  if s_status is null then
    raise exception 'Invalid season_id';
  end if;

  if s_status = 'closed' then
    if tg_op = 'INSERT' then
      raise exception 'Cannot add entries to a closed season';
    elsif tg_op = 'UPDATE' then
      raise exception 'Cannot edit entries in a closed season';
    elsif tg_op = 'DELETE' then
      raise exception 'Cannot delete entries in a closed season';
    end if;
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

drop trigger if exists expenses_season_guard on public.expenses;
create trigger expenses_season_guard
  before insert or update or delete on public.expenses
  for each row execute function public.assert_season_not_closed();

drop trigger if exists receivables_season_guard on public.receivables;
create trigger receivables_season_guard
  before insert or update or delete on public.receivables
  for each row execute function public.assert_season_not_closed();

drop trigger if exists farmer_paddy_season_guard on public.farmer_paddy_intakes;
create trigger farmer_paddy_season_guard
  before insert or update or delete on public.farmer_paddy_intakes
  for each row execute function public.assert_season_not_closed();

drop trigger if exists ikp_paddy_season_guard on public.ikp_paddy_intakes;
create trigger ikp_paddy_season_guard
  before insert or update or delete on public.ikp_paddy_intakes
  for each row execute function public.assert_season_not_closed();

drop trigger if exists gunny_season_guard on public.gunny_dispatches;
create trigger gunny_season_guard
  before insert or update or delete on public.gunny_dispatches
  for each row execute function public.assert_season_not_closed();

drop trigger if exists rice_delivery_season_guard on public.rice_deliveries;
create trigger rice_delivery_season_guard
  before insert or update or delete on public.rice_deliveries
  for each row execute function public.assert_season_not_closed();

drop trigger if exists byproduct_season_guard on public.byproduct_sales;
create trigger byproduct_season_guard
  before insert or update or delete on public.byproduct_sales
  for each row execute function public.assert_season_not_closed();

drop trigger if exists rice_milling_season_guard on public.rice_millings;
create trigger rice_milling_season_guard
  before insert or update or delete on public.rice_millings
  for each row execute function public.assert_season_not_closed();

drop trigger if exists seasons_set_updated_at on public.seasons;
create trigger seasons_set_updated_at
  before update on public.seasons
  for each row execute function public.set_updated_at();

drop trigger if exists rice_millings_set_updated_at on public.rice_millings;
create trigger rice_millings_set_updated_at
  before update on public.rice_millings
  for each row execute function public.set_updated_at();

alter table public.seasons enable row level security;
alter table public.season_opening_stocks enable row level security;
alter table public.rice_millings enable row level security;

drop policy if exists "Authenticated full access on seasons" on public.seasons;
create policy "Authenticated full access on seasons"
  on public.seasons for all to authenticated using (true) with check (true);

drop policy if exists "Authenticated full access on season_opening_stocks" on public.season_opening_stocks;
create policy "Authenticated full access on season_opening_stocks"
  on public.season_opening_stocks for all to authenticated using (true) with check (true);

drop policy if exists "Authenticated full access on rice_millings" on public.rice_millings;
create policy "Authenticated full access on rice_millings"
  on public.rice_millings for all to authenticated using (true) with check (true);

-- =============================================================================
-- Future changes: add below (example)
-- -- 2026-11-01: alter table public.expenses add column if not exists ...
-- =============================================================================
