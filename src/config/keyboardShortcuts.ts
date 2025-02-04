export const KEYBOARD_SHORTCUTS = {
  TOGGLE_THEME: 'ctrl+t',
  SEARCH: 'ctrl+f',
  HELP: '?',
  ESCAPE_MODAL: 'esc',
} as const;

export const SHORTCUT_DESCRIPTIONS = {
  [KEYBOARD_SHORTCUTS.TOGGLE_THEME]: 'החלף מצב תצוגה',
  [KEYBOARD_SHORTCUTS.SEARCH]: 'חיפוש',
  [KEYBOARD_SHORTCUTS.HELP]: 'הצג עזרה',
  [KEYBOARD_SHORTCUTS.ESCAPE_MODAL]: 'סגור חלון',
} as const;