import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import TableCard from "@/components/table/TableCard";

interface Table {
  id: string;
  name: string;
  created_at: string | null;
  created_by: string;
  updated_at: string | null;
}

export default function Tables() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTableName, setNewTableName] = useState("");
  const { toast } = useToast();

  const { data: tables = [], refetch } = useQuery({
    queryKey: ['tables'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tables')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      return (data || []) as Table[];
    },
  });

  const handleCreateTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableName.trim()) return;

    try {
      const { error } = await supabase
        .from('tables')
        .insert([{ name: newTableName.trim() }]);

      if (error) throw error;

      toast({
        title: "טבלה נוצרה בהצלחה",
        description: `הטבלה "${newTableName}" נוצרה`,
      });

      setNewTableName("");
      setIsDialogOpen(false);
      refetch();
    } catch (error) {
      console.error('Error creating table:', error);
      toast({
        title: "שגיאה ביצירת הטבלה",
        description: "אנא נסה שוב מאוחר יותר",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4">ניהול טבלאות</h1>
          <p className="text-muted-foreground mb-6">צור וערוך טבלאות מותאמות אישית</p>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                צור טבלה חדשה
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]" dir="rtl">
              <DialogHeader>
                <DialogTitle>צור טבלה חדשה</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateTable} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">שם הטבלה</Label>
                  <Input
                    id="name"
                    value={newTableName}
                    onChange={(e) => setNewTableName(e.target.value)}
                    placeholder="הזן שם לטבלה..."
                    className="text-right"
                  />
                </div>
                <div className="flex justify-end">
                  <Button type="submit">צור טבלה</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto"
        >
          {tables.map((table) => (
            <TableCard
              key={table.id}
              id={table.id}
              name={table.name}
              onDelete={refetch}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
}