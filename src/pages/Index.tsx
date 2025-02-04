import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import TaskList from "@/components/TaskList";
import TaskForm from "@/components/TaskForm";
import { useToast } from "@/hooks/use-toast";
import { KEYBOARD_SHORTCUTS } from "@/config/keyboardShortcuts";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import WorkerNameEditor from "@/components/WorkerNameEditor";
import TaskStats from "@/components/task/TaskStats";
import TaskAnalytics from "@/components/task/TaskAnalytics";
import TaskFilters from "@/components/task/TaskFilters";
import TaskListContainer from "@/components/task/TaskListContainer";

const Index = () => {
  const { workerId } = useParams();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [showArchived, setShowArchived] = useState(false);

  const { data: worker, isLoading: isWorkerLoading } = useQuery({
    queryKey: ["worker", workerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("team_members")
        .select("*")
        .eq("worker_id", workerId)
        .single();

      if (error) {
        console.error("Error fetching worker:", error);
        throw error;
      }

      return data;
    },
  });

  useEffect(() => {
    if (!isWorkerLoading && !worker) {
      toast({
        title: "שגיאה",
        description: "לא נמצא עובד",
        variant: "destructive",
      });
    }
  }, [isWorkerLoading, worker, toast]);

  const shortcuts = {
    [KEYBOARD_SHORTCUTS.TOGGLE_THEME]: () => {
      // Theme toggle handled by ThemeSwitcher component
    },
    [KEYBOARD_SHORTCUTS.SEARCH]: () => {
      // Search handled elsewhere
    },
    [KEYBOARD_SHORTCUTS.HELP]: () => {
      // Help handled elsewhere
    },
    [KEYBOARD_SHORTCUTS.ESCAPE_MODAL]: () => {
      setIsFormOpen(false);
    },
  };

  useKeyboardShortcuts(shortcuts);

  if (isWorkerLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white" />
      </div>
    );
  }

  if (!worker) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <WorkerNameEditor worker={worker} />
            <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
              <SheetTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 ml-2" />
                  הוסף משימה
                </Button>
              </SheetTrigger>
              <SheetContent>
                <TaskForm
                  onSuccess={() => setIsFormOpen(false)}
                  workerId={workerId}
                />
              </SheetContent>
            </Sheet>
          </div>
          <TaskStats workerId={workerId} selectedDate={selectedDate} />
          <TaskAnalytics workerId={workerId} />
        </div>

        <TaskFilters
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          showArchived={showArchived}
          onShowArchivedChange={setShowArchived}
        />

        <TaskListContainer
          workerId={workerId}
          selectedDate={selectedDate}
          showArchived={showArchived}
        />
      </div>
    </div>
  );
};

export default Index;