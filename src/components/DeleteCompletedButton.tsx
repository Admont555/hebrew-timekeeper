import { Button } from "./ui/button";
import { Trash2 } from "lucide-react";
import { motion } from "framer-motion";

interface DeleteCompletedButtonProps {
  onDelete: () => void;
}

const DeleteCompletedButton = ({ onDelete }: DeleteCompletedButtonProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="mb-4 flex justify-end"
    >
      <Button
        variant="destructive"
        size="sm"
        onClick={onDelete}
        className="flex items-center gap-2"
      >
        <Trash2 className="h-4 w-4" />
        מחק משימות שהושלמו
      </Button>
    </motion.div>
  );
};

export default DeleteCompletedButton;