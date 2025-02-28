
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

        {/* Edit Step Dialog would go here */}
        {editingStepId && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
              <h2 className="text-xl font-semibold mb-4">ערוך שלב</h2>
              <input
                className="w-full p-2 border rounded mb-4 bg-background"
                defaultValue={steps.find(s => s.id === editingStepId)?.label || ''}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    updateStepLabel(editingStepId, (e.target as HTMLInputElement).value);
                  }
                }}
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingStepId(null)}>ביטול</Button>
                <Button onClick={() => {
                  const input = document.querySelector('input') as HTMLInputElement;
                  updateStepLabel(editingStepId, input.value);
                }}>שמור</Button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Step Dialog would go here */}
        {deleteDialogStep && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
              <h2 className="text-xl font-semibold mb-4">מחיקת שלב</h2>
              <p className="mb-4">האם אתה בטוח שברצונך למחוק את שלב "{deleteDialogStep.label}"?</p>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDeleteDialogStep(null)}>ביטול</Button>
                <Button variant="destructive" onClick={() => {
                  deleteStep(deleteDialogStep);
                  setDeleteDialogStep(null);
                }}>מחק</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MotionDiv>
  );
}

export default WorkflowCreator;
