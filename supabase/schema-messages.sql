-- ============================================================
-- MESSAGES — portfolio contact form (service-role insert)
-- Run this in Supabase > SQL Editor, or re-run the full schema.
-- ============================================================
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