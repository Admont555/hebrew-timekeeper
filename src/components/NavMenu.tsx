import { LogOut, Menu, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";
import { logout } from "@/utils/auth";
import { useLocation } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import { useState } from "react";

export function NavMenu() {
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed top-4 left-4 z-50 flex items-center gap-2"
    >
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              className="hover:bg-accent hover:scale-105 active:scale-95 transition-all duration-200"
              aria-label={theme === "light" ? "הפעל מצב כהה" : "הפעל מצב בהיר"}
            >
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                {theme === "dark" ? (
                  <Moon className="h-5 w-5" />
                ) : (
                  <Sun className="h-5 w-5" />
                )}
              </motion.div>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>{theme === "light" ? "הפעל מצב כהה" : "הפעל מצב בהיר"}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      {!isLoginPage && (
        <>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="hover:bg-accent hover:scale-105 active:scale-95 transition-all duration-200"
                  aria-label="פתח תפריט"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>פתח תפריט</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={logout}
                  className="hover:bg-destructive/10 hover:scale-105 active:scale-95 transition-all duration-200"
                  aria-label="התנתק מהמערכת"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>התנתק מהמערכת</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </>
      )}
    </motion.div>
  );
}