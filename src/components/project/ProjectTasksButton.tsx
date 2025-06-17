
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ListTodo } from "lucide-react";

interface ProjectTasksButtonProps {
  projectId: string;
  projectTitle: string;
}

const ProjectTasksButton = ({ projectId, projectTitle }: ProjectTasksButtonProps) => {
  const navigate = useNavigate();

  const handleNavigateToTasks = () => {
    navigate(`/project/${projectId}/tasks`);
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleNavigateToTasks}
      className="flex items-center gap-2"
    >
      <ListTodo className="h-4 w-4" />
      משימות הפרויקט
    </Button>
  );
};

export default ProjectTasksButton;
