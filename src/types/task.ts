export type TaskPriority = 'low' | 'normal' | 'high';

export interface Task {
  id: string;
  title: string;
  timestamp: string;
  completed: boolean;
  date: string;
  duration: number;
  start_time?: string;
  priority: TaskPriority;
  comments?: string[];
  attachments?: { name: string; url: string; }[];
  worker: string;
  archived_at?: string;
  archived_by?: string;
  notification_time?: string;
  offline_id?: string;
  sync_status?: string;
  voice_note?: string;
}

export interface TasksByDate {
  [date: string]: Task[];
}