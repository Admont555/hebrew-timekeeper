
-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- TEAM MEMBERS TABLE
CREATE TABLE public.team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  worker_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  avatar_url TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Team members are viewable by authenticated users" ON public.team_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "Team members can be inserted by authenticated users" ON public.team_members FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Team members can be updated by authenticated users" ON public.team_members FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Team members can be deleted by authenticated users" ON public.team_members FOR DELETE TO authenticated USING (true);
CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON public.team_members FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- TASKS TABLE
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed BOOLEAN DEFAULT false,
  date TEXT,
  duration INTEGER,
  start_time TIMESTAMP WITH TIME ZONE,
  comments TEXT[] DEFAULT '{}',
  attachments JSONB DEFAULT '[]',
  priority TEXT DEFAULT 'normal',
  worker TEXT,
  assigned_to TEXT[] DEFAULT '{}',
  progress INTEGER DEFAULT 0,
  dependencies TEXT[] DEFAULT '{}',
  archived_at TIMESTAMP WITH TIME ZONE,
  archived_by TEXT,
  category_id TEXT,
  due_date TEXT,
  notification_time TEXT,
  offline_id TEXT,
  order_index INTEGER,
  reminder_time TEXT,
  sync_status TEXT,
  tags TEXT[] DEFAULT '{}',
  voice_note TEXT,
  project_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tasks are viewable by authenticated users" ON public.tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Tasks can be inserted by authenticated users" ON public.tasks FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Tasks can be updated by authenticated users" ON public.tasks FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Tasks can be deleted by authenticated users" ON public.tasks FOR DELETE TO authenticated USING (true);
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- PROJECTS TABLE
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active',
  priority TEXT DEFAULT 'normal',
  due_date TEXT,
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Projects are viewable by authenticated users" ON public.projects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Projects can be inserted by authenticated users" ON public.projects FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Projects can be updated by authenticated users" ON public.projects FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Projects can be deleted by authenticated users" ON public.projects FOR DELETE TO authenticated USING (true);
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- PROJECT NOTES TABLE
CREATE TABLE public.project_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.project_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Project notes are viewable by authenticated users" ON public.project_notes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Project notes can be inserted by authenticated users" ON public.project_notes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Project notes can be updated by authenticated users" ON public.project_notes FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Project notes can be deleted by authenticated users" ON public.project_notes FOR DELETE TO authenticated USING (true);
CREATE TRIGGER update_project_notes_updated_at BEFORE UPDATE ON public.project_notes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- PROJECT FILES TABLE
CREATE TABLE public.project_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  file_type TEXT,
  uploaded_by TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.project_files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Project files are viewable by authenticated users" ON public.project_files FOR SELECT TO authenticated USING (true);
CREATE POLICY "Project files can be inserted by authenticated users" ON public.project_files FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Project files can be deleted by authenticated users" ON public.project_files FOR DELETE TO authenticated USING (true);

-- TABLES TABLE
CREATE TABLE public.tables (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.tables ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tables are viewable by authenticated users" ON public.tables FOR SELECT TO authenticated USING (true);
CREATE POLICY "Tables can be inserted by authenticated users" ON public.tables FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Tables can be updated by authenticated users" ON public.tables FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Tables can be deleted by authenticated users" ON public.tables FOR DELETE TO authenticated USING (true);
CREATE TRIGGER update_tables_updated_at BEFORE UPDATE ON public.tables FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- QUOTES TABLE
CREATE TABLE public.quotes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  author TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Quotes are viewable by authenticated users" ON public.quotes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Quotes can be inserted by authenticated users" ON public.quotes FOR INSERT TO authenticated WITH CHECK (true);

-- WORKFLOWS TABLE
CREATE TABLE public.workflows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  steps JSONB DEFAULT '[]',
  user_id TEXT,
  position JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Workflows are viewable by authenticated users" ON public.workflows FOR SELECT TO authenticated USING (true);
CREATE POLICY "Workflows can be inserted by authenticated users" ON public.workflows FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Workflows can be updated by authenticated users" ON public.workflows FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Workflows can be deleted by authenticated users" ON public.workflows FOR DELETE TO authenticated USING (true);
CREATE TRIGGER update_workflows_updated_at BEFORE UPDATE ON public.workflows FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- STORAGE BUCKETS
INSERT INTO storage.buckets (id, name, public) VALUES ('project-files', 'project-files', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('table-attachments', 'table-attachments', true) ON CONFLICT (id) DO NOTHING;
CREATE POLICY "Authenticated users can upload files" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id IN ('project-files', 'table-attachments'));
CREATE POLICY "Anyone can view files" ON storage.objects FOR SELECT USING (bucket_id IN ('project-files', 'table-attachments'));
CREATE POLICY "Authenticated users can delete files" ON storage.objects FOR DELETE TO authenticated USING (bucket_id IN ('project-files', 'table-attachments'));

-- Insert default quotes
INSERT INTO public.quotes (content, author) VALUES
  ('הדרך הטובה ביותר לחזות את העתיד היא ליצור אותו', 'פיטר דראקר'),
  ('ההצלחה היא לא סופית, הכישלון אינו קטלני: האומץ להמשיך הוא שחשוב', 'וינסטון צ''רצ''יל'),
  ('כל מסע של אלף מילין מתחיל בצעד אחד', 'לאו צה'),
  ('אל תשפוט כל יום לפי הקציר שאתה קוצר, אלא לפי הזרעים שאתה שותל', 'רוברט לואיס סטיבנסון'),
  ('העתיד שייך לאלה שמאמינים ביופי החלומות שלהם', 'אלינור רוזוולט');
