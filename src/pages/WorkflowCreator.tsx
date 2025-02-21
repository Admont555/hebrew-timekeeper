
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Workflow } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

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
      className="space-y-6"
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

      <div className="rounded-xl border bg-gray-50/50 p-6">
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div 
              key={step.id}
              className="bg-white p-4 rounded-lg border shadow-sm"
            >
              <h3 className="font-medium">{step.label}</h3>
            </div>
          ))}
          
          <Button
            onClick={addStep}
            variant="outline"
            className="w-full border-dashed gap-2"
          >
            <Plus className="h-4 w-4" />
            הוסף שלב
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

export default WorkflowCreator;
