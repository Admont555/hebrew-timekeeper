-- Allow anonymous access for worker-based app flow
CREATE POLICY "Tasks are viewable by anonymous users"
ON public.tasks
FOR SELECT
TO anon
USING (true);

CREATE POLICY "Tasks can be inserted by anonymous users"
ON public.tasks
FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "Tasks can be updated by anonymous users"
ON public.tasks
FOR UPDATE
TO anon
USING (true);

CREATE POLICY "Tasks can be deleted by anonymous users"
ON public.tasks
FOR DELETE
TO anon
USING (true);

CREATE POLICY "Team members are viewable by anonymous users"
ON public.team_members
FOR SELECT
TO anon
USING (true);

CREATE POLICY "Team members can be inserted by anonymous users"
ON public.team_members
FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "Team members can be updated by anonymous users"
ON public.team_members
FOR UPDATE
TO anon
USING (true);

CREATE POLICY "Team members can be deleted by anonymous users"
ON public.team_members
FOR DELETE
TO anon
USING (true);