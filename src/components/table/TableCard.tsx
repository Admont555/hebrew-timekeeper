import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Table2, Edit2, Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TableCardProps {
  id: string;
  name: string;
  onDelete: () => void;
}

const TableCard = ({ id, name, onDelete }: TableCardProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [newName, setNewName] = useState(name);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('tables')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "טבלה נמחקה",
        description: "הטבלה נמחקה בהצלחה",
      });
      
      onDelete();
    } catch (error) {
      console.error('Error deleting table:', error);
      toast({
        title: "שגיאה במחיקת הטבלה",
        description: "אנא נסה שוב מאוחר יותר",
        variant: "destructive",
      });
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || newName === name) {
      setShowEditDialog(false);
      return;
    }

    try {
      const { error } = await supabase
        .from('tables')
        .update({ name: newName.trim() })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "טבלה עודכנה",
        description: "שם הטבלה עודכן בהצלחה",
      });

      setShowEditDialog(false);
      onDelete(); // This will refetch the tables
    } catch (error) {
      console.error('Error updating table:', error);
      toast({
        title: "שגיאה בעדכון הטבלה",
        description: "אנא נסה שוב מאוחר יותר",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="relative group">
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="cursor-pointer"
        onClick={() => navigate(`/table/${id}`)}
      >
        <Card className="p-6 flex flex-col items-center gap-4 bg-gradient-to-br from-white/90 via-white/80 to-white/70 dark:from-gray-800/90 dark:via-gray-800/80 dark:to-gray-800/70 backdrop-blur-sm border-2 transition-all duration-300 border-transparent hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5">
          <div className="relative">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center ring-2 ring-offset-2 ring-offset-background transition-all duration-300 group-hover:ring-primary">
                <Table2 className="h-12 w-12 text-primary/70" />
              </div>
            </motion.div>
          </div>
          <motion.div 
            className="flex flex-col items-center gap-1"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="text-xl font-semibold text-center bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              {name}
            </h3>
          </motion.div>
        </Card>
      </motion.div>
      
      <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
        <Button
          size="icon"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            setShowEditDialog(true);
          }}
          className="h-8 w-8"
        >
          <Edit2 className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            setShowDeleteDialog(true);
          }}
          className="h-8 w-8"
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="sm:max-w-[425px]">
          <AlertDialogHeader>
            <AlertDialogTitle>האם אתה בטוח שברצונך למחוק את הטבלה?</AlertDialogTitle>
            <AlertDialogDescription>
              פעולה זו היא בלתי הפיכה. הטבלה תימחק לצמיתות.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              מחק
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[425px]" dir="rtl">
          <DialogHeader>
            <DialogTitle>ערוך שם טבלה</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">שם הטבלה</Label>
              <Input
                id="edit-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="text-right"
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit">שמור שינויים</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TableCard;