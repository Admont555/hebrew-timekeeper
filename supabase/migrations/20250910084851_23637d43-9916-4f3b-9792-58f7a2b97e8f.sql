-- Drop the existing overly permissive policies
DROP POLICY IF EXISTS "Users can create projects" ON public.projects;
DROP POLICY IF EXISTS "Users can delete projects" ON public.projects;
DROP POLICY IF EXISTS "Users can update projects" ON public.projects;
DROP POLICY IF EXISTS "Users can view all projects" ON public.projects;

-- Create secure RLS policies for projects table
-- Users can only view projects they created
CREATE POLICY "Users can view their own projects" 
ON public.projects 
FOR SELECT 
USING (created_by = CURRENT_USER);

-- Users can only create projects (created_by will be set automatically)
CREATE POLICY "Users can create their own projects" 
ON public.projects 
FOR INSERT 
WITH CHECK (created_by = CURRENT_USER);

-- Users can only update projects they created
CREATE POLICY "Users can update their own projects" 
ON public.projects 
FOR UPDATE 
USING (created_by = CURRENT_USER)
WITH CHECK (created_by = CURRENT_USER);

-- Users can only delete projects they created
CREATE POLICY "Users can delete their own projects" 
ON public.projects 
FOR DELETE 
USING (created_by = CURRENT_USER);