
import React from "react";
import { motion } from "framer-motion";
import { WorkflowStep as WorkflowStepType } from "@/types/workflow";
import { Button } from "@/components/ui/button";
import { 
  ChevronDown, 
  ChevronRight, 
  CircleChevronDown, 
  GitBranch, 
  Pencil, 
  Plus, 
  Trash2 
} from "lucide-react";
import { stepTypeColors, stepTypeIcons } from "./constants";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";

const MotionDiv = motion.div;

interface WorkflowStepProps {
  step: WorkflowStepType;
  index: number;
  level?: number;
  onToggleCollapse: (stepId: string) => void;
  onSplitStep: (stepId: string) => void;
  onEditStep: (stepId: string) => void;
  onDeleteStep: (step: WorkflowStepType) => void;
  onAddStep: (e: React.MouseEvent<HTMLButtonElement>, parentStepId?: string) => void;
  renderSteps: (steps: WorkflowStepType[], level?: number) => React.ReactNode;
}

const WorkflowStep: React.FC<WorkflowStepProps> = ({
  step,
  index,
  level = 0,
  onToggleCollapse,
  onSplitStep,
  onEditStep,
  onDeleteStep,
  onAddStep,
  renderSteps
}) => {
  return (
    <MotionDiv 
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
          </div>
          <h3 className="font-medium text-lg text-gray-800 dark:text-gray-200">
            {step.label}
          </h3>
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
            {step.children && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onToggleCollapse(step.id)}
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
                    onClick={() => onSplitStep(step.id)}
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
                    onClick={() => onEditStep(step.id)}
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
                      onClick={() => onDeleteStep(step)}
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
      {step.children && !step.isCollapsed && (
        <MotionDiv
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
        </MotionDiv>
      )}
      {!step.children && (
        <>
          <div className="absolute right-8 -bottom-4 w-[2px] h-[calc(100%-1rem)] bg-gradient-to-b from-purple-300 to-indigo-300 dark:from-purple-500/30 dark:to-indigo-500/30 animate-pulse" />
          <div className="absolute right-[26px] -bottom-8 z-10 bg-white dark:bg-gray-900 rounded-full shadow-lg shadow-purple-200/20 dark:shadow-purple-900/20">
            <CircleChevronDown 
              className="h-6 w-6 text-purple-400 dark:text-purple-500 transition-all duration-300 group-hover:text-purple-500 dark:group-hover:text-purple-400 group-hover:scale-110" 
            />
          </div>
          <Button
            onClick={(e) => onAddStep(e, step.id)}
            variant="ghost"
            className="w-full h-auto py-4 mt-8 border-2 border-dashed border-purple-200/50 dark:border-purple-700/30 hover:border-purple-300/50 dark:hover:border-purple-600/50 hover:bg-purple-100/30 dark:hover:bg-purple-900/30 transition-all duration-300 group"
          >
            <Plus className="h-4 w-4 text-purple-400 dark:text-purple-500 group-hover:text-purple-500 dark:group-hover:text-purple-400 group-hover:scale-110 transition-transform duration-300" />
          </Button>
        </>
      )}
    </MotionDiv>
  );
};

export default WorkflowStep;
