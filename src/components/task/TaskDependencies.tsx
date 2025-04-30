
import { useState } from 'react';
import { Task } from '@/types/task';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link2, X, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

interface TaskDependenciesProps {
  task: Task;
  allTasks: Task[];
  onUpdateDependencies: (taskId: string, dependencies: string[]) => void;
}

const TaskDependencies = ({ 
  task, 
  allTasks,
  onUpdateDependencies 
}: TaskDependenciesProps) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  
  // Get array of dependent tasks from IDs
  const getDependentTasks = () => {
    if (!task.dependencies?.length) return [];
    return allTasks.filter(t => task.dependencies?.includes(t.id));
  };
  
  const dependentTasks = getDependentTasks();
  
  // Remove a dependency
  const removeDependency = (dependencyId: string) => {
    const newDependencies = task.dependencies?.filter(id => id !== dependencyId) || [];
    onUpdateDependencies(task.id, newDependencies);
    toast({
      title: "הקשר הוסר",
      description: "ההתניה בין המשימות הוסרה בהצלחה",
    });
  };
  
  // Add a new dependency
  const addDependency = (dependencyId: string) => {
    // Prevent circular dependencies
    if (isCyclicDependency(task.id, dependencyId, allTasks)) {
      toast({
        title: "שגיאה בהוספת התניה",
        description: "לא ניתן ליצור תלות מעגלית בין משימות",
        variant: "destructive",
      });
      return;
    }
    
    const newDependencies = [...(task.dependencies || []), dependencyId];
    onUpdateDependencies(task.id, newDependencies);
    setIsOpen(false);
    toast({
      title: "הקשר נוסף",
      description: "ההתניה בין המשימות נוספה בהצלחה",
    });
  };
  
  // Check for cyclic dependencies
  const isCyclicDependency = (taskId: string, newDependencyId: string, tasks: Task[]): boolean => {
    // If the task we want to depend on already depends on us (direct or indirect),
    // this would create a cycle
    const dependencyTask = tasks.find(t => t.id === newDependencyId);
    if (!dependencyTask) return false;
    
    // Check direct dependency
    if (dependencyTask.dependencies?.includes(taskId)) return true;
    
    // Check indirect dependencies recursively
    return dependencyTask.dependencies?.some(depId => 
      isCyclicDependency(taskId, depId, tasks)
    ) || false;
  };
  
  // Get available tasks for dependencies (exclude current task and tasks that would create cycles)
  const getAvailableTasks = () => {
    return allTasks.filter(t => 
      t.id !== task.id && 
      !task.dependencies?.includes(t.id) &&
      t.date <= task.date // Only allow dependencies on tasks due on or before this task
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Link2 className="h-4 w-4" />
          <span>משימות קשורות</span>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 px-2">
              <Plus className="h-4 w-4" />
              <span className="sr-only">הוסף קשר</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>הוספת תלות בין משימות</DialogTitle>
              <DialogDescription>
                בחר משימה שהמשימה הנוכחית תלויה בה:
              </DialogDescription>
            </DialogHeader>
            
            <ScrollArea className="max-h-[300px] overflow-y-auto mt-2">
              <div className="space-y-2 p-1">
                {getAvailableTasks().length > 0 ? (
                  getAvailableTasks().map(availableTask => (
                    <div 
                      key={availableTask.id}
                      className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <div>
                        <div className="font-medium">{availableTask.title}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(availableTask.date).toLocaleDateString()}
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => addDependency(availableTask.id)}
                      >
                        הוסף
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    אין משימות זמינות להוספה כתלות
                  </div>
                )}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {dependentTasks.length > 0 ? (
          dependentTasks.map(depTask => (
            <Badge 
              key={depTask.id} 
              variant="outline"
              className={`flex items-center gap-1 ${depTask.completed ? 'bg-green-100 dark:bg-green-900/20' : 'bg-gray-100 dark:bg-gray-800'}`}
            >
              <span className={depTask.completed ? 'line-through opacity-70' : ''}>{depTask.title}</span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-4 w-4 p-0 hover:bg-transparent" 
                onClick={() => removeDependency(depTask.id)}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">הסר</span>
              </Button>
            </Badge>
          ))
        ) : (
          <div className="text-sm text-gray-400 italic">אין תלויות</div>
        )}
      </div>
    </div>
  );
};

export default TaskDependencies;
