-- AI Resume Builder — COMPLETE schema (run once in the CORRECT project: SQL Editor -> Run)
-- Safe to re-run: drops all legacy policies on these tables by name, then re-applies ours.

-- 1) LEADS — email capture after unlock
create table if not exists public.leads (
  id bigint generated always as identity primary key,
  email text not null,
  name text default '',
  tier text default 'pro',
  source text default 'checkout',
  created_at timestamptz not null default now()
);

-- 2) SHARED RESUMES — public read-only share links
create table if not exists public.shared_resumes (
  slug text primary key,
  data jsonb not null,
  created_at timestamptz not null default now()
);

-- 3) EVENTS — analytics
create table if not exists public.events (
  id bigint generated always as identity primary key,
  event_type text not null,
  meta jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- ---- wipe any pre-existing policies on these tables so only ours apply ----
do $$
declare p text;
begin
  for p in select polname from pg_policy where polrelid = 'public.leads'::regclass loop
    execute format('drop policy %I on public.leads', p);
  end loop;
  for p in select polname from pg_policy where polrelid = 'public.shared_resumes'::regclass loop
    execute format('drop policy %I on public.shared_resumes', p);
  end loop;
  for p in select polname from pg_policy where polrelid = 'public.events'::regclass loop
    execute format('drop policy %I on public.events', p);
  end loop;
end $$;

-- ---- (re)enable RLS ----
alter table public.leads enable row level security;
alter table public.shared_resumes enable row level security;
alter table public.events enable row level security;

-- ---- THE policies the app needs ----
create policy "leads anon insert" on public.leads
  for insert to anon with check (true);

create policy "shared_resumes anon insert" on public.shared_resumes
  for insert to anon with check (true);
create policy "shared_resumes public select" on public.shared_resumes
  for select to anon using (true);

create policy "events anon insert" on public.events
  for insert to anon with check (true);

-- anon privileges (policies allow, grants permit)
grant usage on schema public to anon;
grant all on table public.leads, public.shared_resumes, public.events to anon;
alter default privileges in schema public grant all on tables to anon;

-- admin-only reads use the service-role key (granted by default)

-- ---- admin view (service role reads this to inspect health) ----
drop view if exists public.db_health;
create view public.db_health as
  select 'leads' as tbl, count(*)::int as policy_count,
    exists(select 1 from pg_policy where polrelid='public.leads'::regclass and polname='leads anon insert') as app_policy
  from pg_policy where polrelid='public.leads'::regclass
  union all
  select 'shared_resumes', count(*)::int,
    exists(select 1 from pg_policy where polrelid='public.shared_resumes'::regclass and polname='shared_resumes anon insert')
  from pg_policy where polrelid='public.shared_resumes'::regclass
  union all
  select 'events', count(*)::int,
    exists(select 1 from pg_policy where polrelid='public.events'::regclass and polname='events anon insert')
  from pg_policy where polrelid='public.events'::regclass;

drop view if exists public.event_totals;
create view public.event_totals as
  select event_type, count(*) as total
  from public.events
  group by event_type
  order by total desc;

drop view if exists public.lead_totals;
create view public.lead_totals as
  select tier, count(*) as total
  from public.leads
  group by tier
  order by total desc;

-- 4) MESSAGES — portfolio contact form (service-role insert only)
create table if not exists public.messages (
  id bigint generated always as identity primary key,
  name text not null,
  email text not null,
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.messages enable row level security;

-- service role writes directly (bypasses RLS); anon readers get nothing
create policy "messages no anon access"
  on public.messages for all
  using (false)
  with check (false);
