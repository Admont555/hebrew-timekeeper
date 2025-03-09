
import { Bell, CheckSquare, FileSpreadsheet, FileText, Zap } from "lucide-react";
import { StepType } from "@/types/workflow";
import React from "react";

export const stepTypeIcons: Record<StepType, React.ReactNode> = {
  approval: <CheckSquare className="h-4 w-4" />,
  task: <FileSpreadsheet className="h-4 w-4" />,
  notification: <Bell className="h-4 w-4" />,
  document: <FileText className="h-4 w-4" />,
  automation: <Zap className="h-4 w-4" />
};

export const stepTypeColors: Record<StepType, string> = {
  approval: "from-green-100/80 to-green-50/30 dark:from-green-900/20 dark:to-green-800/10",
  task: "from-blue-100/80 to-blue-50/30 dark:from-blue-900/20 dark:to-blue-800/10",
  notification: "from-yellow-100/80 to-yellow-50/30 dark:from-yellow-900/20 dark:to-yellow-800/10",
  document: "from-purple-100/80 to-purple-50/30 dark:from-purple-900/20 dark:to-purple-800/10",
  automation: "from-orange-100/80 to-orange-50/30 dark:from-orange-900/20 dark:to-orange-800/10"
};
