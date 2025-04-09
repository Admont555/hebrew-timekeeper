import { LogOut, Menu, Moon, Sun, Clock } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

export function NavMenu() {
  const { theme, setTheme, isAutoTheme, setAutoTheme } = useTheme();
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  const toggleTheme = () => {
    if (isAutoTheme) {
      // If auto theme is enabled, turn it off first
      setAutoTheme(false);
    }
    setTheme(theme === "light" ? "dark" : "light");
  };

  const toggleAutoTheme = () => {
    setAutoTheme(!isAutoTheme);
  };

  const handleToggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    const event = new Event('toggleSidebar');
    window.dispatchEvent(event);
  };

  // Listen for clicks outside to detect when menu is closed
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (isMenuOpen && !(e.target as HTMLElement).closest('.menu-button')) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [isMenuOpen]);

  return (
    <>
      {/* Menu Icon with background only on mobile */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`fixed top-0 right-0 ${isMenuOpen ? 'z-[40]' : 'z-50'} w-full sm:w-auto p-4 safe-area-top safe-area-right ${isMobile ? 'glass-effect nav-mobile-header' : ''}`}
      >
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={handleToggleMenu}
                className="menu-button h-12 w-12 md:h-10 md:w-10 rounded-full shadow-md hover:bg-accent hover:scale-105 active:scale-95 transition-all duration-200 float-right"
                aria-label="פתח תפריט"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side={isMobile ? "bottom" : "left"}>
              <p>פתח תפריט</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </motion.div>

      {/* Other Icons with background only on mobile */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`fixed top-0 left-0 z-50 flex items-center gap-2 p-4 safe-area-top safe-area-left ${isMobile ? 'glass-effect nav-mobile-header' : ''}`}
      >
        <TooltipProvider>
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-12 md:h-10 md:w-10 rounded-full shadow-md hover:bg-accent hover:scale-105 active:scale-95 transition-all duration-200"
                    aria-label={isAutoTheme ? "מצב צבע אוטומטי" : (theme === "light" ? "הפעל מצב כהה" : "הפעל מצב בהיר")}
                  >
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      {isAutoTheme ? (
                        <Clock className="h-5 w-5 text-primary" />
                      ) : theme === "dark" ? (
                        <Moon className="h-5 w-5" />
                      ) : (
                        <Sun className="h-5 w-5" />
                      )}
                    </motion.div>
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent side={isMobile ? "bottom" : "right"}>
                <p>{isAutoTheme ? "מצב צבע אוטומטי" : (theme === "light" ? "הפעל מצב כהה" : "הפעל מצב בהיר")}</p>
              </TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="end" className="min-w-[180px]">
              <DropdownMenuItem onClick={toggleTheme} disabled={isAutoTheme}>
                {theme === "light" ? "הפעל מצב כהה" : "הפעל מצב בהיר"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={toggleAutoTheme}>
                {isAutoTheme ? "כבה מצב אוטומטי" : "הפעל מצב אוטומטי לפי שעה"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TooltipProvider>
        
        {!isLoginPage && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={logout}
                  className="h-12 w-12 md:h-10 md:w-10 rounded-full shadow-md hover:bg-destructive/10 hover:scale-105 active:scale-95 transition-all duration-200"
                  aria-label="התנתק מהמערכת"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side={isMobile ? "bottom" : "right"}>
                <p>התנתק מהמערכת</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </motion.div>
    </>
  );
}
