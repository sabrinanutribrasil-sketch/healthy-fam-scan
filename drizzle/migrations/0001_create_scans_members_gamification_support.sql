CREATE TABLE IF NOT EXISTS public.scan_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid(),
  scan_type text NOT NULL CHECK (scan_type IN ('receipt', 'label')),
  result jsonb NOT NULL,
  score integer,
  store text,
  total numeric(10,2),
  item_count integer DEFAULT 0,
  healthy_count integer DEFAULT 0,
  warning_count integer DEFAULT 0,
  avoid_count integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.scan_history TO authenticated;
GRANT ALL ON public.scan_history TO service_role;
ALTER TABLE public.scan_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_own_family_scans" ON public.scan_history FOR SELECT TO authenticated
  USING (family_id IN (SELECT family_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "insert_own_family_scans" ON public.scan_history FOR INSERT TO authenticated
  WITH CHECK (family_id IN (SELECT family_id FROM public.profiles WHERE id = auth.uid()) AND user_id = auth.uid());
CREATE INDEX IF NOT EXISTS idx_scan_history_family_created ON public.scan_history(family_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.family_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  display_name text NOT NULL,
  age integer,
  role text NOT NULL DEFAULT 'membro',
  avatar_emoji text NOT NULL DEFAULT '👤',
  dietary_restrictions text[] NOT NULL DEFAULT '{}',
  allergies text[] NOT NULL DEFAULT '{}',
  nutrition_goals text,
  weight_kg numeric(5,2) CHECK (weight_kg IS NULL OR (weight_kg >= 0.5 AND weight_kg <= 500)),
  height_cm integer CHECK (height_cm IS NULL OR (height_cm >= 30 AND height_cm <= 250)),
  sex text CHECK (sex IS NULL OR sex IN ('Feminino', 'Masculino', 'Outro')),
  activity_level text CHECK (activity_level IS NULL OR activity_level IN ('Sedentário', 'Leve', 'Moderado', 'Ativo', 'Muito ativo')),
  occupation text,
  medical_conditions text[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.family_members TO authenticated;
GRANT ALL ON public.family_members TO service_role;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "family_members_own_family" ON public.family_members FOR ALL TO authenticated
  USING (family_id IN (SELECT family_id FROM public.profiles WHERE id = auth.uid()))
  WITH CHECK (family_id IN (SELECT family_id FROM public.profiles WHERE id = auth.uid()));
CREATE INDEX IF NOT EXISTS idx_family_members_family_id ON public.family_members(family_id);

CREATE TABLE IF NOT EXISTS public.family_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid NOT NULL UNIQUE REFERENCES public.families(id) ON DELETE CASCADE,
  total_points integer NOT NULL DEFAULT 0,
  streak_days integer NOT NULL DEFAULT 0,
  last_activity_date date,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.family_points TO authenticated;
GRANT ALL ON public.family_points TO service_role;
ALTER TABLE public.family_points ENABLE ROW LEVEL SECURITY;
CREATE POLICY "family_points_own_family" ON public.family_points FOR ALL TO authenticated
  USING (family_id IN (SELECT family_id FROM public.profiles WHERE id = auth.uid()))
  WITH CHECK (family_id IN (SELECT family_id FROM public.profiles WHERE id = auth.uid()));

CREATE TABLE IF NOT EXISTS public.family_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  achievement_key text NOT NULL,
  earned_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (family_id, achievement_key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.family_achievements TO authenticated;
GRANT ALL ON public.family_achievements TO service_role;
ALTER TABLE public.family_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "family_achievements_own_family" ON public.family_achievements FOR ALL TO authenticated
  USING (family_id IN (SELECT family_id FROM public.profiles WHERE id = auth.uid()))
  WITH CHECK (family_id IN (SELECT family_id FROM public.profiles WHERE id = auth.uid()));

CREATE TABLE IF NOT EXISTS public.support_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL CHECK (char_length(email) BETWEEN 3 AND 255),
  name text CHECK (name IS NULL OR char_length(name) <= 120),
  request_type text NOT NULL DEFAULT 'general_support' CHECK (request_type IN ('account_deletion', 'data_request', 'general_support')),
  subject text CHECK (subject IS NULL OR char_length(subject) <= 200),
  message text NOT NULL CHECK (char_length(message) BETWEEN 1 AND 5000),
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz
);
GRANT INSERT ON public.support_requests TO anon, authenticated;
GRANT ALL ON public.support_requests TO service_role;
ALTER TABLE public.support_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone_can_submit_support_request" ON public.support_requests FOR INSERT TO anon, authenticated
  WITH CHECK (status = 'pending' AND processed_at IS NULL);