
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { WorkflowStep as WorkflowStepType } from "@/types/workflow";
import { useWorkflowState } from "@/hooks/useWorkflowState";
import WorkflowHeader from "@/components/workflow/WorkflowHeader";
import WorkflowStep from "@/components/workflow/WorkflowStep";
import { generatePDF } from "@/components/workflow/workflow-utils";
import EditStepDialog from "@/components/workflow/EditStepDialog";
import DeleteStepDialog from "@/components/workflow/DeleteStepDialog";

const MotionDiv = motion.div;

function WorkflowCreator() {
  const { workflowId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    isLoading,
    steps,
    workflowName,
    editingStepId,
    deleteDialogStep,
    setDeleteDialogStep,
    setEditingStepId,
    handleAddStep,
    toggleCollapse,
    splitStep,
    deleteStep,
    updateStepLabel,
    undo,
    redo,
    canUndo,
    canRedo
  } = useWorkflowState(workflowId);

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
  }, [undo, redo]);

  const handleDownloadPDF = async () => {
    try {
      await generatePDF(workflowName, steps);
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

  const renderSteps = (steps: WorkflowStepType[], level: number = 0) => {
    return (
      <div className="relative space-y-8">
        <AnimatePresence>
          {steps.map((step, index) => (
            <WorkflowStep
              key={step.id}
              step={step}
              index={index}
              level={level}
              onToggleCollapse={toggleCollapse}
              onSplitStep={splitStep}
              onEditStep={setEditingStepId}
              onDeleteStep={setDeleteDialogStep}
              onAddStep={handleAddStep}
              renderSteps={renderSteps}
            />
          ))}
        </AnimatePresence>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900" dir="rtl">
        <MotionDiv 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }}
          className="text-muted-foreground"
        >
          טוען...
        </MotionDiv>
      </div>
    );
  }

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-6 py-8"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto space-y-8">
        <WorkflowHeader
          workflowId={workflowId}
          onBack={() => navigate(-1)}
          onUndo={undo}
          onRedo={redo}
          onDownloadPDF={handleDownloadPDF}
          canUndo={canUndo}
          canRedo={canRedo}
        />

        <div className="space-y-8">
          {steps.length > 0 ? renderSteps(steps) : (
            <Button
              onClick={(e) => handleAddStep(e)}
              variant="ghost"
              className="w-full h-auto py-8 border-2 border-dashed border-purple-200/50 dark:border-purple-700/30 hover:border-purple-300/50 dark:hover:border-purple-600/50 hover:bg-purple-100/30 dark:hover:bg-purple-900/30 transition-all duration-300 group"
            >
              <Plus className="h-6 w-6 text-purple-400 dark:text-purple-500 group-hover:text-purple-500 dark:group-hover:text-purple-400 group-hover:scale-110 transition-transform duration-300" />
            </Button>
          )}
        </div>

        {/* Dialog components */}
        <EditStepDialog
          stepId={editingStepId}
          defaultValue={steps.find(s => s.id === editingStepId)?.label || ''}
          onCancel={() => setEditingStepId(null)}
          onSave={updateStepLabel}
        />

        <DeleteStepDialog
          step={deleteDialogStep}
          onCancel={() => setDeleteDialogStep(null)}
          onDelete={(step) => {
            deleteStep(step);
            setDeleteDialogStep(null);
          }}
        />
      </div>
    </MotionDiv>
  );
}

export default WorkflowCreator;
