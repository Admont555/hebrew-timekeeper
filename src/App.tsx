
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import TeamMembers from "./pages/TeamMembers";
import Settings from "./pages/Settings";
import Tables from "./pages/Tables";
import TableView from "./pages/TableView";
import Index from "./pages/Index";
import Login from "./pages/Login";
import WorkflowCreator from "./pages/WorkflowCreator";
import Workflows from "./pages/Workflows";
import { useEffect, useState } from "react";
import { supabase } from "./integrations/supabase/client";
import { useToast } from "./hooks/use-toast";
import { AppSidebar } from "./components/AppSidebar";
import { NavMenu } from "./components/NavMenu";
import Footer from "./components/Footer";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  console.log("App component starting to render");
  
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    console.log("App useEffect - starting auth initialization");
    
    const initAuth = async () => {
      try {
        console.log("Getting session...");
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
          throw error;
        }

        console.log("Session data:", !!session);
        setIsAuthenticated(!!session);

        // Attempt to refresh the session if it exists
        if (session) {
          console.log("Refreshing session...");
          const { error: refreshError } = await supabase.auth.refreshSession();
          if (refreshError) {
            console.error('Session refresh error:', refreshError);
            // If refresh fails, sign out the user
            await supabase.auth.signOut();
            setIsAuthenticated(false);
            toast({
              title: "פג תוקף החיבור",
              description: "נא להתחבר מחדש",
              variant: "destructive",
            });
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setIsAuthenticated(false);
      } finally {
        console.log("Auth initialization complete, setting loading to false");
        setIsLoading(false);
      }
    };

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, !!session);
      
      if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        // Clear any cached data on sign out or token refresh
        queryClient.clear();
      }

      if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        toast({
          title: "התנתקת מהמערכת",
          description: "נא להתחבר מחדש",
        });
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setIsAuthenticated(true);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  console.log("App render state - isLoading:", isLoading, "isAuthenticated:", isAuthenticated);

  if (isLoading) {
    console.log("Showing loading spinner");
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white" />
      </div>
    );
  }

  console.log("App rendering main content");

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="flex flex-col min-h-screen">
              <NavMenu />
              {isAuthenticated && <AppSidebar />}
              <main className="flex-1">
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
                  <Route 
                    path="/tables" 
                    element={isAuthenticated ? <Tables /> : <Navigate to="/login" />} 
                  />
                  <Route 
                    path="/tables/:tableId" 
                    element={isAuthenticated ? <TableView /> : <Navigate to="/login" />} 
                  />
                  <Route 
                    path="/settings" 
                    element={isAuthenticated ? <Settings /> : <Navigate to="/login" />} 
                  />
                  <Route 
                    path="/workflows" 
                    element={isAuthenticated ? <Workflows /> : <Navigate to="/login" />} 
                  />
                  <Route 
                    path="/workflows/:workflowId" 
                    element={isAuthenticated ? <WorkflowCreator /> : <Navigate to="/login" />} 
                  />
                </Routes>
              </main>
              <Footer />
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
