-- Drop the existing overly permissive policies for project_files
DROP POLICY IF EXISTS "Users can create project files" ON public.project_files;
DROP POLICY IF EXISTS "Users can delete project files" ON public.project_files;
DROP POLICY IF EXISTS "Users can view project files" ON public.project_files;

-- Create secure RLS policies for project_files table
-- Users can only view files for projects they own
CREATE POLICY "Users can view files for their own projects" 
ON public.project_files 
FOR SELECT 
USING (project_id IN (
  SELECT id FROM public.projects 
  WHERE created_by = CURRENT_USER
));

-- Users can only create files for projects they own
CREATE POLICY "Users can create files for their own projects" 
ON public.project_files 
FOR INSERT 
WITH CHECK (project_id IN (
  SELECT id FROM public.projects 
  WHERE created_by = CURRENT_USER
));

-- Users can only delete files for projects they own
CREATE POLICY "Users can delete files for their own projects" 
ON public.project_files 
FOR DELETE 
USING (project_id IN (
  SELECT id FROM public.projects 
  WHERE created_by = CURRENT_USER
));