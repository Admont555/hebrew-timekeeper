
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CircleChevronDown, Plus, Workflow } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

interface WorkflowStep {
  id: string;
  label: string;
  duration?: number;
  priority?: string;
}

function WorkflowCreator() {
  const { workflowId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [steps, setSteps] = useState<WorkflowStep[]>([
    {
      id: 'start',
      label: 'התחלה',
    }
  ]);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const addStep = () => {
    const newStep: WorkflowStep = {
      id: `step-${steps.length + 1}`,
      label: `שלב ${steps.length + 1}`,
    };
    setSteps([...steps, newStep]);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen" dir="rtl">
        <div className="text-lg text-gray-600">טוען...</div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-xl mx-auto pt-8 px-4 space-y-6"
      dir="rtl"
    >
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          חזור
        </Button>
        <div className="flex items-center gap-2">
          <Workflow className="h-6 w-6 text-indigo-500" />
          <h1 className="text-2xl font-bold">
            {workflowId ? 'עריכת זרימת עבודה' : 'יצירת זרימת עבודה'}
          </h1>
        </div>
      </div>

      <div className="rounded-xl border bg-white shadow-sm">
        <ScrollArea className="h-[calc(100vh-12rem)] px-6 pt-6">
          <div className="relative space-y-6 pb-6">
            {steps.map((step, index) => (
              <div key={step.id} className="relative">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-indigo-200 transition-colors">
                  <h3 className="font-medium">{step.label}</h3>
                </div>
                {index < steps.length - 1 && (
                  <>
                    <div className="absolute right-6 -bottom-4 w-[1px] h-[calc(100%-0.5rem)] bg-indigo-200" />
                    <div className="absolute right-[18px] -bottom-6 z-10 bg-white rounded-full">
                      <CircleChevronDown 
                        className="h-6 w-6 text-indigo-400 drop-shadow-sm transition-colors hover:text-indigo-500" 
                      />
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
        
        <div className="px-6 py-4 border-t bg-gray-50/50">
          <Button
            onClick={addStep}
            variant="ghost"
            className="w-full h-auto py-2 border-2 border-dashed border-gray-200 hover:border-indigo-200 hover:bg-gray-50/80 transition-colors"
          >
            <Plus className="h-5 w-5 text-indigo-500" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

export default WorkflowCreator;
