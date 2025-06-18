
-- Create a table for project notes
CREATE TABLE public.project_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by TEXT NOT NULL
);

-- Add Row Level Security (RLS)
ALTER TABLE public.project_notes ENABLE ROW LEVEL SECURITY;

-- Create policies for project notes access
CREATE POLICY "Users can view project notes" 
  ON public.project_notes 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can create project notes" 
  ON public.project_notes 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Users can update project notes" 
  ON public.project_notes 
  FOR UPDATE 
  USING (true);

CREATE POLICY "Users can delete project notes" 
  ON public.project_notes 
  FOR DELETE 
  USING (true);

-- Add trigger to update the updated_at column
CREATE TRIGGER update_project_notes_updated_at
  BEFORE UPDATE ON public.project_notes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
