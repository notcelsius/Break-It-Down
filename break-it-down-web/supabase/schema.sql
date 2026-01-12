create extension if not exists "pgcrypto";

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id),
  title text not null,
  status text not null check (status in ('active', 'completed', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.steps (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id),
  step_index int not null check (step_index between 1 and 3),
  text text not null,
  done boolean not null default false,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger tasks_set_updated_at
before update on public.tasks
for each row execute function public.set_updated_at();

alter table public.tasks enable row level security;
alter table public.steps enable row level security;

create policy "Tasks are viewable by owner"
  on public.tasks for select
  using (user_id = auth.uid());

create policy "Tasks are insertable by owner"
  on public.tasks for insert
  with check (user_id = auth.uid());

create policy "Tasks are updatable by owner"
  on public.tasks for update
  using (user_id = auth.uid());

create policy "Tasks are deletable by owner"
  on public.tasks for delete
  using (user_id = auth.uid());

create policy "Steps are viewable by owner"
  on public.steps for select
  using (user_id = auth.uid());

create policy "Steps are insertable by owner"
  on public.steps for insert
  with check (user_id = auth.uid());

create policy "Steps are updatable by owner"
  on public.steps for update
  using (user_id = auth.uid());

create policy "Steps are deletable by owner"
  on public.steps for delete
  using (user_id = auth.uid());
