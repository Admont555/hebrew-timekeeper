
import React from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Download,
  Redo2,
  Undo2
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";

interface WorkflowHeaderProps {
  workflowId?: string;
  onBack: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onDownloadPDF: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const WorkflowHeader: React.FC<WorkflowHeaderProps> = ({
  onBack,
  onUndo,
  onRedo,
  onDownloadPDF,
  canUndo,
  canRedo
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          onClick={onBack}
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
                  onClick={onUndo}
                  disabled={!canUndo}
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
                  onClick={onRedo}
                  disabled={!canRedo}
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
                onClick={onDownloadPDF}
                className="gap-2 hover:bg-purple-100/50 dark:hover:bg-purple-900/50"
              >
                <Download className="h-4 w-4" />
                הורד PDF
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>הורד את הזרימה כקובץ PDF</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default WorkflowHeader;
