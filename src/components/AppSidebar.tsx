
import { motion } from "framer-motion";
import { Menu, X, ListChecks, Users, Settings, Table2, FolderOpen, Timer } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { Button } from "./ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerFooter,
} from "@/components/ui/drawer";

export function AppSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleToggle = () => {
      setIsOpen(true);
    };

    window.addEventListener('toggleSidebar', handleToggle);
    
    return () => {
      window.removeEventListener('toggleSidebar', handleToggle);
    };
  }, []);

  useEffect(() => {
    // Close sidebar on route change for mobile
    if (isMobile) {
      setIsOpen(false);
    }
  }, [location.pathname, isMobile]);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const menuItems = [
    { name: "צוות העבודה", path: "/team", icon: <Users className="h-5 w-5 ml-2" /> },
    { name: "פרויקטים", path: "/projects", icon: <FolderOpen className="h-5 w-5 ml-2" /> },
    { name: "טבלאות", path: "/tables", icon: <Table2 className="h-5 w-5 ml-2" /> },
    { name: "זרימות עבודה", path: "/workflows", icon: <ListChecks className="h-5 w-5 ml-2" /> },
    { name: "ניהול זמן", path: "/time-tracking", icon: <Timer className="h-5 w-5 ml-2" /> },
    { name: "הגדרות", path: "/settings", icon: <Settings className="h-5 w-5 ml-2" /> },
  ];

  // Mobile uses a drawer, desktop uses a sidebar
  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={setIsOpen} direction="right">
        <DrawerOverlay className="bg-background/80 z-40" />
        <DrawerContent className="h-full w-[85%] max-w-[300px] bg-sidebar text-sidebar-foreground border-l border-sidebar-border shadow-lg pt-safe-top z-50">
          <DrawerHeader className="px-4 pt-6 pb-2">
            <DrawerTitle className="text-xl font-semibold">תפריט</DrawerTitle>
            <DrawerClose asChild>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-4 h-10 w-10 rounded-full hover:bg-sidebar-accent hover:text-sidebar-accent-foreground min-h-[44px] min-w-[44px]"
                aria-label="סגור תפריט"
              >
                <X className="h-5 w-5" />
              </Button>
            </DrawerClose>
          </DrawerHeader>
          
          <div className="flex flex-col h-full px-4 py-2 overflow-y-auto webkit-scroll" style={{ overscrollBehavior: 'contain' }}>
            <nav className="space-y-1 mt-4">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-4 py-4 rounded-lg transition-colors text-base min-h-[44px] ${
                    location.pathname === item.path
                      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      : "hover:bg-sidebar-accent/50"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {item.icon}
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          
          <DrawerFooter className="px-4 py-4 border-t border-sidebar-border">
            <p className="text-xs text-sidebar-foreground/70 text-center">גרסה 1.0.0</p>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  // Desktop sidebar
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={toggleSidebar}
          className="fixed inset-0 bg-background/80 z-40"
        />
      )}

      {/* Sidebar */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: isOpen ? "0%" : "100%" }}
        transition={{ type: "spring", bounce: 0, duration: 0.4 }}
        className="fixed top-0 right-0 h-full w-[280px] bg-sidebar text-sidebar-foreground border-l border-sidebar-border shadow-lg z-50 overflow-hidden"
      >
        <div className="flex flex-col h-full p-4 pt-24">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">תפריט</h2>
            <Button
              onClick={toggleSidebar}
              variant="ghost"
              size="icon"
              className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground min-h-[44px] min-w-[44px]"
              aria-label="סגור תפריט"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <nav className="space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3 rounded-lg transition-colors min-h-[44px] ${
                  location.pathname === item.path
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "hover:bg-sidebar-accent/50"
                }`}
                onClick={toggleSidebar}
              >
                {item.icon}
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </motion.div>
    </>
  );
}
