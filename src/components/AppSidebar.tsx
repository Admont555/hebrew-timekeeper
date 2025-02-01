import { motion } from "framer-motion";
import { Menu } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { Button } from "./ui/button";

export function AppSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleToggle = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail?.force) {
        setIsOpen(true);
      } else {
        setIsOpen(prev => !prev);
      }
    };

    window.addEventListener('toggleSidebar', handleToggle);
    
    return () => {
      window.removeEventListener('toggleSidebar', handleToggle);
    };
  }, []);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const menuItems = [
    { name: "משימות", path: "/" },
    { name: "צוות", path: "/team" },
    { name: "דוחות", path: "/reports" },
    { name: "תבניות", path: "/templates" },
    { name: "הגדרות", path: "/settings" },
  ];

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
        className="fixed top-0 right-0 h-full w-[280px] bg-sidebar text-sidebar-foreground border-l border-sidebar-border shadow-lg z-50 overflow-hidden"
      >
        <div className="flex flex-col h-full p-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">תפריט</h2>
            <Button
              onClick={toggleSidebar}
              variant="ghost"
              size="icon"
              className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              aria-label="סגור תפריט"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>

          <nav className="space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`block px-4 py-2 rounded-lg transition-colors ${
                  location.pathname === item.path
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "hover:bg-sidebar-accent/50"
                }`}
                onClick={toggleSidebar}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </motion.div>
    </>
  );
}