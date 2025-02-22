
export type StepType = 'approval' | 'task' | 'notification' | 'document' | 'automation';
export type StepPriority = 'low' | 'medium' | 'high';

export interface WorkflowStep {
  id: string;
  label: string;
  type: StepType;
  description?: string;
  duration?: number;
  priority?: StepPriority;
  isCollapsed?: boolean;
  children?: WorkflowStep[];
  conditions?: {
    type: 'and' | 'or';
    rules: Array<{
      field: string;
      operator: string;
      value: string;
    }>;
  };
  comments?: Array<{
    id: string;
    text: string;
    timestamp: string;
    userId: string;
  }>;
  attachments?: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
  }>;
}

export interface Workflow {
  id: string;
  name: string;
  steps: WorkflowStep[];
  created_at: string;
  updated_at: string;
  user_id: string;
}
