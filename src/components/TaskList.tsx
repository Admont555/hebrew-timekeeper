
import { ScrollArea } from "@/components/ui/scroll-area";
import { Task, TasksByDate, TaskPriority } from "@/types/task";
import { useState, useRef } from "react";
import TaskForm from "./TaskForm";
import { useToast } from "@/hooks/use-toast";
import TaskListContent from "./task/TaskListContent";

interface TaskListProps {
  tasks: TasksByDate;
  isLoading: boolean;
  onToggleTask: (taskId: string) => void;
  onTaskComplete: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask: (taskId: string, newTitle: string, newDuration: number, newPriority: TaskPriority) => void;
}

const TaskList = ({
  tasks,
  isLoading,
  onToggleTask,
  onTaskComplete,
  onDeleteTask,
  onEditTask,
}: TaskListProps) => {
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const { toast } = useToast();
  const activeTaskRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const handleEdit = (task: Task) => {
    setEditingTaskId(task.id);
  };

  const handleEditSubmit = (title: string, duration: number, priority: TaskPriority) => {
    if (editingTaskId) {
      onEditTask(editingTaskId, title, duration, priority);
      setEditingTaskId(null);
    }
  };

  return (
    <ScrollArea ref={scrollAreaRef} className="flex-1 w-full rounded-lg p-6">
      {editingTaskId && (
        <div className="mb-4 bg-purple-50 dark:bg-gray-700 p-4 rounded-lg">
          <TaskForm
            onAddTask={handleEditSubmit}
            initialTitle={(tasks[Object.keys(tasks)[0]]?.find(t => t.id === editingTaskId)?.title) || ""}
            initialDuration={tasks[Object.keys(tasks)[0]]?.find(t => t.id === editingTaskId)?.duration || 0}
            initialPriority={tasks[Object.keys(tasks)[0]]?.find(t => t.id === editingTaskId)?.priority || "normal"}
            submitLabel="עדכן"
            onCancel={() => setEditingTaskId(null)}
          />
        </div>
      )}
      
      <TaskListContent
        tasksByDate={tasks}
        isLoading={isLoading}
        onToggleTask={onToggleTask}
        onTaskComplete={onTaskComplete}
        onDeleteTask={onDeleteTask}
        onEditTask={(taskId, newTitle, newDuration, newPriority) => {
          setEditingTaskId(null);
          onEditTask(taskId, newTitle, newDuration, newPriority);
        }}
      />
    </ScrollArea>
  );
};

export default TaskList;
