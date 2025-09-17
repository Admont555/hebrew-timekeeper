-- Fix security vulnerability: Remove public access to tasks table
-- The current policies with "OR TRUE" make all tasks publicly accessible

-- Drop the overly permissive policies
DROP POLICY IF EXISTS "Workers can read their assigned tasks" ON public.tasks;
DROP POLICY IF EXISTS "Workers can update their assigned tasks" ON public.tasks; 
DROP POLICY IF EXISTS "Workers can delete their assigned tasks" ON public.tasks;
DROP POLICY IF EXISTS "Allow public task creation" ON public.tasks;

-- Create properly restrictive policies that only allow access to assigned workers
CREATE POLICY "Workers can read their assigned tasks" 
ON public.tasks 
FOR SELECT 
USING (worker = CURRENT_USER);

CREATE POLICY "Workers can update their assigned tasks"
ON public.tasks
FOR UPDATE  
USING (worker = CURRENT_USER)
WITH CHECK (worker = CURRENT_USER);

CREATE POLICY "Workers can delete their assigned tasks"
ON public.tasks
FOR DELETE
USING (worker = CURRENT_USER);

-- Allow task creation but ensure the worker field is set to the current user
CREATE POLICY "Workers can create tasks for themselves" 
ON public.tasks 
FOR INSERT 
WITH CHECK (worker = CURRENT_USER);