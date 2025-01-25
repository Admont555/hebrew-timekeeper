import WorkerTabs from "@/components/WorkerTabs";
import TaskFilters from "@/components/task/TaskFilters";
import { TaskPriority } from "@/types/task";
import { TasksByDate } from "@/types/task";

interface TaskHeaderProps {
  currentWorker: 'worker1' | 'worker2';
  workerNames: { worker1: string; worker2: string };
  onWorkerChange: (value: 'worker1' | 'worker2') => void;
  onWorkerNameChange: (workerId: 'worker1' | 'worker2', newName: string) => void;
  priorityFilter: TaskPriority | 'all';
  onPriorityChange: (value: TaskPriority | 'all') => void;
  sortBy: 'date' | 'priority' | 'duration';
  onSortChange: (value: 'date' | 'priority' | 'duration') => void;
  onAddTask: (title: string, duration: number, priority: TaskPriority) => void;
  tasksByDate: TasksByDate;
  isLoading: boolean;
}

const TaskHeader = ({
  currentWorker,
  workerNames,
  onWorkerChange,
  onWorkerNameChange,
  priorityFilter,
  onPriorityChange,
  sortBy,
  onSortChange,
  onAddTask,
  tasksByDate,
  isLoading,
}: TaskHeaderProps) => {
  return (
    <div className="space-y-6">
      <WorkerTabs
        currentWorker={currentWorker}
        workerNames={workerNames}
        onWorkerChange={onWorkerChange}
        onWorkerNameChange={onWorkerNameChange}
        onAddTask={onAddTask}
        tasksByDate={tasksByDate}
        isLoading={isLoading}
      />
      <TaskFilters
        priority={priorityFilter}
        onPriorityChange={onPriorityChange}
        sortBy={sortBy}
        onSortChange={onSortChange}
      />
    </div>
  );
};

export default TaskHeader;