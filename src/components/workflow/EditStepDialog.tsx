
import React from "react";
import { Button } from "@/components/ui/button";

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
  if (!stepId) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-xl font-semibold mb-4">ערוך שלב</h2>
        <input
          className="w-full p-2 border rounded mb-4 bg-background"
          defaultValue={defaultValue}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onSave(stepId, (e.target as HTMLInputElement).value);
            }
          }}
          autoFocus
        />
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>ביטול</Button>
          <Button onClick={() => {
            const input = document.querySelector('input') as HTMLInputElement;
            onSave(stepId, input.value);
          }}>שמור</Button>
        </div>
      </div>
    </div>
  );
};

export default EditStepDialog;
