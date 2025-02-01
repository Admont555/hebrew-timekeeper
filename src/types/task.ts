export type TaskPriority = 'low' | 'normal' | 'high';

export interface Task {
  id: string;
  title: string;
  timestamp: string;
  completed: boolean;
  date: string;
  duration: number;
  startTime?: string;
  priority: TaskPriority;
  comments?: string[];
  worker: string;  // Added this line
}

export interface TasksByDate {
  [date: string]: Task[];
}