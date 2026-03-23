
-- TABLE COLUMNS TABLE
CREATE TABLE public.table_columns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  table_id UUID NOT NULL REFERENCES public.tables(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'text',
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.table_columns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Table columns are viewable by authenticated users" ON public.table_columns FOR SELECT TO authenticated USING (true);
CREATE POLICY "Table columns can be inserted by authenticated users" ON public.table_columns FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Table columns can be updated by authenticated users" ON public.table_columns FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Table columns can be deleted by authenticated users" ON public.table_columns FOR DELETE TO authenticated USING (true);

-- TABLE ROWS TABLE
CREATE TABLE public.table_rows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  table_id UUID NOT NULL REFERENCES public.tables(id) ON DELETE CASCADE,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.table_rows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Table rows are viewable by authenticated users" ON public.table_rows FOR SELECT TO authenticated USING (true);
CREATE POLICY "Table rows can be inserted by authenticated users" ON public.table_rows FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Table rows can be updated by authenticated users" ON public.table_rows FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Table rows can be deleted by authenticated users" ON public.table_rows FOR DELETE TO authenticated USING (true);
CREATE TRIGGER update_table_rows_updated_at BEFORE UPDATE ON public.table_rows FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- TIME LOGS TABLE
CREATE TABLE public.time_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  worker TEXT NOT NULL,
  task_id UUID,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_time TIMESTAMP WITH TIME ZONE,
  duration INTEGER,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.time_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Time logs are viewable by authenticated users" ON public.time_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Time logs can be inserted by authenticated users" ON public.time_logs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Time logs can be updated by authenticated users" ON public.time_logs FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Time logs can be deleted by authenticated users" ON public.time_logs FOR DELETE TO authenticated USING (true);
