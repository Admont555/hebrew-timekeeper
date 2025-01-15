export interface Task {
  id: string;
  title: string;
  timestamp: string;
  completed: boolean;
  date: string;
  duration: number;
  startTime?: string;
  priority: 'low' | 'normal' | 'high';
}

export interface TasksByDate {
  [date: string]: Task[];
}