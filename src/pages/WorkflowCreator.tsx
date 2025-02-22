import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  CircleChevronDown, 
  Plus, 
  Workflow, 
  Pencil, 
  Check, 
  GitBranch, 
  Trash2,
  FileText,
  CheckSquare,
  Bell,
  FileSpreadsheet,
  Zap,
  ChevronRight,
  ChevronDown,
  Paperclip,
  MessageSquare
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import TaskAttachments from "@/components/task/TaskAttachments";
import type { WorkflowStep, StepType, StepPriority } from "@/types/workflow";

const stepTypeIcons: Record<StepType, React.ReactNode> = {
  approval: <CheckSquare className="h-4 w-4" />,
  task: <FileSpreadsheet className="h-4 w-4" />,
  notification: <Bell className="h-4 w-4" />,
  document: <FileText className="h-4 w-4" />,
  automation: <Zap className="h-4 w-4" />,
};

const priorityColors: Record<StepPriority, string> = {
  low: "text-green-500 dark:text-green-400",
  medium: "text-yellow-500 dark:text-yellow-400",
  high: "text-red-500 dark:text-red-400",
};

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
      type: 'task',
      description: '',
      priority: 'medium',
    }
  ]);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const addStep = () => {
    const newStep: WorkflowStep = {
      id: `step-${steps.length + 1}`,
      label: `שלב ${steps.length + 1}`,
      type: 'task',
      description: '',
      priority: 'medium',
    };
    setSteps([...steps, newStep]);
  };

  const toggleCollapse = (stepId: string) => {
    setSteps(currentSteps => {
      const updateStepCollapse = (steps: WorkflowStep[]): WorkflowStep[] => {
        return steps.map(step => {
          if (step.id === stepId) {
            return { ...step, isCollapsed: !step.isCollapsed };
          }
          if (step.children) {
            return { ...step, children: updateStepCollapse(step.children) };
          }
          return step;
        });
      };
      return updateStepCollapse(currentSteps);
    });
  };

  const updateStep = (stepId: string, updates: Partial<WorkflowStep>) => {
    setSteps(currentSteps => {
      const updateStepRecursive = (steps: WorkflowStep[]): WorkflowStep[] => {
        return steps.map(step => {
          if (step.id === stepId) {
            return { ...step, ...updates };
          }
          if (step.children) {
            return { ...step, children: updateStepRecursive(step.children) };
          }
          return step;
        });
      };
      return updateStepRecursive(currentSteps);
    });
  };

  const deleteStep = (stepId: string) => {
    setSteps(currentSteps => {
      const deleteStepRecursive = (steps: WorkflowStep[]): WorkflowStep[] => {
        return steps.filter(step => {
          if (step.id === stepId) {
            return false;
          }
          if (step.children) {
            step.children = deleteStepRecursive(step.children);
          }
          return true;
        });
      };

      const newSteps = deleteStepRecursive(currentSteps);
      return newSteps;
    });

    toast({
      description: "השלב נמחק בהצלחה",
      duration: 2000,
    });
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
                  type: 'task',
                  description: '',
                  priority: 'medium'
                },
                {
                  id: `${step.id}-2`,
                  label: 'תוצאה 2',
                  type: 'task',
                  description: '',
                  priority: 'medium'
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

  const handleAttachmentsUpdate = (stepId: string, newAttachments: { name: string; url: string }[]) => {
    updateStep(stepId, { attachments: newAttachments });
    toast({
      description: "הקבצים המצורפים עודכנו בהצלחה",
      duration: 2000,
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
              {editingStepId === step.id ? (
                <Dialog open={true} onOpenChange={() => setEditingStepId(null)}>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>ערוך שלב</DialogTitle>
                      <DialogDescription>
                        ערוך את פרטי השלב
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <label htmlFor="stepName">שם השלב</label>
                        <Input
                          id="stepName"
                          defaultValue={step.label}
                          onChange={(e) => updateStep(step.id, { label: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <label htmlFor="stepType">סוג שלב</label>
                        <Select
                          value={step.type}
                          onValueChange={(value: StepType) => updateStep(step.id, { type: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="approval">אישור</SelectItem>
                            <SelectItem value="task">משימה</SelectItem>
                            <SelectItem value="notification">התראה</SelectItem>
                            <SelectItem value="document">מסמך</SelectItem>
                            <SelectItem value="automation">אוטומציה</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <label htmlFor="stepPriority">עדיפות</label>
                        <Select
                          value={step.priority}
                          onValueChange={(value: StepPriority) => updateStep(step.id, { priority: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">נמוכה</SelectItem>
                            <SelectItem value="medium">בינונית</SelectItem>
                            <SelectItem value="high">גבוהה</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <label htmlFor="stepDescription">תיאור</label>
                        <Textarea
                          id="stepDescription"
                          defaultValue={step.description}
                          onChange={(e) => updateStep(step.id, { description: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <label>קבצים מצורפים</label>
                        <TaskAttachments
                          taskId={step.id}
                          attachments={step.attachments || []}
                          onAttachmentsUpdate={(newAttachments) => handleAttachmentsUpdate(step.id, newAttachments)}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={() => setEditingStepId(null)}>שמור שינויים</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      {stepTypeIcons[step.type]}
                      <span className={`text-sm ${priorityColors[step.priority || 'medium']}`}>
                        {step.priority === 'high' ? '⚡' : step.priority === 'low' ? '⭘' : '○'}
                      </span>
                    </div>
                    <h3 className="font-medium text-lg text-gray-800 dark:text-gray-200">{step.label}</h3>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                      {step.children && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleCollapse(step.id)}
                          className="hover:scale-105 transition-transform hover:bg-purple-100/50 dark:hover:bg-purple-900/50"
                        >
                          {step.isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => splitStep(step.id)}
                        className={`hover:scale-105 transition-transform hover:bg-purple-100/50 dark:hover:bg-purple-900/50 ${step.children ? "hidden" : ""}`}
                      >
                        <GitBranch className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingStepId(step.id)}
                        className="hover:scale-105 transition-transform hover:bg-purple-100/50 dark:hover:bg-purple-900/50"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      {step.id !== 'start' && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="hover:text-red-500 dark:hover:text-red-400 hover:scale-105 transition-transform hover:bg-red-50 dark:hover:bg-red-900/20"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="sm:max-w-md bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border-purple-100 dark:border-purple-900">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="text-xl">האם אתה בטוח?</AlertDialogTitle>
                                    <AlertDialogDescription className="text-base">
                                      פעולה זו תמחק את השלב ואת כל השלבים המקושרים אליו
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter className="gap-2">
                                    <AlertDialogCancel className="hover:scale-105 transition-transform">ביטול</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deleteStep(step.id)}
                                      className="bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 hover:scale-105 transition-transform"
                                    >
                                      מחק
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </TooltipTrigger>
                            <TooltipContent side="left" className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-purple-100 dark:border-purple-900">
                              <p>מחק שלב</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </div>
                  {step.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">{step.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    {step.duration && (
                      <div className="flex items-center gap-1">
                        <span>⏱️</span>
                        <span>{step.duration} דקות</span>
                      </div>
                    )}
                    {step.attachments?.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Paperclip className="h-4 w-4" />
                        <span>{step.attachments.length}</span>
                      </div>
                    )}
                    {step.comments?.length > 0 && (
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        <span>{step.comments.length}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            {step.children && !step.isCollapsed && (
              <div className="mt-8">
                <div className="relative">
                  <div className="absolute right-8 top-0 w-[2px] h-8 bg-gradient-to-b from-purple-300 to-indigo-300 dark:from-purple-500/30 dark:to-indigo-500/30 animate-pulse" />
                  <div className="grid grid-cols-2 gap-12">
                    {step.children.map((childStep, childIndex) => (
                      <div key={childStep.id} className="relative">
                        <div className="absolute -top-8 right-1/2 w-[calc(50%+3rem)] h-[2px] bg-gradient-to-l from-purple-300 to-indigo-300 dark:from-purple-500/30 dark:to-indigo-500/30 animate-pulse" />
                        <div className="space-y-8">
                          {renderSteps([childStep], level + 1)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {!step.children && index < steps.length - 1 && (
              <>
                <div className="absolute right-8 -bottom-4 w-[2px] h-[calc(100%-1rem)] bg-gradient-to-b from-purple-300 to-indigo-300 dark:from-purple-500/30 dark:to-indigo-500/30 animate-pulse" />
                <div className="absolute right-[26px] -bottom-8 z-10 bg-white dark:bg-gray-900 rounded-full shadow-lg shadow-purple-200/20 dark:shadow-purple-900/20">
                  <CircleChevronDown 
                    className="h-6 w-6 text-purple-400 dark:text-purple-500 transition-all duration-300 group-hover:text-purple-500 dark:group-hover:text-purple-400 group-hover:scale-110" 
                  />
                </div>
              </>
            )}
          </motion.div>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900" dir="rtl">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }}
          className="text-muted-foreground"
        >
          טוען...
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-6 py-8"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="gap-2 hover:bg-purple-100/50 dark:hover:bg-purple-900/50 hover:scale-105 transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            חזור
          </Button>
          <div className="flex items-center gap-3">
            <Workflow className="h-7 w-7 text-purple-500 dark:text-purple-400 animate-pulse" />
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-indigo-500 dark:from-purple-400 dark:to-indigo-400">
              {workflowId ? 'עריכת זרימת עבודה' : 'יצירת זרימת עבודה'}
            </h1>
          </div>
        </div>

        <div className="rounded-2xl border border-purple-100/50 dark:border-purple-900/30 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl shadow-xl shadow-purple-200/20 dark:shadow-purple-900/20">
          <ScrollArea className="h-[calc(100vh-14rem)] px-8 pt-8">
            <div className="relative pb-8">
              {renderSteps(steps)}
            </div>
          </ScrollArea>
          
          <div className="px-8 py-6 border-t border-purple-100/50 dark:border-purple-900/30 bg-purple-50/30 dark:bg-purple-900/20 backdrop-blur-xl rounded-b-2xl">
            <Button
              onClick={addStep}
              variant="ghost"
              className="w-full h-auto py-6 border-2 border-dashed border-purple-200/50 dark:border-purple-700/30 hover:border-purple-300/50 dark:hover:border-purple-600/50 hover:bg-purple-100/30 dark:hover:bg-purple-900/30 transition-all duration-300 group hover:scale-[1.02]"
            >
              <Plus className="h-6 w-6 text-purple-400 dark:text-purple-500 group-hover:text-purple-500 dark:group-hover:text-purple-400 group-hover:scale-110 transition-transform duration-300" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default WorkflowCreator;
