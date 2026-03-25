import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  worker_id: string;
  created_at: string;
}

export const useCategories = (workerId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["categories", workerId],
    queryFn: async () => {
      if (!workerId) return [];
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("worker_id", workerId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as Category[];
    },
    enabled: !!workerId,
  });

  const addCategory = useMutation({
    mutationFn: async ({ name, color, icon }: { name: string; color: string; icon: string }) => {
      const { error } = await supabase
        .from("categories")
        .insert({ name, color, icon, worker_id: workerId! });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast({ title: "קטגוריה נוצרה בהצלחה" });
    },
    onError: () => {
      toast({ title: "שגיאה ביצירת קטגוריה", variant: "destructive" });
    },
  });

  const updateCategory = useMutation({
    mutationFn: async ({ id, name, color, icon }: { id: string; name: string; color: string; icon: string }) => {
      const { error } = await supabase
        .from("categories")
        .update({ name, color, icon })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast({ title: "קטגוריה עודכנה בהצלחה" });
    },
    onError: () => {
      toast({ title: "שגיאה בעדכון קטגוריה", variant: "destructive" });
    },
  });

  const deleteCategory = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast({ title: "קטגוריה נמחקה" });
    },
    onError: () => {
      toast({ title: "שגיאה במחיקת קטגוריה", variant: "destructive" });
    },
  });

  return { categories, isLoading, addCategory, updateCategory, deleteCategory };
};
