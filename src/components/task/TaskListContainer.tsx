import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import TaskListHeader from "./TaskListHeader";
import TaskListContent from "./TaskListContent";
import { useTaskSorting } from "@/hooks/useTaskSorting";
import { useTaskSearch } from "@/hooks/useTaskSearch";
import { TaskPriority } from "@/types/task";
import { useToast } from "@/hooks/use-toast";

interface TaskListContainerProps {
  workerId: string;
  selectedDate: Date;
  showArchived: boolean;
}

const TaskListContainer = ({
  workerId,
  selectedDate,
  showArchived,
}: TaskListContainerProps) => {
  const { toast } = useToast();

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks', workerId, selectedDate, showArchived],
    queryFn: async () => {
      const query = supabase
        .from('tasks')
        .select('*')
        .eq('worker', workerId)
        .eq('date', selectedDate.toISOString().split('T')[0]);

      if (!showArchived) {
        query.is('archived_at', null);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Transform the priority field to match TaskPriority type
      return data?.map(task => ({
        ...task,
        priority: (task.priority || 'normal') as TaskPriority
      })) || [];
    },
  });

  const tasksByDate = {
    [selectedDate.toISOString().split('T')[0]]: tasks
  };

  const { sortedTasks, sortBy, setSortBy } = useTaskSorting(tasksByDate);
  const { searchTerm, setSearchTerm, filteredTasks } = useTaskSearch(sortedTasks);

  const handleToggleTask = async (taskId: string) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      const { error } = await supabase
        .from('tasks')
        .update({
          start_time: task.startTime ? null : new Date().toISOString()
        })
        .eq('id', taskId);

      if (error) throw error;

      toast({
        title: task.startTime ? "משימה הופסקה" : "משימה התחילה",
        description: task.startTime ? "המשימה הופסקה בהצלחה" : "המשימה התחילה בהצלחה",
      });
    } catch (error) {
      console.error('Error toggling task:', error);
      toast({
        title: "שגיאה בעדכון משימה",
        description: "אנא נסה שנית",
        variant: "destructive",
      });
    }
  };

  const handleTaskComplete = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          completed: true,
          start_time: null
        })
        .eq('id', taskId);

      if (error) throw error;

      toast({
        title: "משימה הושלמה",
        description: "המשימה הושלמה בהצלחה",
      });
    } catch (error) {
      console.error('Error completing task:', error);
      toast({
        title: "שגיאה בהשלמת משימה",
        description: "אנא נסה שנית",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      toast({
        title: "משימה נמחקה",
        description: "המשימה נמחקה בהצלחה",
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: "שגיאה במחיקת משימה",
        description: "אנא נסה שנית",
        variant: "destructive",
      });
    }
  };

  const handleEditTask = async (taskId: string, newTitle: string, newDuration: number, newPriority: TaskPriority) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          title: newTitle,
          duration: newDuration,
          priority: newPriority
        })
        .eq('id', taskId);

      if (error) throw error;

      toast({
        title: "משימה עודכנה",
        description: "המשימה עודכנה בהצלחה",
      });
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: "שגיאה בעדכון משימה",
        description: "אנא נסה שנית",
        variant: "destructive",
      });
    }
  };

  return (
    <ScrollArea className="h-[600px] p-4">
      <TaskListHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />
      <TaskListContent
        tasksByDate={filteredTasks}
        isLoading={isLoading}
        onToggleTask={handleToggleTask}
        onTaskComplete={handleTaskComplete}
        onDeleteTask={handleDeleteTask}
        onEditTask={handleEditTask}
      />
    </ScrollArea>
  );
};

export default TaskListContainer;