import { supabase } from "@/integrations/supabase/client";

export const logout = () => {
  localStorage.removeItem('worker_session');
  window.location.href = '/login';
};

export const getWorkerSession = () => {
  const session = localStorage.getItem('worker_session');
  return session ? JSON.parse(session) : null;
};