-- Helper function to maintain updated_at columns
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Security definer function to check if a user participates in a call
CREATE OR REPLACE FUNCTION public.is_call_participant(_call_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.call_participants
    WHERE call_id = _call_id AND user_id = _user_id
  );
$$;

-- PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE,
  display_name text,
  avatar_url text,
  status text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DO $$ BEGIN
  CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Profiles trigger
DO $$ BEGIN
  CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- CONTACTS
CREATE TABLE IF NOT EXISTS public.contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT contacts_owner_contact_unique UNIQUE (owner_id, contact_id),
  CONSTRAINT contacts_valid_status CHECK (status IN ('pending','accepted','blocked'))
);

ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Contacts policies
DO $$ BEGIN
  CREATE POLICY "Users can view own contact relationships"
  ON public.contacts FOR SELECT
  USING (owner_id = auth.uid() OR contact_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can create contact requests for themselves"
  ON public.contacts FOR INSERT
  WITH CHECK (owner_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their contact relationships"
  ON public.contacts FOR UPDATE
  USING (owner_id = auth.uid() OR contact_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete their contact relationships"
  ON public.contacts FOR DELETE
  USING (owner_id = auth.uid() OR contact_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Contacts trigger
DO $$ BEGIN
  CREATE TRIGGER set_contacts_updated_at
  BEFORE UPDATE ON public.contacts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- CALLS
CREATE TABLE IF NOT EXISTS public.calls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'ringing',
  ended_at timestamptz,
  CONSTRAINT calls_valid_status CHECK (status IN ('ringing','active','ended'))
);

ALTER TABLE public.calls ENABLE ROW LEVEL SECURITY;

-- Calls policies
DO $$ BEGIN
  CREATE POLICY "Participants can view calls they belong to"
  ON public.calls FOR SELECT
  USING (public.is_call_participant(id, auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Creators can insert their own calls"
  ON public.calls FOR INSERT
  WITH CHECK (created_by = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Participants can update calls they belong to"
  ON public.calls FOR UPDATE
  USING (public.is_call_participant(id, auth.uid()) OR created_by = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Calls trigger
DO $$ BEGIN
  CREATE TRIGGER set_calls_updated_at
  BEFORE UPDATE ON public.calls
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- CALL PARTICIPANTS
CREATE TABLE IF NOT EXISTS public.call_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id uuid NOT NULL REFERENCES public.calls(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL,
  joined_at timestamptz NOT NULL DEFAULT now(),
  left_at timestamptz,
  CONSTRAINT call_participants_valid_role CHECK (role IN ('caller','callee')),
  CONSTRAINT call_participants_unique UNIQUE (call_id, user_id)
);

ALTER TABLE public.call_participants ENABLE ROW LEVEL SECURITY;

-- Call participants policies (use security definer to avoid recursion)
DO $$ BEGIN
  CREATE POLICY "Participants can view participants of their calls"
  ON public.call_participants FOR SELECT
  USING (public.is_call_participant(call_id, auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can add themselves to a call"
  ON public.call_participants FOR INSERT
  WITH CHECK (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their own participant row"
  ON public.call_participants FOR UPDATE
  USING (user_id = auth.uid() OR public.is_call_participant(call_id, auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete their own participant row"
  ON public.call_participants FOR DELETE
  USING (user_id = auth.uid() OR public.is_call_participant(call_id, auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_contacts_owner ON public.contacts(owner_id);
CREATE INDEX IF NOT EXISTS idx_contacts_contact ON public.contacts(contact_id);
CREATE INDEX IF NOT EXISTS idx_call_participants_call ON public.call_participants(call_id);
CREATE INDEX IF NOT EXISTS idx_call_participants_user ON public.call_participants(user_id);
