import { useEffect } from 'react';

type ShortcutMap = {
  [key: string]: () => void;
};

export const useKeyboardShortcuts = (shortcuts: ShortcutMap) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const ctrlKey = event.ctrlKey || event.metaKey;
      
      Object.entries(shortcuts).forEach(([shortcut, callback]) => {
        const [modifier, targetKey] = shortcut.split('+');
        
        if (
          (modifier === 'ctrl' && ctrlKey && key === targetKey) ||
          (modifier === 'esc' && key === 'escape') ||
          key === shortcut
        ) {
          event.preventDefault();
          callback();
        }
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
};