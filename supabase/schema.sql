-- Supabase schema for reminders app

-- Table: public.reminders

create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  title text not null,
  due_at timestamptz not null,
  note text,
  completed boolean default false not null,
  recurring boolean default false not null,
  created_at timestamptz default now()
);

-- Row Level Security: only allow owners to manage their rows
alter table public.reminders enable row level security;

create policy "Allow logged-in users to insert their own reminders" on public.reminders
  for insert using (auth.role() = 'authenticated') with check (user_id = auth.uid());

create policy "Allow owners to select" on public.reminders
  for select using (user_id = auth.uid());

create policy "Allow owners to update/delete" on public.reminders
  for update, delete using (user_id = auth.uid());

-- Index for due_at to help queries
create index if not exists idx_reminders_due_at on public.reminders (due_at);
