export interface Task {
  id: string;
  title: string;
  timestamp: string;
  completed: boolean;
  date: string;
}

export interface TasksByDate {
  [date: string]: Task[];
}