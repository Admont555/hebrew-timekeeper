
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { WorkflowStep } from "@/types/workflow";
import { Plus, GitBranch, ChevronDown, ChevronRight, Trash2 } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { useParams } from "react-router-dom";

function WorkflowCreator() {
  const { workflowId } = useParams();
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const { toast } = useToast();

  const handleAddStep = (e: React.MouseEvent<HTMLButtonElement>, parentStepId?: string) => {
    e.preventDefault();
    const newStep: WorkflowStep = {
      id: `step-${crypto.randomUUID()}`,
      label: `שלב ${steps.length + 1}`,
      type: 'task',
      description: '',
      priority: 'medium',
    };

    setSteps(currentSteps => {
      if (!parentStepId) {
        return [...currentSteps, newStep];
      }

      const addStepToChildren = (steps: WorkflowStep[]): WorkflowStep[] => {
        return steps.map(step => {
          if (step.id === parentStepId) {
            return {
              ...step,
              children: step.children ? [...step.children, newStep] : [newStep]
            };
          }
          if (step.children) {
            return { ...step, children: addStepToChildren(step.children) };
          }
          return step;
        });
      };

      return addStepToChildren(currentSteps);
    });
  };

  const splitStep = (stepId: string) => {
    setSteps(currentSteps => {
      const updateStep = (steps: WorkflowStep[]): WorkflowStep[] => {
        return steps.map(step => {
          if (step.id === stepId) {
            const branch1: WorkflowStep = {
              id: `${step.id}-1`,
              label: 'תוצאה 1',
              type: 'task',
              description: '',
              priority: 'medium',
            };
            const branch2: WorkflowStep = {
              id: `${step.id}-2`,
              label: 'תוצאה 2',
              type: 'task',
              description: '',
              priority: 'medium',
            };
            return {
              ...step,
              children: [branch1, branch2]
            };
          }
          if (step.children) {
            return { ...step, children: updateStep(step.children) };
          }
          return step;
        });
      };

      return updateStep(currentSteps);
    });

    toast({
      description: "השלב פוצל בהצלחה",
      duration: 2000,
    });
  };

  const toggleCollapse = (stepId: string) => {
    setSteps(currentSteps => {
      const updateStep = (steps: WorkflowStep[]): WorkflowStep[] => {
        return steps.map(step => {
          if (step.id === stepId) {
            return {
              ...step,
              isCollapsed: !step.isCollapsed
            };
          }
          if (step.children) {
            return { ...step, children: updateStep(step.children) };
          }
          return step;
        });
      };

      return updateStep(currentSteps);
    });
  };

  const renderSteps = (steps: WorkflowStep[], level: number = 0) => {
    return (
      <div className="relative space-y-8">
        {steps.map((step, index) => (
          <motion.div 
            key={step.id} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="relative group"
          >
            <div className="bg-gradient-to-br from-white/80 to-purple-50/30 dark:from-gray-900/90 dark:to-purple-900/20 p-6 rounded-xl border border-purple-100/50 dark:border-purple-800/30 shadow-lg hover:shadow-purple-200/20 dark:hover:shadow-purple-900/20 hover:border-purple-200/50 dark:hover:border-purple-700/50 transition-all duration-300 ease-in-out backdrop-blur-md">
              <div className="flex items-start gap-4">
                <div className="flex-1 space-y-4">
                  <Input
                    value={step.label}
                    onChange={(e) => {
                      setSteps(currentSteps => {
                        const updateStepLabel = (steps: WorkflowStep[]): WorkflowStep[] => {
                          return steps.map(s => {
                            if (s.id === step.id) {
                              return { ...s, label: e.target.value };
                            }
                            if (s.children) {
                              return { ...s, children: updateStepLabel(s.children) };
                            }
                            return s;
                          });
                        };
                        return updateStepLabel(currentSteps);
                      });
                    }}
                    className="border-0 bg-transparent p-0 text-lg font-semibold focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                  <Textarea
                    value={step.description}
                    onChange={(e) => {
                      setSteps(currentSteps => {
                        const updateStepDescription = (steps: WorkflowStep[]): WorkflowStep[] => {
                          return steps.map(s => {
                            if (s.id === step.id) {
                              return { ...s, description: e.target.value };
                            }
                            if (s.children) {
                              return { ...s, children: updateStepDescription(s.children) };
                            }
                            return s;
                          });
                        };
                        return updateStepDescription(currentSteps);
                      });
                    }}
                    placeholder="תיאור השלב..."
                    className="border-0 bg-transparent resize-none focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => splitStep(step.id)}
                    className="hover:bg-purple-100/50 dark:hover:bg-purple-900/50"
                  >
                    <GitBranch className="h-4 w-4" />
                  </Button>
                  {step.children && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleCollapse(step.id)}
                      className="hover:bg-purple-100/50 dark:hover:bg-purple-900/50"
                    >
                      {step.isCollapsed ? (
                        <ChevronRight className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-purple-100/50 dark:hover:bg-purple-900/50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            {step.children && !step.isCollapsed && (
              <div className="mt-8">
                <div className="relative">
                  <div className="absolute right-8 top-0 w-[2px] h-8 bg-gradient-to-b from-purple-300 to-indigo-300 dark:from-purple-500/30 dark:to-indigo-500/30 animate-pulse" />
                  <div className={`${step.children.length === 2 ? 'grid grid-cols-2 gap-12' : 'flex flex-col gap-8'}`}>
                    {step.children.map((childStep, childIndex) => (
                      <div key={childStep.id} className="relative">
                        {step.children?.length === 2 && (
                          <div className="absolute -top-8 right-1/2 w-[calc(50%+3rem)] h-[2px] bg-gradient-to-l from-purple-300 to-indigo-300 dark:from-purple-500/30 dark:to-indigo-500/30 animate-pulse" />
                        )}
                        <div className="space-y-8">
                          {renderSteps([childStep], level + 1)}
                          <Button
                            onClick={(e) => handleAddStep(e, childStep.id)}
                            variant="ghost"
                            className="w-full h-auto py-4 border-2 border-dashed border-purple-200/50 dark:border-purple-700/30 hover:border-purple-300/50 dark:hover:border-purple-600/50 hover:bg-purple-100/30 dark:hover:bg-purple-900/30 transition-all duration-300 group"
                          >
                            <Plus className="h-4 w-4 text-purple-400 dark:text-purple-500 group-hover:text-purple-500 dark:group-hover:text-purple-400" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {index < steps.length - 1 && (
              <div className="absolute right-8 top-full w-[2px] h-8 bg-gradient-to-b from-purple-300 to-indigo-300 dark:from-purple-500/30 dark:to-indigo-500/30 animate-pulse" />
            )}
          </motion.div>
        ))}
      </div>
    );
  };

  return (
    <div className="container max-w-5xl py-8 space-y-8">
      <div className="space-y-8">
        {renderSteps(steps)}
        <Button
          onClick={(e) => handleAddStep(e)}
          variant="ghost"
          className="w-full h-auto py-4 border-2 border-dashed border-purple-200/50 dark:border-purple-700/30 hover:border-purple-300/50 dark:hover:border-purple-600/50 hover:bg-purple-100/30 dark:hover:bg-purple-900/30 transition-all duration-300 group"
        >
          <Plus className="h-4 w-4 text-purple-400 dark:text-purple-500 group-hover:text-purple-500 dark:group-hover:text-purple-400" />
        </Button>
      </div>
    </div>
  );
}

export default WorkflowCreator;
