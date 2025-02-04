import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = 'admin' | 'editor';

export const useUserRole = () => {
  const { data: roles, isLoading } = useQuery({
    queryKey: ['user-roles'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data: roles, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (error) throw error;
      return roles?.map(r => r.role as AppRole) || [];
    },
  });

  const isAdmin = roles?.includes('admin') || false;
  const isEditor = roles?.includes('editor') || false;

  return {
    roles,
    isAdmin,
    isEditor,
    isLoading,
  };
};