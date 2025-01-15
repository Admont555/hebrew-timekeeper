import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Label } from "@/components/ui/label";

interface TaskFormProps {
  onAddTask: (title: string, duration: number) => void;
}

const TaskForm = ({ onAddTask }: TaskFormProps) => {
  const [title, setTitle] = useState("");
  const [hours, setHours] = useState("0");
  const [minutes, setMinutes] = useState("0");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      const totalMinutes = (parseInt(hours) * 60) + parseInt(minutes);
      onAddTask(title.trim(), totalMinutes);
      setTitle("");
      setHours("0");
      setMinutes("0");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-6">
      <div className="flex gap-2">
        <Input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="הוסף משימה חדשה..."
          className="text-right"
        />
        <Button type="submit">הוסף</Button>
      </div>
      <div className="flex gap-4 justify-end">
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min="0"
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
            className="w-20 text-right"
          />
          <Label>דקות</Label>
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min="0"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            className="w-20 text-right"
          />
          <Label>שעות</Label>
        </div>
      </div>
    </form>
  );
};

export default TaskForm;