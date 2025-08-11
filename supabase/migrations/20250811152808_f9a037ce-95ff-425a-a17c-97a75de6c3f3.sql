
-- 1) Fix linter warning: recreate update_updated_at_column with explicit search_path and security
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 2) Ensure is_call_participant has explicit search_path and security
create or replace function public.is_call_participant(_call_id uuid, _user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $function$
  select exists (
    select 1 from public.call_participants
    where call_id = _call_id and user_id = _user_id
  );
$function$;

-- 3) Enable RLS (idempotent)
alter table if exists public.profiles enable row level security;
alter table if exists public.contacts enable row level security;
alter table if exists public.calls enable row level security;
alter table if exists public.call_participants enable row level security;

-- 4) Create RLS policies only if they don't already exist

-- Profiles: allow all authenticated users to read basic info; only owners can insert/update their row
do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='profiles' and polname='Profiles: select for authenticated') then
    create policy "Profiles: select for authenticated"
      on public.profiles
      for select
      to authenticated
      using (true);
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='profiles' and polname='Profiles: insert own') then
    create policy "Profiles: insert own"
      on public.profiles
      for insert
      to authenticated
      with check (auth.uid() = id);
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='profiles' and polname='Profiles: update own') then
    create policy "Profiles: update own"
      on public.profiles
      for update
      to authenticated
      using (auth.uid() = id);
  end if;
end$$;

-- Contacts: only involved users can view/update/delete; only owner can create a request
do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='contacts' and polname='Contacts: select if involved') then
    create policy "Contacts: select if involved"
      on public.contacts
      for select
      to authenticated
      using (auth.uid() = owner_id or auth.uid() = contact_id);
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='contacts' and polname='Contacts: insert as owner') then
    create policy "Contacts: insert as owner"
      on public.contacts
      for insert
      to authenticated
      with check (auth.uid() = owner_id);
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='contacts' and polname='Contacts: update if involved') then
    create policy "Contacts: update if involved"
      on public.contacts
      for update
      to authenticated
      using (auth.uid() = owner_id or auth.uid() = contact_id);
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='contacts' and polname='Contacts: delete if involved') then
    create policy "Contacts: delete if involved"
      on public.contacts
      for delete
      to authenticated
      using (auth.uid() = owner_id or auth.uid() = contact_id);
  end if;
end$$;

-- Calls: creator/participants can read/update; any authenticated user can create
do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='calls' and polname='Calls: insert') then
    create policy "Calls: insert"
      on public.calls
      for insert
      to authenticated
      with check (auth.uid() = created_by);
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='calls' and polname='Calls: select if participant') then
    create policy "Calls: select if participant"
      on public.calls
      for select
      to authenticated
      using (public.is_call_participant(id, auth.uid()) or created_by = auth.uid());
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='calls' and polname='Calls: update if participant') then
    create policy "Calls: update if participant"
      on public.calls
      for update
      to authenticated
      using (public.is_call_participant(id, auth.uid()) or created_by = auth.uid());
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='calls' and polname='Calls: delete if participant') then
    create policy "Calls: delete if participant"
      on public.calls
      for delete
      to authenticated
      using (public.is_call_participant(id, auth.uid()) or created_by = auth.uid());
  end if;
end$$;

-- Call participants: user can insert/select/update/delete own membership; participants can read list
do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='call_participants' and polname='Call participants: insert self') then
    create policy "Call participants: insert self"
      on public.call_participants
      for insert
      to authenticated
      with check (auth.uid() = user_id);
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='call_participants' and polname='Call participants: select if participant') then
    create policy "Call participants: select if participant"
      on public.call_participants
      for select
      to authenticated
      using (public.is_call_participant(call_id, auth.uid()));
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='call_participants' and polname='Call participants: update own') then
    create policy "Call participants: update own"
      on public.call_participants
      for update
      to authenticated
      using (auth.uid() = user_id);
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='call_participants' and polname='Call participants: delete own') then
    create policy "Call participants: delete own"
      on public.call_participants
      for delete
      to authenticated
      using (auth.uid() = user_id);
  end if;
end$$;

-- 5) Helpful indexes and constraints

-- Unique, case-insensitive usernames
create unique index if not exists profiles_username_unique on public.profiles (lower(username));

-- Prevent duplicate contact pairs by same owner
create unique index if not exists contacts_owner_contact_unique on public.contacts (owner_id, contact_id);

-- 6) Ensure updated_at triggers exist (idempotent via presence check)
do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'set_updated_at_profiles_trg') then
    create trigger set_updated_at_profiles_trg
      before update on public.profiles
      for each row
      execute function public.update_updated_at_column();
  end if;

  if not exists (select 1 from pg_trigger where tgname = 'set_updated_at_contacts_trg') then
    create trigger set_updated_at_contacts_trg
      before update on public.contacts
      for each row
      execute function public.update_updated_at_column();
  end if;

  if not exists (select 1 from pg_trigger where tgname = 'set_updated_at_calls_trg') then
    create trigger set_updated_at_calls_trg
      before update on public.calls
      for each row
      execute function public.update_updated_at_column();
  end if;
end$$;
