import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { KEYBOARD_SHORTCUTS, SHORTCUT_DESCRIPTIONS } from "@/config/keyboardShortcuts";

interface ShortcutsHelpProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ShortcutsHelp = ({ open, onOpenChange }: ShortcutsHelpProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>קיצורי מקלדת</DialogTitle>
          <DialogDescription>
            קיצורי המקלדת הזמינים באפליקציה
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {Object.entries(KEYBOARD_SHORTCUTS).map(([key, shortcut]) => (
            <div
              key={shortcut}
              className="flex items-center justify-between px-4"
            >
              <span className="text-sm text-muted-foreground">
                {SHORTCUT_DESCRIPTIONS[shortcut]}
              </span>
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                {shortcut.split('+').map((key, index) => (
                  <span key={index} className="text-xs">
                    {key.toUpperCase()}
                  </span>
                ))}
              </kbd>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShortcutsHelp;