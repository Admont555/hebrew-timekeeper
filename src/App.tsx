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
import { AppSidebar } from "./components/AppSidebar";
import { NavMenu } from "./components/NavMenu";
import { SidebarProvider } from "@/components/ui/sidebar";

const queryClient = new QueryClient();

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      setIsLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      if (!session) {
        toast({
          title: "התנתקת מהמערכת",
          description: "נא להתחבר מחדש",
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isLoading) {
    return null; // or a loading spinner
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <SidebarProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              {isAuthenticated && <NavMenu />}
              {isAuthenticated && <AppSidebar />}
              <Routes>
                <Route 
                  path="/login" 
                  element={isAuthenticated ? <Navigate to="/" /> : <Login />} 
                />
                <Route 
                  path="/" 
                  element={isAuthenticated ? <TeamMembers /> : <Navigate to="/login" />} 
                />
                <Route 
                  path="/member/:workerId" 
                  element={isAuthenticated ? <Index /> : <Navigate to="/login" />} 
                />
              </Routes>
            </BrowserRouter>
          </SidebarProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;