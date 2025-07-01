
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { navItems } from "./nav-items";
import Dashboard from "./pages/Dashboard";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Settings from "./pages/Settings";
import Tables from "./pages/Tables";
import TableView from "./pages/TableView";
import Projects from "./pages/Projects";
import ProjectDetails from "./pages/ProjectDetails";
import ProjectTasks from "./pages/ProjectTasks";
import TeamMembers from "./pages/TeamMembers";
import WorkflowCreator from "./pages/WorkflowCreator";
import Workflows from "./pages/Workflows";
import TimeTracking from "./pages/TimeTracking";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ThemeProvider } from "@/components/ThemeProvider";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SidebarProvider>
            <div className="min-h-screen flex w-full">
              <AppSidebar />
              <main className="flex-1">
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/" element={<Index />} />
                  <Route path="/member/:workerId" element={<Index />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/tables" element={<Tables />} />
                  <Route path="/table/:tableId" element={<TableView />} />
                  <Route path="/projects" element={<Projects />} />
                  <Route path="/project/:projectId" element={<ProjectDetails />} />
                  <Route path="/project/:projectId/tasks" element={<ProjectTasks />} />
                  <Route path="/team" element={<TeamMembers />} />
                  <Route path="/workflows" element={<Workflows />} />
                  <Route path="/workflow/:workflowId" element={<WorkflowCreator />} />
                  <Route path="/time-tracking" element={<TimeTracking />} />
                </Routes>
              </main>
            </div>
          </SidebarProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
