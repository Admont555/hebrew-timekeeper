export interface TaskCategory {
  id: string;
  label: string;
  icon: string;
  color: string; // tailwind token reference
}

export const TASK_CATEGORIES: TaskCategory[] = [
  { id: "general", label: "כללי", icon: "📋", color: "primary" },
  { id: "urgent", label: "דחוף", icon: "🔥", color: "destructive" },
  { id: "meeting", label: "פגישה", icon: "🤝", color: "info" },
  { id: "development", label: "פיתוח", icon: "💻", color: "success" },
  { id: "design", label: "עיצוב", icon: "🎨", color: "warning" },
  { id: "marketing", label: "שיווק", icon: "📢", color: "info" },
  { id: "finance", label: "כספים", icon: "💰", color: "warning" },
  { id: "hr", label: "משאבי אנוש", icon: "👥", color: "primary" },
  { id: "support", label: "תמיכה", icon: "🛟", color: "success" },
  { id: "research", label: "מחקר", icon: "🔬", color: "accent" },
];

export const getCategoryById = (id?: string): TaskCategory | undefined => {
  if (!id) return undefined;
  return TASK_CATEGORIES.find((c) => c.id === id);
};
