
-- Create projects table
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by TEXT NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE,
  priority TEXT DEFAULT 'medium'
);

-- Create storage bucket for project files
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-files', 'project-files', true);

-- Enable RLS on projects table
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for projects
CREATE POLICY "Users can view all projects" 
  ON public.projects 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can create projects" 
  ON public.projects 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Users can update projects" 
  ON public.projects 
  FOR UPDATE 
  USING (true);

CREATE POLICY "Users can delete projects" 
  ON public.projects 
  FOR DELETE 
  USING (true);

-- Create RLS policies for storage
CREATE POLICY "Users can view project files" 
  ON storage.objects 
  FOR SELECT 
  USING (bucket_id = 'project-files');

CREATE POLICY "Users can upload project files" 
  ON storage.objects 
  FOR INSERT 
  WITH CHECK (bucket_id = 'project-files');

CREATE POLICY "Users can update project files" 
  ON storage.objects 
  FOR UPDATE 
  USING (bucket_id = 'project-files');

CREATE POLICY "Users can delete project files" 
  ON storage.objects 
  FOR DELETE 
  USING (bucket_id = 'project-files');

-- Create project_files table to track file associations
CREATE TABLE public.project_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  uploaded_by TEXT NOT NULL
);

-- Enable RLS on project_files table
ALTER TABLE public.project_files ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for project_files
CREATE POLICY "Users can view project files" 
  ON public.project_files 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can create project files" 
  ON public.project_files 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Users can delete project files" 
  ON public.project_files 
  FOR DELETE 
  USING (true);
