
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, FileText, Eye, ListTodo } from "lucide-react";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { Link } from "react-router-dom";

interface Project {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  created_at: string;
  due_date: string | null;
  created_by: string;
}

interface ProjectCardProps {
  project: Project;
  onUpdate: () => void;
}

const ProjectCard = ({ project }: ProjectCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "completed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "paused":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "פעיל";
      case "completed":
        return "הושלם";
      case "paused":
        return "מושהה";
      case "cancelled":
        return "בוטל";
      default:
        return status;
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case "high":
        return "גבוהה";
      case "medium":
        return "בינונית";
      case "low":
        return "נמוכה";
      default:
        return priority;
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl font-semibold text-right">
            {project.title}
          </CardTitle>
          <div className="flex gap-2">
            <Badge className={getStatusColor(project.status)}>
              {getStatusText(project.status)}
            </Badge>
            <Badge className={getPriorityColor(project.priority)}>
              {getPriorityText(project.priority)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {project.description && (
          <p className="text-gray-600 dark:text-gray-400 text-right mb-4 line-clamp-3">
            {project.description}
          </p>
        )}
        
        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>נוצר: {format(new Date(project.created_at), "dd/MM/yyyy", { locale: he })}</span>
          </div>
          {project.due_date && (
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>יעד: {format(new Date(project.due_date), "dd/MM/yyyy", { locale: he })}</span>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex gap-2">
        <Link to={`/project/${project.id}`} className="flex-1">
          <Button variant="outline" className="w-full flex items-center gap-2">
            <Eye className="h-4 w-4" />
            צפה בפרויקט
          </Button>
        </Link>
        <Link to={`/project/${project.id}/tasks`} className="flex-1">
          <Button variant="default" className="w-full flex items-center gap-2">
            <ListTodo className="h-4 w-4" />
            משימות
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default ProjectCard;
