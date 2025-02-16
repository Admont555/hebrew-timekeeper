
import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Badge } from '@/components/ui/badge';

function WorkflowTaskNode({ data }: { data: { label: string; duration: number; priority: string } }) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-blue-500';
    }
  };

  return (
    <div className="bg-card p-4 rounded-lg border shadow-sm min-w-[200px]">
      <Handle type="target" position={Position.Top} className="!bg-muted-foreground" />
      <div className="space-y-2">
        <h3 className="font-medium text-sm">{data.label}</h3>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="secondary">{data.duration} דקות</Badge>
          <Badge className={getPriorityColor(data.priority)}>
            {data.priority === 'high' && 'עדיפות גבוהה'}
            {data.priority === 'normal' && 'עדיפות רגילה'}
            {data.priority === 'low' && 'עדיפות נמוכה'}
          </Badge>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-muted-foreground" />
    </div>
  );
}

export default memo(WorkflowTaskNode);
