
import { useCallback, useEffect, useState } from "react";
import { WorkflowStep } from "@/types/workflow";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  addChildStepsToParent, 
  addStepToParent, 
  createNewStep, 
  deleteStepById, 
  generateInitialStep, 
  toggleCollapseStep, 
  updateStepInList 
} from "@/components/workflow/workflow-utils";

export const useWorkflowState = (workflowId?: string) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [editingStepId, setEditingStepId] = useState<string | null>(null);
  const [deleteDialogStep, setDeleteDialogStep] = useState<WorkflowStep | null>(null);
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [history, setHistory] = useState<WorkflowStep[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [workflowName, setWorkflowName] = useState("");

  const addToHistory = useCallback((newSteps: WorkflowStep[]) => {
    setHistory(prev => [...prev.slice(0, historyIndex + 1), JSON.parse(JSON.stringify(newSteps))]);
    setHistoryIndex(prev => prev + 1);
  }, [historyIndex]);

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
          
          const workflowSteps = workflow.steps as unknown;
          const parsedSteps = Array.isArray(workflowSteps) 
            ? workflowSteps.map(step => {
                if (typeof step === 'object' && step !== null && 
                    'id' in step && 'label' in step && 'type' in step) {
                  return step as WorkflowStep;
                }
                return null;
              }).filter((step): step is WorkflowStep => step !== null)
            : [];

          if (parsedSteps.length > 0) {
            setSteps(parsedSteps);
            setHistory([parsedSteps]);
          } else {
            const initialSteps: WorkflowStep[] = [generateInitialStep()];
            setSteps(initialSteps);
            setHistory([initialSteps]);
          }
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
        const { error } = await supabase
          .from('workflows')
          .update({ 
            steps: steps,
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

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1);
      setSteps(JSON.parse(JSON.stringify(history[historyIndex - 1])));
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1);
      setSteps(JSON.parse(JSON.stringify(history[historyIndex + 1])));
    }
  }, [history, historyIndex]);

  const handleAddStep = useCallback((e: React.MouseEvent<HTMLButtonElement>, parentStepId?: string) => {
    e.preventDefault();
    const newStep = createNewStep(steps);

    setSteps(currentSteps => {
      const newSteps = addStepToParent(currentSteps, newStep, parentStepId);
      addToHistory(newSteps);
      return newSteps;
    });
  }, [steps, addToHistory]);

  const toggleCollapse = useCallback((stepId: string) => {
    setSteps(currentSteps => toggleCollapseStep(currentSteps, stepId));
  }, []);

  const splitStep = useCallback((stepId: string) => {
    setSteps(currentSteps => {
      const newSteps = addChildStepsToParent(currentSteps, stepId);
      addToHistory(newSteps);
      return newSteps;
    });
  }, [addToHistory]);

  const deleteStep = useCallback((step: WorkflowStep) => {
    setSteps(currentSteps => {
      const newSteps = deleteStepById(currentSteps, step.id);
      addToHistory(newSteps);
      return newSteps;
    });

    toast({
      description: "השלב נמחק בהצלחה",
      duration: 2000
    });
  }, [toast, addToHistory]);

  const updateStep = useCallback((stepId: string, updates: Partial<WorkflowStep>) => {
    setSteps(currentSteps => updateStepInList(currentSteps, stepId, updates));
  }, []);

  const updateStepLabel = useCallback((stepId: string, newLabel: string) => {
    setSteps(currentSteps => updateStepInList(currentSteps, stepId, { label: newLabel }));
    setEditingStepId(null);
    
    toast({
      description: "השלב עודכן בהצלחה",
      duration: 2000,
    });
  }, [toast]);

  const handleAttachmentsUpdate = useCallback((stepId: string, newAttachments: Array<{
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
  }, [updateStep, toast]);

  return {
    isLoading,
    steps,
    history,
    historyIndex,
    workflowName,
    editingStepId,
    deleteDialogStep,
    setDeleteDialogStep,
    setEditingStepId,
    handleAddStep,
    toggleCollapse,
    splitStep,
    deleteStep,
    updateStep,
    updateStepLabel,
    handleAttachmentsUpdate,
    undo,
    redo,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1
  };
};
