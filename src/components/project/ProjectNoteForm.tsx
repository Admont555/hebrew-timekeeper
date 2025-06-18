
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface ProjectNoteFormProps {
  projectId: string;
  onSuccess: () => void;
}

const ProjectNoteForm = ({ projectId, onSuccess }: ProjectNoteFormProps) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [direction, setDirection] = useState<"rtl" | "ltr">("rtl");
  const [textAlign, setTextAlign] = useState<"right" | "left" | "center">("right");
  const { toast } = useToast();

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'color': [] }, { 'background': [] }],
      ['link'],
      ['clean']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'color', 'background',
    'link'
  ];

  const createNoteMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("project_notes")
        .insert({
          project_id: projectId,
          title: title.trim(),
          content: content.trim(),
          created_by: "current_user", // You can replace this with actual user info when auth is implemented
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "פתק נוצר בהצלחה",
        description: "הפתק נוסף לפרויקט",
      });
      setTitle("");
      setContent("");
      onSuccess();
    },
    onError: (error) => {
      console.error("Error creating note:", error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה ביצירת הפתק",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      toast({
        title: "שגיאה",
        description: "אנא מלא את כל השדות",
        variant: "destructive",
      });
      return;
    }

    createNoteMutation.mutate();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium mb-2">
          כותרת הפתק
        </label>
        <Input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="למשל: מייל מלקוח, פגישה, הערה חשובה..."
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            כיוון כתיבה
          </label>
          <Select value={direction} onValueChange={(value: "rtl" | "ltr") => setDirection(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rtl">עברית (ימין לשמאל)</SelectItem>
              <SelectItem value="ltr">אנגלית (שמאל לימין)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            יישור טקסט
          </label>
          <Select value={textAlign} onValueChange={(value: "right" | "left" | "center") => setTextAlign(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="right">ימין</SelectItem>
              <SelectItem value="center">מרכז</SelectItem>
              <SelectItem value="left">שמאל</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div>
        <label htmlFor="content" className="block text-sm font-medium mb-2">
          תוכן הפתק
        </label>
        <div 
          className="quill-container bg-white dark:bg-gray-800 border rounded-md"
          data-direction={direction}
          data-text-align={textAlign}
        >
          <ReactQuill
            theme="snow"
            value={content}
            onChange={setContent}
            modules={modules}
            formats={formats}
            placeholder="רשום כאן את תוכן המייל, פרטי הפגישה, או כל מידע רלוונטי אחר... אפשר להשתמש בעיצוב טקסט עשיר"
            style={{ 
              minHeight: '200px'
            }}
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button 
          type="submit" 
          disabled={createNoteMutation.isPending || !title.trim() || !content.trim()}
        >
          {createNoteMutation.isPending ? "שומר..." : "שמור פתק"}
        </Button>
      </div>
    </form>
  );
};

export default ProjectNoteForm;
