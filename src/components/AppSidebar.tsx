import { Table, Plus } from "lucide-react";
import { useLocation, Link } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { motion } from "framer-motion";

const items = [
  {
    title: "חברי צוות",
    url: "/",
    icon: Table,
  },
  {
    title: "יצירת טבלה",
    url: "/table-creation",
    icon: Plus,
  },
];

const menuItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 }
};

export function AppSidebar() {
  const location = useLocation();

  return (
    <Sidebar 
      side="right" 
      variant="floating"
      className="border-l border-purple-200/30 dark:border-purple-800/30 bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl transition-all duration-300 ease-in-out"
    >
      <SidebarContent className="scrollbar-thin scrollbar-thumb-purple-200 dark:scrollbar-thumb-purple-800 hover:scrollbar-thumb-purple-300 dark:hover:scrollbar-thumb-purple-700">
        <motion.div
          initial="hidden"
          animate="visible"
          transition={{ staggerChildren: 0.1 }}
        >
          <SidebarGroup>
            <SidebarGroupLabel className="text-purple-600 dark:text-purple-400 font-semibold bg-purple-50/50 dark:bg-purple-900/20 rounded-md px-3 py-2 mb-2">
              ניווט
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => (
                  <motion.div
                    key={item.title}
                    variants={menuItemVariants}
                    transition={{ duration: 0.2 }}
                  >
                    <SidebarMenuItem>
                      <SidebarMenuButton 
                        asChild
                        isActive={location.pathname === item.url}
                        tooltip={item.title}
                        className="
                          hover:bg-purple-50 dark:hover:bg-purple-900/20 
                          data-[active=true]:bg-purple-100 dark:data-[active=true]:bg-purple-900/30
                          transition-all duration-200 ease-in-out
                          hover:scale-[1.02] active:scale-[0.98]
                          group
                        "
                      >
                        <Link to={item.url} className="flex flex-row-reverse items-center gap-3">
                          <item.icon className="h-4 w-4 text-purple-600 dark:text-purple-400 transition-transform duration-200 group-hover:scale-110" />
                          <span className="text-gray-700 dark:text-gray-200 font-medium">
                            {item.title}
                          </span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </motion.div>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </motion.div>
      </SidebarContent>
    </Sidebar>
  );
}