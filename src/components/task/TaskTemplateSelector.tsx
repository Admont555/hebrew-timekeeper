import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface TaskTemplate {
  id: string;
  title: string;
  duration: number;
  priority: 'low' | 'normal' | 'high';
}

interface TaskTemplateSelectorProps {
  onSelect: (template: TaskTemplate) => void;
}

const TaskTemplateSelector = ({ onSelect }: TaskTemplateSelectorProps) => {
  const { data: templates, isLoading } = useQuery({
    queryKey: ['task-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('task_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as TaskTemplate[];
    },
  });

  if (isLoading) {
    return <Loader2 className="h-4 w-4 animate-spin" />;
  }

  return (
    <Select onValueChange={(templateId) => {
      const template = templates?.find(t => t.id === templateId);
      if (template) onSelect(template);
    }}>
      <SelectTrigger className="w-full text-right" dir="rtl">
        <SelectValue placeholder="בחר תבנית" />
      </SelectTrigger>
      <SelectContent>
        {templates?.map((template) => (
          <SelectItem key={template.id} value={template.id}>
            {template.title}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default TaskTemplateSelector;