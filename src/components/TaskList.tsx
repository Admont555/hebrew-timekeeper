import { ScrollArea } from "@/components/ui/scroll-area";
import { Task, TasksByDate } from "@/types/task";
import { format } from "date-fns";
import { he } from "date-fns/locale";

interface TaskListProps {
  tasks: TasksByDate;
  onToggleTask: (taskId: string) => void;
}

const TaskList = ({ tasks, onToggleTask }: TaskListProps) => {
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

  return (
    <ScrollArea className="h-[600px] w-full rounded-md border p-4">
      {dates.map((date) => (
        <div key={date} className="mb-6">
          <h2 className="text-xl font-bold mb-3 text-right">{formatDate(date)}</h2>
          <div className="space-y-2">
            {tasks[date].map((task: Task) => (
              <div
                key={task.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  task.completed ? "bg-muted" : "bg-card"
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => onToggleTask(task.id)}
                    className="h-5 w-5"
                  />
                  <span className={task.completed ? "line-through text-muted-foreground" : ""}>
                    {task.title}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {formatTime(task.timestamp)}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </ScrollArea>
  );
};

export default TaskList;