
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CircleChevronDown, Plus, Workflow, Pencil, Check, GitBranch } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";

interface WorkflowStep {
  id: string;
  label: string;
  duration?: number;
  priority?: string;
  children?: WorkflowStep[];
}

function WorkflowCreator() {
  const { workflowId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [editingStepId, setEditingStepId] = useState<string | null>(null);
  const [steps, setSteps] = useState<WorkflowStep[]>([
    {
      id: 'start',
      label: 'התחלה',
    }
  ]);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const addStep = () => {
    const newStep: WorkflowStep = {
      id: `step-${steps.length + 1}`,
      label: `שלב ${steps.length + 1}`,
    };
    setSteps([...steps, newStep]);
  };

  const splitStep = (stepId: string) => {
    setSteps(currentSteps => {
      const updateStep = (steps: WorkflowStep[]): WorkflowStep[] => {
        return steps.map(step => {
          if (step.id === stepId) {
            return {
              ...step,
              children: [
                {
                  id: `${step.id}-1`,
                  label: 'תוצאה 1',
                },
                {
                  id: `${step.id}-2`,
                  label: 'תוצאה 2',
                }
              ]
            };
          }
          return {
            ...step,
            children: step.children ? updateStep(step.children) : undefined
          };
        });
      };

      return updateStep(currentSteps);
    });

    toast({
      description: "השלב פוצל בהצלחה",
      duration: 2000,
    });
  };

  const updateStepLabel = (stepId: string, newLabel: string) => {
    const updateStep = (steps: WorkflowStep[]): WorkflowStep[] => {
      return steps.map(step => {
        if (step.id === stepId) {
          return { ...step, label: newLabel };
        }
        if (step.children) {
          return { ...step, children: updateStep(step.children) };
        }
        return step;
      });
    };

    setSteps(updateStep(steps));
    setEditingStepId(null);
    toast({
      description: "השלב עודכן בהצלחה",
      duration: 2000,
    });
  };

  const renderSteps = (steps: WorkflowStep[], level: number = 0) => {
    return (
      <div className="relative space-y-6">
        {steps.map((step, index) => (
          <div key={step.id} className="relative group">
            <div className="bg-background p-6 rounded-xl border border-border shadow-sm hover:border-primary/20 hover:shadow-md transition-all duration-300">
              {editingStepId === step.id ? (
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    const input = e.currentTarget.elements.namedItem('stepLabel') as HTMLInputElement;
                    if (input?.value.trim()) {
                      updateStepLabel(step.id, input.value.trim());
                    }
                  }}
                  className="flex items-center justify-center gap-2"
                >
                  <Input
                    name="stepLabel"
                    defaultValue={step.label}
                    autoFocus
                    className="text-lg text-center"
                  />
                  <Button 
                    size="icon" 
                    type="submit"
                    className="shrink-0"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                </form>
              ) : (
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 text-center">
                    <h3 className="font-medium text-lg text-foreground">{step.label}</h3>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => splitStep(step.id)}
                      className={step.children ? "hidden" : ""}
                    >
                      <GitBranch className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingStepId(step.id)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
            {step.children ? (
              <div className="mt-6 mr-8 space-y-6">
                {renderSteps(step.children, level + 1)}
              </div>
            ) : index < steps.length - 1 && (
              <>
                <div className="absolute right-8 -bottom-4 w-[1px] h-[calc(100%-1rem)] bg-gradient-to-b from-indigo-300/50 to-purple-300/50 dark:from-indigo-400/30 dark:to-purple-400/30" />
                <div className="absolute right-[26px] -bottom-6 z-10 bg-background rounded-full shadow-sm">
                  <CircleChevronDown 
                    className="h-6 w-6 text-primary/50 transition-all duration-300 group-hover:text-primary group-hover:scale-110" 
                  />
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background" dir="rtl">
        <div className="text-muted-foreground">טוען...</div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-gradient-to-br from-background to-background/50 px-4 py-8"
      dir="rtl"
    >
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="gap-2 hover:bg-accent transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            חזור
          </Button>
          <div className="flex items-center gap-3">
            <Workflow className="h-7 w-7 text-primary" />
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 dark:from-indigo-300 dark:to-purple-300">
              {workflowId ? 'עריכת זרימת עבודה' : 'יצירת זרימת עבודה'}
            </h1>
          </div>
        </div>

        <div className="rounded-2xl border bg-card/70 backdrop-blur-sm shadow-xl">
          <ScrollArea className="h-[calc(100vh-14rem)] px-8 pt-8">
            {renderSteps(steps)}
          </ScrollArea>
          
          <div className="px-8 py-6 border-t bg-muted/30 backdrop-blur-sm rounded-b-2xl">
            <Button
              onClick={addStep}
              variant="ghost"
              className="w-full h-auto py-4 border-2 border-dashed border-border hover:border-primary/20 hover:bg-accent transition-all duration-300 group"
            >
              <Plus className="h-6 w-6 text-primary/60 group-hover:text-primary group-hover:scale-110 transition-transform duration-300" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default WorkflowCreator;
