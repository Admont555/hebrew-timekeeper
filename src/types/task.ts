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
}

export interface TasksByDate {
  [date: string]: Task[];
}