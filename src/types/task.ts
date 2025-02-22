
export type TaskPriority = 'low' | 'normal' | 'high';

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
}

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
  attachments?: Attachment[];
  worker: string;
  assigned_to: string[];
}

export interface TasksByDate {
  [date: string]: Task[];
}
