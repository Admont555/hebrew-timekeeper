<lov-code>
import { useState, useCallback, useEffect } from "react";
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
  MessageSquare,
  Undo2,
  Redo2
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
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
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import type { WorkflowStep, StepType, StepPriority } from "@/types/workflow";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Download } from 'lucide-react';
import type { Json } from '@/integrations/supabase/types';
import { format } from 'date-fns';

const stepTypeIcons: Record<StepType, React.ReactNode> = {
  approval: <CheckSquare className="h-4 w-4" />,
  task: <FileSpreadsheet className="h-4 w-4" />,
  notification: <Bell className="h-4 w-4" />,
  document: <FileText className="h-4 w-4" />,
  automation: <Zap className="h-4 w-4" />
};

const stepTypeColors: Record<StepType, string> = {
  approval: "from-green-100/80 to-green-50/30 dark:from-green-900/20 dark:to-green-800/10",
  task: "from-blue-100/80 to-blue-50/30 dark:from-blue-900/20 dark:to-blue-800/10",
  notification: "from-yellow-100/80 to-yellow-50/30 dark:from-yellow-900/20 dark:to-yellow-800/10",
  document: "from-purple-100/80 to-purple-50/30 dark:from-purple-900/20 dark:to-purple-800/10",
  automation: "from-orange-100/80 to-orange-50/30 dark:from-orange-900/20 dark:to-orange-800/10"
};

const priorityColors = {
  low: "text-gray-400 dark:text-gray-500",
  medium: "text-amber-500 dark:text-amber-400",
  high: "text-red-500 dark:text-red-400"
};

function WorkflowCreator() {
  const { workflowId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [editingStepId, setEditingStepId] = useState<string | null>(null);
  const [deleteDialogStep, setDeleteDialogStep] = useState<WorkflowStep | null>(null);
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [history, setHistory] = useState<WorkflowStep[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [workflowName, setWorkflowName] = useState("");

  useEffect(() => {
    const loadWorkflow = async () => {
      if (!workflowId) {
        setIsLoading(false);
        return;
      }

      try {
        const { data: workflow, error } = await supabase
          .from('workflows')
          .select('*')
          .eq('id', workflowId)
          .single();

        if (error) {
          throw error;
        }

        if (workflow) {
          setWorkflowName(workflow.name);
          
          // First cast to unknown, then to our specific type to safely handle the conversion
          const workflowSteps = workflow.steps as unknown;
          // Now check if it's an array and has the required properties
          const parsedSteps = Array.isArray(workflowSteps) 
            ? workflowSteps.map(step => {
                // Ensure each step has the required properties
                if (typeof step === 'object' && step !== null && 
                    'id' in step && 'label' in step && 'type' in step) {
                  return step as WorkflowStep;
                }
                return null;
              }).filter((step): step is WorkflowStep => step !== null)
            : [];
          
          const initialSteps: WorkflowStep[] = parsedSteps.length > 0 ? parsedSteps : [{
            id: 'start',
            label: 'התחלה',
            type: 'task' as StepType,
            description: '',
            priority: 'medium' as StepPriority
          }];

          setSteps(initialSteps);
          setHistory([initialSteps]);
          setHistoryIndex(0);
        }
      } catch (error) {
        console.error('Error loading workflow:', error);
        toast({
          title: "שגיאה בטעינת זרימת העבודה",
          description: "אירעה שגיאה בטעינת זרימת העבודה",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadWorkflow();
  }, [workflowId, toast]);

  useEffect(() => {
    const saveSteps = async () => {
      if (!workflowId || isLoading) return;

      try {
        const stepsJson = JSON.parse(JSON.stringify(steps)) as Json;

        const { error } = await supabase
          .from('workflows')
          .update({ 
            steps: stepsJson,
            updated_at: new Date().toISOString()
          })
          .eq('id', workflowId);

        if (error) {
          throw error;
        }
      } catch (error) {
        console.error('Error saving workflow steps:', error);
        toast({
          title: "שגיאה בשמירת השלבים",
          description: "אירעה שגיאה בשמירת השלבים",
          variant: "destructive",
        });
      }
    };

    const timeoutId = setTimeout(saveSteps, 500);
    return () => clearTimeout(timeoutId);
  }, [steps, workflowId, isLoading, toast]);

  const addToHistory = useCallback((newSteps: WorkflowStep[]) => {
    setHistory(prev => [...prev.slice(0, historyIndex + 1), newSteps]);
    setHistoryIndex(prev => prev + 1);
  }, [historyIndex]);

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1);
      setSteps(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1);
      setSteps(history[historyIndex + 1]);
    }
  };

  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      if (e.key === 'z' && (e.ctrlKey || e.metaKey)) {
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [history, historyIndex]);

  const handleAddStep = (e: React.MouseEvent<HTMLButtonElement>, parentStepId?: string) => {
    e.preventDefault();
    const newStep: WorkflowStep = {
      id: `step-${crypto.randomUUID()}`,
      label: `שלב ${steps.length + 1}`,
      type: 'task',
      description: '',
      priority: 'medium'
    };

    setSteps(currentSteps => {
      if (!parentStepId) {
        const newSteps = [...currentSteps, newStep];
        addToHistory(newSteps);
        return newSteps;
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

      const newSteps = addStepToChildren(currentSteps);
      addToHistory(newSteps);
      return newSteps;
    });
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
              priority: 'medium'
            };
            const branch2: WorkflowStep = {
              id: `${step.id}-2`,
              label: 'תוצאה 2',
              type: 'task',
              description: '',
              priority: 'medium'
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

      const newSteps = updateStep(currentSteps);
      addToHistory(newSteps);
      return newSteps;
    });
  };

  const deleteStep = (step: WorkflowStep) => {
    setSteps(currentSteps => {
      const deleteStepRecursive = (steps: WorkflowStep[]): WorkflowStep[] => {
        return steps.filter(s => {
          if (s.id === step.id) {
            return false;
          }
          if (s.children) {
            s.children = deleteStepRecursive(s.children);
          }
          return true;
        });
      };

      const newSteps = deleteStepRecursive(currentSteps);
      addToHistory(newSteps);
      return newSteps;
    });

    toast({
      description: "השלב נמחק בהצלחה",
      duration: 2000
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

  const handleAttachmentsUpdate = (stepId: string, newAttachments: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
  }>) => {
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
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="relative group"
          >
            <div className={`bg-gradient-to-br ${stepTypeColors[step.type]} p-6 rounded-xl border border-purple-100/50 dark:border-purple-800/30 shadow-lg hover:shadow-purple-200/20 dark:hover:shadow-purple-900/20 hover:border-purple-200/50 dark:hover:border-purple-700/50 transition-all duration-300 ease-in-out backdrop-blur-md`}>
              <div className="absolute -left-8 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-500 dark:text-gray-400">
                {index + 1}
              </div>
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
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleCollapse(step.id)}
                            className="hover:scale-105 transition-transform hover:bg-purple-100/50 dark:hover:bg-purple-900/50"
                          >
                            {step.isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <p>{step.isCollapsed ? 'הרחב שלב' : 'כווץ שלב'}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => splitStep(step.id)}
                          className={`hover:scale-105 transition-transform hover:bg-purple-100/50 dark:hover:bg-purple-900/50 ${step.children ? "hidden" : ""}`}
                        >
                          <GitBranch className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p>פצל לשני מסלולים</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingStepId(step.id)}
                          className="hover:scale-105 transition-transform hover:bg-purple-100/50 dark:hover:bg-purple-900/50"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p>ערוך שלב</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  {step.id !== 'start' && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteDialogStep(step)}
                            className="hover:text-red-500 dark:hover:text-red-400 hover:scale-105 transition-transform hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <p>מחק שלב</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </div>
            </div>
            <AnimatePresence>
              {step.children && !step.isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-8"
                >
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
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            {!step.children && index === steps.length - 1 && (
              <>
                <div className="absolute right-8 -bottom-4 w-[2px] h-[calc(100%-1rem)] bg-gradient-to-b from-purple-300 to-indigo-300 dark:from-purple-500/30 dark:to-indigo-500/30 animate-pulse" />
                <div className="absolute right-[26px] -bottom-8 z-10 bg-white dark:bg-gray-900 rounded-full shadow-lg shadow-purple-200/20 dark:shadow-purple-900/20">
                  <CircleChevronDown 
                    className="h-6 w-6 text-purple-400 dark:text-purple-500 transition-all duration-300 group-hover:text-purple-500 dark:group-hover:text-purple-400 group-hover:scale-110" 
                  />
                </div>
                <Button
                  onClick={(e) => handleAddStep(e, step.id)}
                  variant="ghost"
                  className="w-full h-auto py-4 mt-8 border-2 border-dashed border-purple-200/50 dark:border-purple-700/30 hover:border-purple-300/50 dark:hover:border-purple-600/50 hover:bg-purple-100/30 dark:hover:bg-purple-900/30 transition-all duration-300 group"
                >
                  <Plus className="h-4 w-4 text-purple-400 dark:text-purple-500 group-hover:text-purple-500 dark:group-hover:text-purple-400 group-hover:scale-110 transition-transform duration-300" />
                </Button>
              </>
            )}
          </motion.div>
        ))}
      </div>
    );
  };

  const handleDownloadPDF = async () => {
    try {
      const container = document.createElement('div');
      container.style.width = '800px';
      container.style.padding = '40px';
      container.style.position = 'absolute';
      container.style.backgroundColor = '#ffffff';
      container.dir = 'rtl';
      document.body.appendChild(container);

      const content = document.createElement('div');
      content.style.fontFamily = 'Heebo, Arial, sans-serif';
      
      const header = document.createElement('div');
      header.style.marginBottom = '30px';
      header.style.borderBottom = '2px solid #6b46c1';
      header.style.paddingBottom = '20px';
      header.style.display = 'flex';
      header.style.justifyContent = 'space-between';
      header.style.alignItems = 'center';

      const title = document.createElement('h1');
      title.style.fontSize = '28px';
      title.style.color = '#6b46c1';
      title.style.margin = '0';
      title.textContent = workflowName || 'זרימת עבודה';
      
      const date = document.createElement('div');
      date.style.color = '#666';
      date.style.fontSize = '14px';
      date.textContent = format(new Date(), 'dd/MM/yyyy');
      
      header.appendChild(title);
      header.appendChild(date);
      content.appendChild(header);

      const summary = document.createElement('div');
      summary.style.backgroundColor = '#f8f9fa';
      summary.style.padding = '15px';
      summary.style.borderRadius = '8px';
      summary.style.marginBottom = '30px';
      summary.style.fontSize = '14px';
      summary.style.color = '#4a5568';
      summary.textContent = `סה"כ שלבים: ${steps.length}`;
      content.appendChild(summary);

      const renderStepForPDF = (step: WorkflowStep, level: number = 0) => {
        const stepElement = document.createElement('div');
        stepElement.style.marginRight = `${level * 25}px`;
        stepElement.style.marginBottom = '20px';
        stepElement.style.padding = '20px';
        stepElement.style.borderRadius = '8px';
        stepElement.style.backgroundColor = '#ffffff';
        stepElement.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
        stepElement.style.border = '1px solid #e2e8f0';

        const stepHeader = document.createElement('div');
        stepHeader.style.display = 'flex';
        stepHeader.style.alignItems = 'center';
        stepHeader.style.gap = '10px';
        stepHeader.style.marginBottom = '10px';

        const stepNumber = document.createElement('div');
        stepNumber.style.backgroundColor = '#6b46c1';
        stepNumber.style.color = '#ffffff';
        stepNumber.style.padding = '4px 8px';
        stepNumber.style.borderRadius = '4px';
        stepNumber.style.fontSize = '12px';
        stepNumber.textContent = `${level + 1}`;

        const stepTitle = document.createElement('div');
        stepTitle.style.fontWeight = 'bold';
        stepTitle.style.fontSize = '16px';
        stepTitle.style.color = '#2d3748';
        stepTitle.textContent = step.label;

        const stepType = document.createElement('div');
        stepType.style.color = '#718096';
        stepType.style.fontSize = '12px';
        stepType.style.padding = '2px 8px';
        stepType.style.backgroundColor = '#f7fafc';
        stepType.style.borderRadius = '4px';
        stepType.textContent = step.type;

        stepHeader.appendChild(stepNumber);
        stepHeader.appendChild(stepTitle);
        stepHeader.appendChild(stepType);
        stepElement.appendChild(stepHeader);

        if (step.description) {
          const description = document.createElement('div');
          description.style.marginTop = '10px';
          description.style.color = '#4a5568';
          description.style.fontSize = '14px';
          description.style.padding = '8px';
          description.style.backgroundColor = '#f8fafc';
          description.style.borderRadius = '4px';
          description.textContent = step.description;
          stepElement.appendChild(description);
        }

        const metadata = document.createElement('div');
        metadata.style.display = 'flex';
        metadata.style.gap = '15px';
        metadata.style.marginTop = '10px';
        metadata.style.padding = '8px 0';
        metadata.style.borderTop = '1px solid #e2e8f0';
        metadata.style.color = '#718096';
        metadata.style.fontSize = '12px';

        if (step.priority) {
          const priority = document.createElement('div');
          priority.textContent = `עדיפות: ${step.priority}`;
          metadata.appendChild(priority);
        }

        if (step.duration) {
          const duration = document.createElement('div');
          duration.textContent = `משך: ${step.duration} דקות`;
          metadata.appendChild(duration);
        }

        stepElement.appendChild(metadata);
        return stepElement;
      };

      const renderWorkflowSteps = (steps: WorkflowStep[], level: number = 0) => {
        steps.forEach(step => {
          content.appendChild(renderStepForPDF(step, level));
          if (step.children) {
            const childrenContainer = document.createElement('div');
            childrenContainer.style.marginRight = '20px';
            childrenContainer.style.borderRight = '2px solid #e2e8f0';
            childrenContainer.style.paddingRight = '20px';
            step.children.forEach(childStep => {
              renderWorkflowSteps([childStep], level + 1);
            });
            content.appendChild(childrenContainer);
          }
        });
      };

      renderWorkflowSteps(steps);
      container.appendChild(content);

      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      document.body.removeChild(container);

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: 'a4',
        hotfixes: ['px_scaling']
      });

      const imgWidth = 595;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const pageHeight = 842;
      let position = 0;

      while (position < imgHeight) {
        if (position > 0) {
          pdf.addPage();
        }
        
        pdf.addImage(
          canvas.toDataURL('image/jpeg', 1.0),
          'JPEG',
          0,
          position === 0 ? 0 : -position,
          imgWidth,
          imgHeight
        );
        
        position += pageHeight;
      }

      pdf.save(`${workflowName || 'workflow'}.pdf`);

      toast({
        description: "הזרימה הורדה בהצלחה",
        duration: 2000,
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "שגיאה בהורדת הזרימה",
        description: "אירעה שגיאה בעת יצירת קובץ PDF",
        variant: "destructive",
      });
    }
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
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="gap-2 hover:bg-purple-100/50 dark:hover:bg-purple-900/50 hover:scale-105 transition-all"
            >
              <ArrowLeft className="h-4 w-4" />
              חזור
            </Button>
            <div className="flex gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={undo}
                      disabled={historyIndex <= 0}
                      className="hover:bg-purple-100/50 dark:hover:bg-purple-900/50"
                    >
                      <Undo2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>בטל (Ctrl+Z)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={redo}
                      disabled={historyIndex >= history.length - 1}
                      className="hover:bg-purple-100/50 dark:hover:bg-purple-900/50"
                    >
                      <Redo2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>חזור על פעולה (Ctrl+Shift+Z)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    onClick={handleDownloadPDF}
                    className="gap-2 hover:bg-purple-100/50 dark:hover:bg-purple-900/50"
                  >
                    <Download className="h-4 w-4" />
                    ה
