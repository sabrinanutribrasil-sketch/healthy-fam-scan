CREATE TABLE public.family_meal_planning (
 family_id uuid PRIMARY KEY REFERENCES public.families(id) ON DELETE CASCADE,
 pantry jsonb NOT NULL DEFAULT '[]'::jsonb,
 preferences jsonb NOT NULL DEFAULT '{}'::jsonb,
 plan jsonb,
 checked_items text[] NOT NULL DEFAULT '{}'::text[],
 generated_at timestamptz,
 updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.family_meal_planning TO authenticated;
GRANT ALL ON public.family_meal_planning TO service_role;
ALTER TABLE public.family_meal_planning ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Family members manage meal planning" ON public.family_meal_planning FOR ALL TO authenticated USING (family_id IN (SELECT family_id FROM public.profiles WHERE id = auth.uid())) WITH CHECK (family_id IN (SELECT family_id FROM public.profiles WHERE id = auth.uid()));
CREATE TRIGGER family_meal_planning_updated BEFORE UPDATE ON public.family_meal_planning FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();