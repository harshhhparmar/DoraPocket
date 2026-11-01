-- ============================================================================
-- DoraPocket Birthday Studio — Supabase PostgreSQL Schema
-- Project ID: bwmsywizdfjakoghyjma
-- Instructions:
--   1. Open your Supabase Dashboard: https://supabase.com/dashboard/project/bwmsywizdfjakoghyjma/sql/new
--   2. Paste this entire SQL script into the SQL Editor and click "Run".
-- ============================================================================

-- 1. Create the `birthday_websites` table to store all generated birthday websites
create table if not exists public.birthday_websites (
  id text primary key,
  recipient_name text not null default 'Birthday Star',
  nickname text not null default '',
  age integer not null default 20,
  birthday_date text not null default '',
  sender_name text not null default 'Your Besties',
  relationship text not null default 'Best Friend',
  headline text not null default 'Happy Birthday! 🎂✨',
  personal_message text not null default '',
  letter_greeting text not null default '',
  letter_body text not null default '',
  letter_sign_off text not null default '',
  final_headline text not null default '',
  final_subtext text not null default '',
  memories jsonb not null default '[]'::jsonb,
  wishes jsonb not null default '[]'::jsonb,
  funny_moments jsonb not null default '[]'::jsonb,
  gadget_surprises jsonb not null default '[]'::jsonb,
  music jsonb not null default '{}'::jsonb,
  appearance jsonb not null default '{}'::jsonb,
  sections jsonb not null default '{}'::jsonb,
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Add helpful indexes for fast queries
create index if not exists idx_birthday_websites_recipient_name
  on public.birthday_websites (recipient_name);

create index if not exists idx_birthday_websites_updated_at
  on public.birthday_websites (updated_at desc);

-- 3. Trigger to automatically keep `updated_at` current on every save/edit
create or replace function public.handle_birthday_websites_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_birthday_websites_updated_at on public.birthday_websites;
create trigger trg_birthday_websites_updated_at
  before update on public.birthday_websites
  for each row
  execute function public.handle_birthday_websites_updated_at();

-- 4. Enable Row Level Security (RLS) & policies for the Publishable Key (anon / authenticated)
alter table public.birthday_websites enable row level security;

drop policy if exists "Allow public select on birthday_websites" on public.birthday_websites;
create policy "Allow public select on birthday_websites"
  on public.birthday_websites
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Allow public insert on birthday_websites" on public.birthday_websites;
create policy "Allow public insert on birthday_websites"
  on public.birthday_websites
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Allow public update on birthday_websites" on public.birthday_websites;
create policy "Allow public update on birthday_websites"
  on public.birthday_websites
  for update
  to anon, authenticated
  using (true)
  with check (true);

-- 5. Grant schema and table privileges to anon and authenticated roles
grant usage on schema public to anon, authenticated;
grant select, insert, update on table public.birthday_websites to anon, authenticated;

-- 6. Reload PostgREST schema cache immediately
notify pgrst, 'reload schema';
