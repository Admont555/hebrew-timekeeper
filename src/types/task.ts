
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
