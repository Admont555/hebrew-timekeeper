
import { Home, Users, Table2, Settings, Workflow } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function AppSidebar() {
  const location = useLocation();
  
  const links = [
    {
      href: "/",
      icon: Users,
      label: "חברי צוות"
    },
    {
      href: "/tables",
      icon: Table2,
      label: "טבלאות"
    },
    {
      href: "/workflow-creator",
      icon: Workflow,
      label: "צור זרימת עבודה"
    },
    {
      href: "/settings",
      icon: Settings,
      label: "הגדרות"
    }
  ];

  return (
    <motion.aside 
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="fixed right-0 top-[3.5rem] h-[calc(100vh-3.5rem)] w-56 border-l bg-background p-3 shadow-sm"
    >
      <nav className="space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted",
                location.pathname === link.href ? "bg-muted font-medium" : "text-muted-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </motion.aside>
  );
}
