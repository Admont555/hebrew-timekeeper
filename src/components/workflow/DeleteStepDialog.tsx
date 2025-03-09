
import React from "react";
import { Button } from "@/components/ui/button";
import { WorkflowStep } from "@/types/workflow";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface DeleteStepDialogProps {
  step: WorkflowStep | null;
  onCancel: () => void;
  onDelete: (step: WorkflowStep) => void;
}

const DeleteStepDialog: React.FC<DeleteStepDialogProps> = ({
  step,
  onCancel,
  onDelete,
}) => {
  const isMobile = useIsMobile();
  const [mounted, setMounted] = React.useState(false);
  
  // Handle proper mounting/unmounting animations
  React.useEffect(() => {
    if (step) {
      setMounted(true);
    } else {
      const timer = setTimeout(() => setMounted(false), 300);
      return () => clearTimeout(timer);
    }
  }, [step]);

  if (!mounted && !step) return null;

  return (
    <div 
      className={cn(
        "fixed inset-0 bg-black/50 flex items-center justify-center z-50 transition-opacity duration-300",
        step ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
      onClick={(e) => {
        // Close when clicking backdrop
        if (e.target === e.currentTarget) onCancel();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
    >
      <div 
        className={cn(
          "bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full transition-all duration-300 transform",
          step ? "translate-y-0 scale-100" : "translate-y-4 scale-95",
          isMobile && "m-4"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 
          id="delete-dialog-title"
          className="text-xl font-semibold mb-4"
        >
          מחיקת שלב
        </h2>
        {step && (
          <p className="mb-4">האם אתה בטוח שברצונך למחוק את שלב "{step.label}"?</p>
        )}
        <div className="flex justify-end gap-2">
          <Button 
            type="button"
            variant="outline" 
            onClick={onCancel}
            className="min-w-[80px]"
          >
            ביטול
          </Button>
          <Button 
            type="button"
            variant="destructive" 
            onClick={() => step && onDelete(step)}
            className="min-w-[80px]"
          >
            מחק
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeleteStepDialog;
