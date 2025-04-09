
import { motion } from "framer-motion";
import { Menu, X, ListChecks } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { Button } from "./ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Drawer,
  DrawerContent,
  DrawerOverlay,
  DrawerTrigger,
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
    { name: "משימות", path: "/" },
    { name: "טבלאות", path: "/tables" },
    { name: "זרימות עבודה", path: "/workflows", icon: <ListChecks className="h-4 w-4 ml-2" /> },
    { name: "הגדרות", path: "/settings" },
  ];

  // Mobile uses a drawer, desktop uses a sidebar
  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={setIsOpen} direction="right">
        <DrawerOverlay className="bg-background/80 backdrop-blur-sm" />
        <DrawerContent className="bg-sidebar text-sidebar-foreground border-l border-sidebar-border shadow-lg rtl">
          <div className="flex flex-col h-full p-4 pt-24 safe-area-top safe-area-right safe-area-bottom">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">תפריט</h2>
              <Button
                onClick={toggleSidebar}
                variant="ghost"
                size="icon"
                className="h-10 w-10 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-full"
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
                  className={`flex items-center px-4 py-4 rounded-lg transition-colors ${
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
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
        />
      )}

      {/* Sidebar */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: isOpen ? "0%" : "100%" }}
        transition={{ type: "spring", bounce: 0, duration: 0.4 }}
        className="fixed top-0 right-0 h-full w-[280px] bg-sidebar text-sidebar-foreground border-l border-sidebar-border shadow-lg z-50 overflow-hidden safe-area-top safe-area-right safe-area-bottom"
      >
        <div className="flex flex-col h-full p-4 pt-24">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">תפריט</h2>
            <Button
              onClick={toggleSidebar}
              variant="ghost"
              size="icon"
              className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
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
                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
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
