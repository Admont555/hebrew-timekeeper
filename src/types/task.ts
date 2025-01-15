export interface Task {
  id: string;
  title: string;
  timestamp: string;
  completed: boolean;
  date: string;
  duration: number; // Duration in minutes
  startTime?: string; // When the task was started
}

export interface TasksByDate {
  [date: string]: Task[];
}