import { supabase } from "@/integrations/supabase/client";

export const logout = async () => {
  const { error } = await supabase.auth.signOut();
  if (!error) {
    window.location.href = '/login';
  }
  return error;
};

export const getSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) {
    console.error('Error getting session:', error);
    return null;
  }
  return session;
};

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Error getting user:', error);
    return null;
  }
  return user;
};