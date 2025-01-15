import { ScrollArea } from "@/components/ui/scroll-area";
import { Task, TasksByDate, TaskPriority } from "@/types/task";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { useState, useMemo } from "react";
import TaskForm from "./TaskForm";
import { useToast } from "@/hooks/use-toast";
import TaskItem from "./TaskItem";
import DeleteCompletedButton from "./DeleteCompletedButton";
import { AnimatePresence } from "framer-motion";

interface TaskListProps {
  tasks: TasksByDate;
  onToggleTask: (taskId: string) => void;
  onTaskComplete: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask: (taskId: string, newTitle: string, newDuration: number, newPriority: TaskPriority) => void;
}

const TaskList = ({
  tasks,
  onToggleTask,
  onTaskComplete,
  onDeleteTask,
  onEditTask,
}: TaskListProps) => {
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const { toast } = useToast();

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, "EEEE, d בMMMM yyyy", { locale: he });
  };

  const handleEdit = (task: Task) => {
    setEditingTaskId(task.id);
  };

  const handleEditSubmit = (title: string, duration: number, priority: TaskPriority) => {
    if (editingTaskId) {
      onEditTask(editingTaskId, title, duration, priority);
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
    Object.values(tasks).forEach((tasksArray) => {
      tasksArray.forEach((task) => {
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

  const sortedDates = useMemo(
    () =>
      Object.keys(tasks).sort((a, b) => new Date(b).getTime() - new Date(a).getTime()),
    [tasks]
  );

  const sortTasks = useMemo(
    () => (tasksArray: Task[]) => {
      return [...tasksArray].sort((a, b) => {
        if (!a.completed && b.completed) return -1;
        if (a.completed && !b.completed) return 1;

        if (!a.completed && !b.completed) {
          const aRemaining = getRemainingTime(a);
          const bRemaining = getRemainingTime(b);

          const aUnderOneMinute = aRemaining <= 60;
          const bUnderOneMinute = bRemaining <= 60;

          if (aUnderOneMinute && !bUnderOneMinute) return -1;
          if (!aUnderOneMinute && bUnderOneMinute) return 1;

          return aRemaining - bRemaining;
        }

        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      });
    },
    []
  );

  const hasCompletedTasks = useMemo(
    () => Object.values(tasks).some((tasksArray) => tasksArray.some((task) => task.completed)),
    [tasks]
  );

  return (
    <ScrollArea className="h-[600px] w-full rounded-lg p-6">
      <AnimatePresence>
        {hasCompletedTasks && (
          <div className="mb-6">
            <DeleteCompletedButton onDelete={deleteCompletedTasks} />
          </div>
        )}
      </AnimatePresence>
      
      {sortedDates.map((date) => (
        <div key={date} className="mb-8 last:mb-0">
          <h2 className="text-2xl font-bold mb-4 text-right text-gray-800 dark:text-gray-200">
            {formatDate(date)}
          </h2>
          <div className="space-y-3">
            <AnimatePresence>
              {sortTasks(tasks[date]).map((task: Task) => (
                <div key={task.id}>
                  {editingTaskId === task.id ? (
                    <div className="mb-4 bg-purple-50 dark:bg-gray-700 p-4 rounded-lg">
                      <TaskForm
                        onAddTask={handleEditSubmit}
                        initialTitle={task.title}
                        initialDuration={task.duration}
                        initialPriority={task.priority}
                        submitLabel="עדכן"
                        onCancel={() => setEditingTaskId(null)}
                      />
                    </div>
                  ) : (
                    <TaskItem
                      task={task}
                      onToggleTask={onToggleTask}
                      onTaskComplete={onTaskComplete}
                      onDeleteTask={onDeleteTask}
                      onEdit={handleEdit}
                    />
                  )}
                </div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      ))}
    </ScrollArea>
  );
};

export default TaskList;