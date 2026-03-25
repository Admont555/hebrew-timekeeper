
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  color text NOT NULL DEFAULT '#6366f1',
  icon text DEFAULT '📁',
  worker_id text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are viewable by everyone" ON public.categories FOR SELECT TO public USING (true);
CREATE POLICY "Categories can be inserted by everyone" ON public.categories FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Categories can be updated by everyone" ON public.categories FOR UPDATE TO public USING (true);
CREATE POLICY "Categories can be deleted by everyone" ON public.categories FOR DELETE TO public USING (true);
