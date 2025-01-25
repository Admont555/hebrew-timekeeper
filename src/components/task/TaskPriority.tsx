import { Flag } from "lucide-react";
import { TaskPriority as Priority } from "@/types/task";

interface TaskPriorityProps {
  priority: Priority;
}

const TaskPriority = ({ priority }: TaskPriorityProps) => {
  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'high':
        return 'text-red-500 dark:text-red-400';
      case 'normal':
        return 'text-yellow-500 dark:text-yellow-400';
      case 'low':
        return 'text-green-500 dark:text-green-400';
      default:
        return 'text-gray-500 dark:text-gray-400';
    }
  };

  const getPriorityText = (priority: Priority) => {
    switch (priority) {
      case 'high':
        return 'דחוף';
      case 'normal':
        return 'רגיל';
      case 'low':
        return 'נמוך';
      default:
        return '';
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Flag className={`h-4 w-4 ${getPriorityColor(priority)}`} />
      <span className={`text-sm ${getPriorityColor(priority)}`}>
        {getPriorityText(priority)}
      </span>
    </div>
  );
};

export default TaskPriority;