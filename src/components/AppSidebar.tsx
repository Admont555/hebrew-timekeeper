import { motion } from "framer-motion";
import { Menu } from "lucide-react";
import { useState } from "react";
import { useLocation } from "react-router-dom";

export function AppSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Sidebar Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="fixed top-20 right-4 z-50 p-2 rounded-lg bg-background/80 backdrop-blur-sm border border-border hover:bg-accent hover:text-accent-foreground transition-colors"
        aria-label="Toggle Sidebar"
      >
        <Menu className="h-5 w-5" />
      </button>

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
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
              aria-label="Close Sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>

          <nav className="space-y-2">
            {/* Placeholder for future navigation items */}
            <div className="p-4 text-center text-muted-foreground">
              <p>תפריט הניווט יתווסף בקרוב</p>
            </div>
          </nav>
        </div>
      </motion.div>
    </>
  );
}