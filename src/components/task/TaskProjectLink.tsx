
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, X, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from '@/components/ui/scroll-area';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Project {
  id: string;
  title: string;
  status: string;
}

interface TaskProjectLinkProps {
  taskId: string;
  currentProjectId?: string;
  onUpdateProject: (taskId: string, projectId: string | null) => void;
}

const TaskProjectLink = ({ 
  taskId, 
  currentProjectId,
  onUpdateProject 
}: TaskProjectLinkProps) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  
  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('id, title, status')
        .eq('status', 'active')
        .order('title');

      if (error) throw error;
      return data as Project[];
    },
  });

  const { data: currentProject } = useQuery({
    queryKey: ['project', currentProjectId],
    queryFn: async () => {
      if (!currentProjectId) return null;
      
      const { data, error } = await supabase
        .from('projects')
        .select('id, title, status')
        .eq('id', currentProjectId)
        .single();

      if (error) throw error;
      return data as Project;
    },
    enabled: !!currentProjectId,
  });
  
  const handleRemoveProject = () => {
    onUpdateProject(taskId, null);
    toast({
      title: "הקישור לפרויקט הוסר",
      description: "המשימה כבר לא מקושרת לפרויקט",
    });
  };
  
  const handleAddProject = (projectId: string) => {
    onUpdateProject(taskId, projectId);
    setIsOpen(false);
    toast({
      title: "קושר לפרויקט",
      description: "המשימה קושרה בהצלחה לפרויקט",
    });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Building2 className="h-4 w-4" />
          <span>פרויקט</span>
        </div>
        
        {!currentProject && (
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 px-2">
                <Plus className="h-4 w-4" />
                <span className="sr-only">קשר לפרויקט</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>קישור משימה לפרויקט</DialogTitle>
                <DialogDescription>
                  בחר פרויקט לקישור המשימה:
                </DialogDescription>
              </DialogHeader>
              
              <ScrollArea className="max-h-[300px] overflow-y-auto mt-2">
                <div className="space-y-2 p-1">
                  {projects && projects.length > 0 ? (
                    projects.map(project => (
                      <div 
                        key={project.id}
                        className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        <div>
                          <div className="font-medium">{project.title}</div>
                          <div className="text-sm text-gray-500">
                            סטטוס: {project.status === 'active' ? 'פעיל' : project.status}
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleAddProject(project.id)}
                        >
                          קשר
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      אין פרויקטים זמינים
                    </div>
                  )}
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2">
        {currentProject ? (
          <Badge 
            variant="outline"
            className="flex items-center gap-1 bg-blue-100 dark:bg-blue-900/20"
          >
            <span>{currentProject.title}</span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-4 w-4 p-0 hover:bg-transparent" 
              onClick={handleRemoveProject}
            >
              <X className="h-3 w-3" />
              <span className="sr-only">הסר</span>
            </Button>
          </Badge>
        ) : (
          <div className="text-sm text-gray-400 italic">לא מקושר לפרויקט</div>
        )}
      </div>
    </div>
  );
};

export default TaskProjectLink;
