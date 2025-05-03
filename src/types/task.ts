import { Json } from "@/integrations/supabase/types";

export type TaskPriority = "low" | "normal" | "high";

export interface Task {
  id: string;
  title: string;
  timestamp: string;
  completed: boolean;
  date: string;
  duration?: number;
  startTime?: string;
  comments?: string[];
  attachments?: Attachment[];
  priority: TaskPriority;
  worker?: string;
  assigned_to?: string[];
  progress: number;
  dependencies: string[];
  archived_at?: string;
  archived_by?: string;
  category_id?: string;
  due_date?: string;
  notification_time?: string;
  offline_id?: string;
  order_index?: number;
  reminder_time?: string;
  sync_status?: string;
  tags?: string[];
  voice_note?: string;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size?: number;
}

export interface TasksByDate {
  [date: string]: Task[];
}
