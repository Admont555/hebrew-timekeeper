
export type TaskPriority = 'low' | 'normal' | 'high';

export interface Category {
  id: string;
  name: string;
  color?: string;
}

export interface Tag {
  id: string;
  name: string;
  color?: string;
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
  attachments?: { name: string; url: string; }[];
  worker: string;
  categoryId?: string;
  orderIndex: number;
  assignedTo?: string[];
  dueDate?: string;
  reminderTime?: string;
  tags?: Tag[];
}

export interface TasksByDate {
  [date: string]: Task[];
}
