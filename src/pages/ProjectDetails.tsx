import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowRight, Edit, Trash2, Upload, Download, FileText, Plus, StickyNote } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import ProjectForm from "@/components/project/ProjectForm";
import FileUpload from "@/components/project/FileUpload";
import TaskList from "@/components/TaskList";
import ProjectNoteForm from "@/components/project/ProjectNoteForm";
import ProjectNoteEditForm from "@/components/project/ProjectNoteEditForm";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { Task, TasksByDate, TaskPriority, Attachment } from "@/types/task";
import 'react-quill/dist/quill.snow.css';

const ProjectDetails = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  const { data: project, isLoading } = useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .single();

      if (error) {
        console.error("Error fetching project:", error);
        throw error;
      }

      return data;
    },
  });

  const { data: projectFiles } = useQuery({
    queryKey: ["project-files", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_files")
        .select("*")
        .eq("project_id", projectId)
        .order("uploaded_at", { ascending: false });

      if (error) {
        console.error("Error fetching project files:", error);
        throw error;
      }

      return data;
    },
  });

  const { data: projectTasks, isLoading: tasksLoading } = useQuery({
    queryKey: ["project-tasks", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("project_id", projectId)
        .order("timestamp", { ascending: false });

      if (error) {
        console.error("Error fetching project tasks:", error);
        throw error;
      }

      // Transform the data to match the Task interface
      return (data || []).map(task => ({
        ...task,
        progress: 0, // Default value since this column doesn't exist in database
        dependencies: [], // Default value since this column doesn't exist in database
        attachments: (task.attachments || []).map((att: any) => ({
          id: att.id || crypto.randomUUID(),
          name: att.name || '',
          url: att.url || '',
          type: att.type || '',
          size: att.size
        } as Attachment))
      })) as Task[];
    },
  });

  const { data: projectNotes } = useQuery({
    queryKey: ["project-notes", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_notes")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching project notes:", error);
        throw error;
      }

      return data;
    },
  });

  // Group tasks by date
  const tasksByDate: TasksByDate = {};
  if (projectTasks) {
    projectTasks.forEach((task) => {
      const dateKey = task.date || format(new Date(task.timestamp || new Date()), "yyyy-MM-dd");
      if (!tasksByDate[dateKey]) {
        tasksByDate[dateKey] = [];
      }
      tasksByDate[dateKey].push(task);
    });
  }

  const handleToggleTask = async (taskId: string) => {
    const task = projectTasks?.find(t => t.id === taskId);
    if (!task) return;

    const { error } = await supabase
      .from("tasks")
      .update({ completed: !task.completed })
      .eq("id", taskId);

    if (error) {
      console.error("Error updating task:", error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בעדכון המשימה",
        variant: "destructive",
      });
      return;
    }

    queryClient.invalidateQueries({ queryKey: ["project-tasks", projectId] });
  };

  const handleTaskComplete = async (taskId: string) => {
    const { error } = await supabase
      .from("tasks")
      .update({ completed: true })
      .eq("id", taskId);

    if (error) {
      console.error("Error completing task:", error);
      return;
    }

    queryClient.invalidateQueries({ queryKey: ["project-tasks", projectId] });
    toast({
      title: "משימה הושלמה!",
      description: "המשימה סומנה כהושלמה",
    });
  };

  const handleDeleteTask = async (taskId: string) => {
    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", taskId);

    if (error) {
      console.error("Error deleting task:", error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה במחיקת המשימה",
        variant: "destructive",
      });
      return;
    }

    queryClient.invalidateQueries({ queryKey: ["project-tasks", projectId] });
    toast({
      title: "משימה נמחקה",
      description: "המשימה הוסרה בהצלחה",
    });
  };

  const handleEditTask = async (taskId: string, newTitle: string, newDuration: number, newPriority: TaskPriority) => {
    const { error } = await supabase
      .from("tasks")
      .update({ 
        title: newTitle, 
        duration: newDuration, 
        priority: newPriority 
      })
      .eq("id", taskId);

    if (error) {
      console.error("Error updating task:", error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בעדכון המשימה",
        variant: "destructive",
      });
      return;
    }

    queryClient.invalidateQueries({ queryKey: ["project-tasks", projectId] });
    toast({
      title: "משימה עודכנה",
      description: "השינויים נשמרו בהצלחה",
    });
  };

  const handleNotesUpdated = () => {
    queryClient.invalidateQueries({ queryKey: ["project-notes", projectId] });
  };

  const deleteNoteMutation = useMutation({
    mutationFn: async (noteId: string) => {
      const { error } = await supabase
        .from("project_notes")
        .delete()
        .eq("id", noteId);

      if (error) throw error;
    },
    onSuccess: () => {
      handleNotesUpdated();
      toast({
        title: "פתק נמחק",
        description: "הפתק הוסר בהצלחה",
      });
    },
    onError: (error) => {
      console.error("Error deleting note:", error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה במחיקת הפתק",
        variant: "destructive",
      });
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", projectId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "פרויקט נמחק בהצלחה",
        description: "הפרויקט הוסר מהמערכת",
      });
      navigate("/projects");
    },
    onError: (error) => {
      console.error("Error deleting project:", error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה במחיקת הפרויקט",
        variant: "destructive",
      });
    },
  });

  const handleProjectUpdated = () => {
    setIsEditDialogOpen(false);
    queryClient.invalidateQueries({ queryKey: ["project", projectId] });
    toast({
      title: "פרויקט עודכן בהצלחה",
      description: "השינויים נשמרו",
    });
  };

  const handleFilesUpdated = () => {
    queryClient.invalidateQueries({ queryKey: ["project-files", projectId] });
  };

  const downloadFile = async (file: any) => {
    try {
      const { data, error } = await supabase.storage
        .from("project-files")
        .download(file.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading file:", error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בהורדת הקובץ",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            פרויקט לא נמצא
          </h1>
          <Button onClick={() => navigate("/projects")}>
            <ArrowRight className="h-4 w-4 ml-2" />
            חזור לרשימת הפרויקטים
          </Button>
        </div>
      </div>
    );
  }

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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" onClick={() => navigate("/projects")}>
          <ArrowRight className="h-4 w-4 ml-2" />
          חזור לפרויקטים
        </Button>
        <div className="flex gap-2">
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Edit className="h-4 w-4 ml-2" />
                עריכה
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>עריכת פרויקט</DialogTitle>
              </DialogHeader>
              <ProjectForm project={project} onSuccess={handleProjectUpdated} />
            </DialogContent>
          </Dialog>
          <Button
            variant="destructive"
            onClick={() => deleteProjectMutation.mutate()}
            disabled={deleteProjectMutation.isPending}
          >
            <Trash2 className="h-4 w-4 ml-2" />
            מחק פרויקט
          </Button>
        </div>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-3xl font-bold text-right">
              {project.title}
            </CardTitle>
            <Badge className={getStatusColor(project.status)}>
              {getStatusText(project.status)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {project.description && (
            <p className="text-gray-600 dark:text-gray-400 text-right mb-4 text-lg">
              {project.description}
            </p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-semibold">תאריך יצירה:</span>
              <br />
              {format(new Date(project.created_at), "dd/MM/yyyy HH:mm", { locale: he })}
            </div>
            {project.due_date && (
              <div>
                <span className="font-semibold">תאריך יעד:</span>
                <br />
                {format(new Date(project.due_date), "dd/MM/yyyy", { locale: he })}
              </div>
            )}
            <div>
              <span className="font-semibold">עדיפות:</span>
              <br />
              {project.priority === "high" ? "גבוהה" : project.priority === "medium" ? "בינונית" : "נמוכה"}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="tasks" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="tasks">משימות</TabsTrigger>
          <TabsTrigger value="notes">פתקים</TabsTrigger>
          <TabsTrigger value="files">קבצים</TabsTrigger>
          <TabsTrigger value="details">פרטים נוספים</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>משימות הפרויקט</CardTitle>
            </CardHeader>
            <CardContent>
              {projectTasks && projectTasks.length > 0 ? (
                <TaskList
                  tasks={tasksByDate}
                  isLoading={tasksLoading}
                  onToggleTask={handleToggleTask}
                  onTaskComplete={handleTaskComplete}
                  onDeleteTask={handleDeleteTask}
                  onEditTask={handleEditTask}
                />
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                  אין משימות מקושרות לפרויקט זה
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                פתקי הפרויקט
                <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 ml-2" />
                      הוסף פתק
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>הוסף פתק חדש</DialogTitle>
                    </DialogHeader>
                    <ProjectNoteForm 
                      projectId={projectId!} 
                      onSuccess={() => {
                        setIsNoteDialogOpen(false);
                        handleNotesUpdated();
                      }} 
                    />
                  </DialogContent>
                </Dialog>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {projectNotes && projectNotes.length > 0 ? (
                <Accordion type="multiple" className="w-full" dir="rtl">
                  {projectNotes.map((note) => (
                    <AccordionItem key={note.id} value={note.id}>
                      <AccordionTrigger className="text-right hover:no-underline">
                        <div className="flex items-center gap-2 flex-1">
                          <StickyNote className="h-5 w-5 text-yellow-500" />
                          <span className="font-medium text-lg">{note.title}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        {editingNoteId === note.id ? (
                          <ProjectNoteEditForm
                            note={note}
                            onSuccess={() => {
                              setEditingNoteId(null);
                              handleNotesUpdated();
                            }}
                            onCancel={() => setEditingNoteId(null)}
                          />
                        ) : (
                          <div className="border rounded-lg p-4">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setEditingNoteId(note.id)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      disabled={deleteNoteMutation.isPending}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent dir="rtl" className="text-right">
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>האם אתה בטוח?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        פעולה זו תמחק את הפתק לצמיתות ולא ניתן יהיה לשחזר אותו.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter className="flex-row-reverse">
                                      <AlertDialogCancel>ביטול</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => deleteNoteMutation.mutate(note.id)}>
                                        מחק
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </div>
                            <div 
                              className="prose prose-sm max-w-none mb-3 text-gray-900 dark:text-gray-100"
                              style={{ 
                                direction: 'rtl', 
                                textAlign: 'right',
                                fontSize: '18px',
                                lineHeight: '1.6'
                              }}
                              dangerouslySetInnerHTML={{ __html: note.content }}
                            />
                            <div className="text-sm text-gray-500">
                              נוצר: {format(new Date(note.created_at), "dd/MM/yyyy HH:mm", { locale: he })}
                              {note.updated_at !== note.created_at && (
                                <span className="mr-4">
                                  • עודכן: {format(new Date(note.updated_at), "dd/MM/yyyy HH:mm", { locale: he })}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                  אין פתקים לפרויקט זה
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="files" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                קבצי הפרויקט
                <FileUpload projectId={projectId!} onFilesUpdated={handleFilesUpdated} />
              </CardTitle>
            </CardHeader>
            <CardContent>
              {projectFiles && projectFiles.length > 0 ? (
                <div className="space-y-2">
                  {projectFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-blue-500" />
                        <div>
                          <p className="font-medium">{file.file_name}</p>
                          <p className="text-sm text-gray-500">
                            הועלה: {format(new Date(file.uploaded_at), "dd/MM/yyyy HH:mm", { locale: he })}
                            {file.file_size && ` • ${Math.round(file.file_size / 1024)} KB`}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => downloadFile(file)}>
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                  אין קבצים מצורפים לפרויקט זה
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>פרטים נוספים על הפרויקט</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <span className="font-semibold">נוצר על ידי:</span> {project.created_by}
                </div>
                <div>
                  <span className="font-semibold">עדכון אחרון:</span>{" "}
                  {format(new Date(project.updated_at), "dd/MM/yyyy HH:mm", { locale: he })}
                </div>
                <div>
                  <span className="font-semibold">מזהה פרויקט:</span> {project.id}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectDetails;
