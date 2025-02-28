
import React from "react";
import { Button } from "@/components/ui/button";
import { WorkflowStep } from "@/types/workflow";

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
  if (!step) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-xl font-semibold mb-4">מחיקת שלב</h2>
        <p className="mb-4">האם אתה בטוח שברצונך למחוק את שלב "{step.label}"?</p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>ביטול</Button>
          <Button variant="destructive" onClick={() => onDelete(step)}>מחק</Button>
        </div>
      </div>
    </div>
  );
};

export default DeleteStepDialog;
