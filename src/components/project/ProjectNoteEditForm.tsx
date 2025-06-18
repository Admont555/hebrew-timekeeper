
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface ProjectNoteEditFormProps {
  note: {
    id: string;
    title: string;
    content: string;
  };
  onSuccess: () => void;
  onCancel: () => void;
}

const ProjectNoteEditForm = ({ note, onSuccess, onCancel }: ProjectNoteEditFormProps) => {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
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

  const updateNoteMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("project_notes")
        .update({
          title: title.trim(),
          content: content.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", note.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "פתק עודכן בהצלחה",
        description: "השינויים נשמרו",
      });
      onSuccess();
    },
    onError: (error) => {
      console.error("Error updating note:", error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בעדכון הפתק",
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

    updateNoteMutation.mutate();
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
          placeholder="כותרת הפתק..."
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
            placeholder="תוכן הפתק..."
            style={{ 
              minHeight: '200px'
            }}
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button 
          type="submit" 
          disabled={updateNoteMutation.isPending || !title.trim() || !content.trim()}
        >
          {updateNoteMutation.isPending ? "שומר..." : "שמור שינויים"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          ביטול
        </Button>
      </div>
    </form>
  );
};

export default ProjectNoteEditForm;
