
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Task, TaskPriority } from "@/types/task";
import { ArrowLeft, Plus, Save, Workflow } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function WorkflowCreator() {
  const navigate = useNavigate();
  const [workflowName, setWorkflowName] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Check authentication status when component mounts
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "שגיאה",
          description: "יש להתחבר למערכת",
          variant: "destructive",
        });
        navigate('/login');
      }
    };
    
    checkAuth();
  }, [navigate]);

  const handleAddTask = (title: string, duration: number, priority: TaskPriority) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      duration,
      priority,
      timestamp: new Date().toISOString(),
      completed: false,
      date: new Date().toISOString().split('T')[0],
      worker: '',
      assigned_to: [],
    };

    setTasks([...tasks, newTask]);
    toast({
      title: "משימה נוספה",
      description: "המשימה נוספה לזרימת העבודה בהצלחה",
    });
  };

  const handleSaveWorkflow = async () => {
    if (!workflowName.trim()) {
      toast({
        title: "שגיאה",
        description: "יש להזין שם לזרימת העבודה",
        variant: "destructive",
      });
      return;
    }
    if (tasks.length === 0) {
      toast({
        title: "שגיאה",
        description: "יש להוסיף לפחות משימה אחת לזרימת העבודה",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      // First get the current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error("User not authenticated");
      }

      // Then create the workflow with the user's ID
      const { data: workflow, error: workflowError } = await supabase
        .from('workflows')
        .insert([
          { name: workflowName, user_id: user.id }
        ])
        .select()
        .single();

      if (workflowError) throw workflowError;

      if (workflow) {
        // Add tasks to the workflow
        const { error: tasksError } = await supabase
          .from('workflow_tasks')
          .insert(
            tasks.map((task, index) => ({
              workflow_id: workflow.id,
              title: task.title,
              duration: task.duration,
              priority: task.priority,
              position: { x: 0, y: index * 100 }
            }))
          );

        if (tasksError) throw tasksError;

        toast({
          title: "זרימת העבודה נשמרה",
          description: "זרימת העבודה נשמרה בהצלחה",
        });
        
        navigate('/workflows');
      }
    } catch (error) {
      console.error('Error saving workflow:', error);
      if (error instanceof Error && error.message === "User not authenticated") {
        toast({
          title: "שגיאה",
          description: "יש להתחבר למערכת",
          variant: "destructive",
        });
        navigate('/login');
      } else {
        toast({
          title: "שגיאה",
          description: "אירעה שגיאה בשמירת זרימת העבודה",
          variant: "destructive",
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto p-6" dir="rtl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            חזור
          </Button>
          <div className="flex items-center gap-2">
            <Workflow className="h-6 w-6 text-purple-500" />
            <h1 className="text-2xl font-bold">יצירת זרימת עבודה</h1>
          </div>
        </div>

        <Card className="p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="workflowName">שם זרימת העבודה</Label>
            <Input
              id="workflowName"
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              placeholder="הזן שם לזרימת העבודה..."
              className="max-w-md"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">משימות</h2>
              <span className="text-sm text-muted-foreground">
                {tasks.length} משימות
              </span>
            </div>
            
            <Button
              onClick={() => handleAddTask("משימה חדשה", 30, "normal")}
              className="w-full sm:w-auto gap-2"
            >
              <Plus className="h-4 w-4" />
              הוסף משימה
            </Button>

            <div className="space-y-3">
              {tasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg"
                >
                  <span className="text-sm font-medium text-muted-foreground">
                    {index + 1}.
                  </span>
                  <div className="flex-grow">
                    <h3 className="font-medium">{task.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{task.duration} דקות</span>
                      <span>•</span>
                      <span>
                        {task.priority === 'high' && 'עדיפות גבוהה'}
                        {task.priority === 'normal' && 'עדיפות רגילה'}
                        {task.priority === 'low' && 'עדיפות נמוכה'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <Button
            onClick={handleSaveWorkflow}
            className="w-full sm:w-auto gap-2"
            size="lg"
            disabled={isSaving}
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'שומר...' : 'שמור זרימת עבודה'}
          </Button>
        </Card>
      </motion.div>
    </div>
  );
}
