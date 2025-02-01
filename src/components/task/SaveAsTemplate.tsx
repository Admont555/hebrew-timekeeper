import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Task } from "@/types/task";
import { Archive } from "lucide-react";

interface SaveAsTemplateProps {
  task: Task;
}

const SaveAsTemplate = ({ task }: SaveAsTemplateProps) => {
  const [isPublic, setIsPublic] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const saveTemplateMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('task_templates')
        .insert({
          title: task.title,
          duration: task.duration,
          priority: task.priority,
          is_public: isPublic,
          created_by: task.worker,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-templates'] });
      toast({
        title: "נשמר כתבנית",
        description: "המשימה נשמרה בהצלחה כתבנית",
      });
      setIsOpen(false);
    },
    onError: (error) => {
      toast({
        title: "שגיאה בשמירת התבנית",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="w-full justify-start">
          <Archive className="h-4 w-4 mr-2" />
          שמור כתבנית
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>שמור משימה כתבנית</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="public-template">שתף עם כל הצוות</Label>
            <Switch
              id="public-template"
              checked={isPublic}
              onCheckedChange={setIsPublic}
            />
          </div>
          <Button onClick={() => saveTemplateMutation.mutate()}>
            שמור כתבנית
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SaveAsTemplate;