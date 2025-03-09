
import React, { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface EditStepDialogProps {
  stepId: string | null;
  defaultValue: string;
  onCancel: () => void;
  onSave: (stepId: string, newLabel: string) => void;
}

const EditStepDialog: React.FC<EditStepDialogProps> = ({
  stepId,
  defaultValue,
  onCancel,
  onSave,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();
  const [mounted, setMounted] = React.useState(false);
  const [inputValue, setInputValue] = React.useState(defaultValue);
  
  // Reset input value when defaultValue changes
  useEffect(() => {
    setInputValue(defaultValue);
  }, [defaultValue]);
  
  // Handle proper mounting/unmounting animations
  useEffect(() => {
    if (stepId) {
      setMounted(true);
      // Focus the input after animation completes
      const timer = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      }, 50);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => setMounted(false), 300);
      return () => clearTimeout(timer);
    }
  }, [stepId]);
  
  // Handle save action
  const handleSave = () => {
    if (stepId && inputValue.trim()) {
      onSave(stepId, inputValue);
    }
  };

  if (!mounted && !stepId) return null;

  return (
    <div 
      className={cn(
        "fixed inset-0 bg-black/50 flex items-center justify-center z-50 transition-opacity duration-300",
        stepId ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
      onClick={(e) => {
        // Close when clicking backdrop
        if (e.target === e.currentTarget) onCancel();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-dialog-title"
    >
      <div 
        className={cn(
          "bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full transition-all duration-300 transform",
          stepId ? "translate-y-0 scale-100" : "translate-y-4 scale-95",
          isMobile && "m-4"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 
          id="edit-dialog-title"
          className="text-xl font-semibold mb-4"
        >
          ערוך שלב
        </h2>
        <input
          ref={inputRef}
          className="w-full p-2 border rounded mb-4 bg-background"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSave();
            } else if (e.key === 'Escape') {
              onCancel();
            }
          }}
        />
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
            onClick={handleSave}
            className="min-w-[80px]"
            disabled={!inputValue.trim()}
          >
            שמור
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditStepDialog;
