import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Mic, Square } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface VoiceInputProps {
  onTranscription: (text: string) => void;
}

const VoiceInput = ({ onTranscription }: VoiceInputProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        
        reader.onloadend = async () => {
          const base64Audio = (reader.result as string).split(',')[1];
          
          try {
            const { data, error } = await supabase.functions.invoke('voice-to-text', {
              body: { audio: base64Audio }
            });

            if (error) throw error;
            if (data.text) {
              onTranscription(data.text);
              toast({
                title: "קול זוהה בהצלחה",
                description: data.text,
              });
            }
          } catch (error) {
            console.error('Error transcribing audio:', error);
            toast({
              title: "שגיאה בזיהוי קול",
              description: "לא הצלחנו לזהות את הקול, נסה שוב",
              variant: "destructive",
            });
          }
        };

        reader.readAsDataURL(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: "שגיאה בגישה למיקרופון",
        description: "אנא אשר גישה למיקרופון ונסה שוב",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={isRecording ? stopRecording : startRecording}
            className={`transition-colors duration-200 ${
              isRecording 
                ? 'bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50' 
                : 'hover:bg-purple-50 dark:hover:bg-gray-700'
            }`}
          >
            {isRecording ? (
              <Square className="h-4 w-4 text-red-500" />
            ) : (
              <Mic className="h-4 w-4 text-purple-500" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p>{isRecording ? "הפסק הקלטה" : "התחל הקלטה"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default VoiceInput;
