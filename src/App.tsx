import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import TeamMembers from "./pages/TeamMembers";
import TableCreation from "./pages/TableCreation";
import Index from "./pages/Index";
import Login from "./pages/Login";
import { useEffect, useState } from "react";
import { supabase } from "./integrations/supabase/client";
import { useToast } from "./hooks/use-toast";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

const queryClient = new QueryClient();

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
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

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (isLoading) {
    return null;
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
                element={isAuthenticated ? <Navigate to="/" /> : <Login />} 
              />
              <Route 
                path="/" 
                element={
                  isAuthenticated ? (
                    <SidebarProvider defaultOpen={sidebarOpen} onOpenChange={setSidebarOpen}>
                      <div className="min-h-screen flex w-full flex-row-reverse bg-gradient-to-br from-purple-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="fixed top-4 right-4 z-50 hover:bg-purple-100 dark:hover:bg-purple-900/20"
                          onClick={toggleSidebar}
                        >
                          <Menu className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                          <span className="sr-only">Toggle Sidebar</span>
                        </Button>
                        <TeamMembers />
                      </div>
                    </SidebarProvider>
                  ) : (
                    <Navigate to="/login" />
                  )
                } 
              />
              <Route 
                path="/table-creation" 
                element={
                  isAuthenticated ? (
                    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
                      <TableCreation />
                    </div>
                  ) : (
                    <Navigate to="/login" />
                  )
                } 
              />
              <Route 
                path="/member/:workerId" 
                element={
                  isAuthenticated ? (
                    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
                      <Index />
                    </div>
                  ) : (
                    <Navigate to="/login" />
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