import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WorkerNameEditor from "@/components/WorkerNameEditor";
import { motion } from "framer-motion";
import TaskForm from "./TaskForm";
import TaskList from "./TaskList";
import { Task, TaskPriority } from "@/types/task";
import { TasksByDate } from "@/types/task";
import DateRangeSelector from "./task/DateRangeSelector";

interface WorkerTabsProps {
  currentWorker: 'worker1' | 'worker2';
  workerNames: { worker1: string; worker2: string };
  onWorkerChange: (value: 'worker1' | 'worker2') => void;
  onWorkerNameChange: (workerId: 'worker1' | 'worker2', newName: string) => void;
  onAddTask: (title: string, duration: number, priority: TaskPriority) => void;
  tasksByDate: TasksByDate;
  isLoading: boolean;
  onToggleTask: (taskId: string) => void;
  onTaskComplete: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask: (taskId: string, newTitle: string, newDuration: number, newPriority: TaskPriority) => void;
  selectedDate: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
}

const WorkerTabs = ({
  currentWorker,
  workerNames,
  onWorkerChange,
  onWorkerNameChange,
  onAddTask,
  tasksByDate,
  isLoading,
  onToggleTask,
  onTaskComplete,
  onDeleteTask,
  onEditTask,
  selectedDate,
  onDateChange
}: WorkerTabsProps) => {
  return (
    <Tabs 
      value={currentWorker} 
      onValueChange={onWorkerChange}
      className="w-full mb-6"
    >
      <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
        <TabsTrigger value="worker1" className="group relative flex items-center justify-center gap-1 px-2 py-1">
          {workerNames.worker1}
          <WorkerNameEditor
            currentName={workerNames.worker1}
            workerId="worker1"
            onNameChange={onWorkerNameChange}
          />
        </TabsTrigger>
        <TabsTrigger value="worker2" className="group relative flex items-center justify-center gap-1 px-2 py-1">
          {workerNames.worker2}
          <WorkerNameEditor
            currentName={workerNames.worker2}
            workerId="worker2"
            onNameChange={onWorkerNameChange}
          />
        </TabsTrigger>
      </TabsList>

      {['worker1', 'worker2'].map((worker) => (
        <TabsContent key={worker} value={worker}>
          <DateRangeSelector date={selectedDate} onDateChange={onDateChange} />
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="bg-white/80 backdrop-blur-sm dark:bg-gray-800/80 rounded-xl shadow-lg p-4 mb-6 hover:shadow-xl transition-shadow duration-300"
          >
            <TaskForm onAddTask={onAddTask} />
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="bg-white/80 backdrop-blur-sm dark:bg-gray-800/80 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            <TaskList 
              tasks={tasksByDate}
              isLoading={isLoading}
              onToggleTask={onToggleTask}
              onTaskComplete={onTaskComplete}
              onDeleteTask={onDeleteTask}
              onEditTask={onEditTask}
            />
          </motion.div>
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default WorkerTabs;