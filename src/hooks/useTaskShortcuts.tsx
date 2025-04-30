
import { useCallback, useEffect } from 'react';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useToast } from '@/hooks/use-toast';

export interface TaskShortcutHandlers {
  onAddTask?: () => void;
  onToggleFilterCompleted?: () => void;
  onSearch?: () => void;
  onSave?: () => void;
  onDelete?: () => void;
  onCancelModal?: () => void;
}

export const useTaskShortcuts = (handlers: TaskShortcutHandlers) => {
  const { toast } = useToast();

  const showToastHelp = useCallback(() => {
    toast({
      title: "קיצורי מקלדת זמינים",
      description: `
        Alt+N: הוסף משימה חדשה
        Alt+F: סינון משימות
        Alt+S: חיפוש משימות
        Alt+Enter: שמירה/הגשה
        Esc: ביטול/סגירה
        Alt+D: מחיקה
        F1: עזרה (הצגת רשימה זו)
      `,
      duration: 10000,
    });
  }, [toast]);

  const shortcutsConfig = {
    'f1': showToastHelp,
    'ctrl+?': showToastHelp,
    'alt+n': handlers.onAddTask,
    'alt+f': handlers.onToggleFilterCompleted,
    'alt+s': handlers.onSearch,
    'alt+enter': handlers.onSave,
    'alt+d': handlers.onDelete,
    'esc': handlers.onCancelModal
  };

  // Use the existing keyboard shortcuts hook
  useKeyboardShortcuts(shortcutsConfig);

  // Add help text to the document title on mount
  useEffect(() => {
    const originalTitle = document.title;
    document.title = `${originalTitle} (F1: עזרה)`;
    
    return () => {
      document.title = originalTitle;
    };
  }, []);

  return { showKeyboardShortcuts: showToastHelp };
};
