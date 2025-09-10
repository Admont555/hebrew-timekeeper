-- Drop the existing overly permissive policies for project_notes
DROP POLICY IF EXISTS "Users can create project notes" ON public.project_notes;
DROP POLICY IF EXISTS "Users can delete project notes" ON public.project_notes;
DROP POLICY IF EXISTS "Users can update project notes" ON public.project_notes;
DROP POLICY IF EXISTS "Users can view project notes" ON public.project_notes;

-- Create secure RLS policies for project_notes table
-- Users can only view project notes they created
CREATE POLICY "Users can view their own project notes" 
ON public.project_notes 
FOR SELECT 
USING (created_by = CURRENT_USER);

-- Users can only create project notes (created_by will be set automatically)
CREATE POLICY "Users can create their own project notes" 
ON public.project_notes 
FOR INSERT 
WITH CHECK (created_by = CURRENT_USER);

-- Users can only update project notes they created
CREATE POLICY "Users can update their own project notes" 
ON public.project_notes 
FOR UPDATE 
USING (created_by = CURRENT_USER)
WITH CHECK (created_by = CURRENT_USER);

-- Users can only delete project notes they created
CREATE POLICY "Users can delete their own project notes" 
ON public.project_notes 
FOR DELETE 
USING (created_by = CURRENT_USER);