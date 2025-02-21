
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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-white" dir="rtl">
        <div className="text-lg text-gray-600">טוען...</div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-gradient-to-br from-indigo-50 to-white px-4 py-8"
      dir="rtl"
    >
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="gap-2 hover:bg-white/50 transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            חזור
          </Button>
          <div className="flex items-center gap-3">
            <Workflow className="h-7 w-7 text-indigo-500" />
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
              {workflowId ? 'עריכת זרימת עבודה' : 'יצירת זרימת עבודה'}
            </h1>
          </div>
        </div>

        <div className="rounded-2xl border bg-white/70 backdrop-blur-sm shadow-xl">
          <ScrollArea className="h-[calc(100vh-14rem)] px-8 pt-8">
            <div className="relative space-y-6 pb-8">
              {steps.map((step, index) => (
                <div key={step.id} className="relative group">
                  <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:border-indigo-200 hover:shadow-md transition-all duration-300">
                    <h3 className="font-medium text-lg">{step.label}</h3>
                  </div>
                  {index < steps.length - 1 && (
                    <>
                      <div className="absolute right-8 -bottom-4 w-[1px] h-[calc(100%-1rem)] bg-gradient-to-b from-indigo-200 to-purple-200" />
                      <div className="absolute right-[26px] -bottom-6 z-10 bg-white rounded-full shadow-sm">
                        <CircleChevronDown 
                          className="h-6 w-6 text-indigo-400 transition-all duration-300 group-hover:text-indigo-500 group-hover:scale-110" 
                        />
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
          
          <div className="px-8 py-6 border-t bg-white/50 backdrop-blur-sm rounded-b-2xl">
            <Button
              onClick={addStep}
              variant="ghost"
              className="w-full h-auto py-4 border-2 border-dashed border-gray-200 hover:border-indigo-200 hover:bg-white/50 transition-all duration-300 group"
            >
              <Plus className="h-6 w-6 text-indigo-400 group-hover:text-indigo-500 group-hover:scale-110 transition-transform duration-300" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default WorkflowCreator;
