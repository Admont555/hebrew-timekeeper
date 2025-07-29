import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import TaskForm from "@/components/TaskForm";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";

export function FloatingActionButton() {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          size="lg"
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-gradient-primary shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <TaskForm 
          onAddTask={() => {}} 
          onCancel={() => setIsOpen(false)}
          onOpenChange={setIsOpen}
          isOpen={isOpen}
        />
      </DialogContent>
    </Dialog>
  );
}