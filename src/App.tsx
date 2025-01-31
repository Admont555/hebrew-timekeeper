import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import TeamMembers from "./pages/TeamMembers";
import Index from "./pages/Index";
import Login from "./pages/Login";
import { useEffect, useState } from "react";
import { supabase } from "./integrations/supabase/client";
import { useToast } from "./hooks/use-toast";

const queryClient = new QueryClient();

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check current session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const isAuth = !!session;
      const userEmail = session?.user?.email || null;
      
      setIsAuthenticated(isAuth);
      setCurrentUser(userEmail);
      setIsLoading(false);
    };

    checkSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const isAuth = !!session;
      const userEmail = session?.user?.email || null;
      
      setIsAuthenticated(isAuth);
      setCurrentUser(userEmail);
      
      if (!isAuth) {
        toast({
          title: "התנתקת מהמערכת",
          description: "נא להתחבר מחדש",
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [toast]);

  if (isLoading) {
    return null; // or a loading spinner
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route 
                path="/login" 
                element={
                  isAuthenticated ? (
                    <Navigate to={`/member/${currentUser}`} replace />
                  ) : (
                    <Login />
                  )
                } 
              />
              <Route 
                path="/" 
                element={
                  !isAuthenticated ? (
                    <Navigate to="/login" replace />
                  ) : currentUser ? (
                    <Navigate to={`/member/${currentUser}`} replace />
                  ) : (
                    <TeamMembers />
                  )
                } 
              />
              <Route 
                path="/member/:workerId" 
                element={
                  !isAuthenticated ? (
                    <Navigate to="/login" replace />
                  ) : (
                    <Index />
                  )
                } 
              />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;