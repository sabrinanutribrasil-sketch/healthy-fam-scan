
-- Families
create table public.families (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  join_code text not null unique default upper(substr(replace(gen_random_uuid()::text,'-',''),1,8)),
  owner_id uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  family_id uuid references public.families(id) on delete set null,
  display_name text not null default '',
  role text not null default 'owner',
  avatar_emoji text not null default '👤',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.families enable row level security;
alter table public.profiles enable row level security;

-- Profiles policies
create policy "Users view own profile" on public.profiles
  for select to authenticated using (auth.uid() = id);
create policy "Users insert own profile" on public.profiles
  for insert to authenticated with check (auth.uid() = id);
create policy "Users update own profile" on public.profiles
  for update to authenticated using (auth.uid() = id);

-- Families policies
create policy "Members view their family" on public.families
  for select to authenticated using (
    id in (select family_id from public.profiles where id = auth.uid())
  );
create policy "Owner updates family" on public.families
  for update to authenticated using (owner_id = auth.uid());
create policy "Owner deletes family" on public.families
  for delete to authenticated using (owner_id = auth.uid());
create policy "Authenticated can create family" on public.families
  for insert to authenticated with check (owner_id = auth.uid());

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger trg_families_updated before update on public.families
  for each row execute function public.set_updated_at();
create trigger trg_profiles_updated before update on public.profiles
  for each row execute function public.set_updated_at();

-- Auto create family + profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_family_id uuid;
  fam_name text;
  user_name text;
begin
  user_name := coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email,'@',1));
  fam_name := coalesce(new.raw_user_meta_data->>'family_name', user_name || ' Família');

  insert into public.families (name, owner_id)
  values (fam_name, new.id)
  returning id into new_family_id;

  insert into public.profiles (id, family_id, display_name, role)
  values (new.id, new_family_id, user_name, 'owner');

  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
