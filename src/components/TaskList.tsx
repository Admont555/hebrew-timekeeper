import { ScrollArea } from "@/components/ui/scroll-area";
import { Task, TasksByDate } from "@/types/task";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import CountdownTimer from "./CountdownTimer";
import { Button } from "./ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import TaskForm from "./TaskForm";
import { useToast } from "@/hooks/use-toast";

interface TaskListProps {
  tasks: TasksByDate;
  onToggleTask: (taskId: string) => void;
  onTaskComplete: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask: (taskId: string, newTitle: string, newDuration: number) => void;
}

const TaskList = ({ tasks, onToggleTask, onTaskComplete, onDeleteTask, onEditTask }: TaskListProps) => {
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const { toast } = useToast();
  const dates = Object.keys(tasks).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, "EEEE, d בMMMM yyyy", { locale: he });
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("he-IL", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleEdit = (task: Task) => {
    setEditingTaskId(task.id);
  };

  const handleEditSubmit = (title: string, duration: number) => {
    if (editingTaskId) {
      onEditTask(editingTaskId, title, duration);
      setEditingTaskId(null);
    }
  };

  const getRemainingTime = (task: Task) => {
    if (!task.startTime || task.completed) return Infinity;
    const start = new Date(task.startTime).getTime();
    const now = new Date().getTime();
    const elapsedSeconds = Math.floor((now - start) / 1000);
    return task.duration * 60 - elapsedSeconds;
  };

  const deleteCompletedTasks = () => {
    let deletedCount = 0;
    Object.values(tasks).forEach(tasksArray => {
      tasksArray.forEach(task => {
        if (task.completed) {
          onDeleteTask(task.id);
          deletedCount++;
        }
      });
    });
    
    if (deletedCount > 0) {
      toast({
        title: "משימות הושלמו",
        description: `${deletedCount} משימות שהושלמו נמחקו בהצלחה`,
      });
    }
  };

  const sortTasks = (tasksArray: Task[]) => {
    return [...tasksArray].sort((a, b) => {
      // First, sort by completion status
      if (!a.completed && b.completed) return -1;
      if (a.completed && !b.completed) return 1;

      // For incomplete tasks, sort by remaining time
      if (!a.completed && !b.completed) {
        const aRemaining = getRemainingTime(a);
        const bRemaining = getRemainingTime(b);
        
        // Prioritize tasks with 1 minute or less remaining
        const aUnderOneMinute = aRemaining <= 60;
        const bUnderOneMinute = bRemaining <= 60;
        
        if (aUnderOneMinute && !bUnderOneMinute) return -1;
        if (!aUnderOneMinute && bUnderOneMinute) return 1;
        
        // If both are under one minute or both are over one minute,
        // sort by remaining time
        return aRemaining - bRemaining;
      }

      // For completed tasks, sort by timestamp (most recent first)
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
  };

  const hasCompletedTasks = Object.values(tasks).some(tasksArray => 
    tasksArray.some(task => task.completed)
  );

  return (
    <ScrollArea className="h-[600px] w-full rounded-md border p-4">
      {hasCompletedTasks && (
        <div className="mb-4 flex justify-end">
          <Button
            variant="destructive"
            size="sm"
            onClick={deleteCompletedTasks}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            מחק משימות שהושלמו
          </Button>
        </div>
      )}
      {dates.map((date) => (
        <div key={date} className="mb-6">
          <h2 className="text-xl font-bold mb-3 text-right">{formatDate(date)}</h2>
          <div className="space-y-2">
            {sortTasks(tasks[date]).map((task: Task) => (
              <div key={task.id}>
                {editingTaskId === task.id ? (
                  <div className="mb-4">
                    <TaskForm
                      onAddTask={handleEditSubmit}
                      initialTitle={task.title}
                      initialDuration={task.duration}
                      submitLabel="עדכן"
                      onCancel={() => setEditingTaskId(null)}
                    />
                  </div>
                ) : (
                  <div
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      task.completed ? "bg-muted" : "bg-card"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDeleteTask(task.id)}
                          className="h-8 w-8"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(task)}
                          className="h-8 w-8"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </div>
                      <CountdownTimer
                        duration={task.duration}
                        startTime={task.startTime}
                        isCompleted={task.completed}
                        onComplete={() => onTaskComplete(task.id)}
                      />
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => onToggleTask(task.id)}
                        className="h-5 w-5"
                      />
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={task.completed ? "line-through text-muted-foreground" : ""}>
                        {task.title}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {formatTime(task.timestamp)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </ScrollArea>
  );
};

export default TaskList;