import { Home, Calendar, Settings, Users, ClipboardList } from "lucide-react";
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
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

const items = [
  {
    title: "דף הבית",
    url: "/",
    icon: Home,
  },
  {
    title: "חברי צוות",
    url: "/",
    icon: Users,
  },
  {
    title: "משימות",
    url: "/member/worker1",
    icon: ClipboardList,
  },
  {
    title: "לוח שנה",
    url: "#",
    icon: Calendar,
  },
  {
    title: "הגדרות",
    url: "#",
    icon: Settings,
  },
];

const menuItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.3,
    },
  }),
};

export function AppSidebar() {
  const location = useLocation();

  return (
    <Sidebar className="border-l">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>תפריט</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item, index) => (
                <motion.div
                  key={item.title}
                  custom={index}
                  initial="hidden"
                  animate="visible"
                  variants={menuItemVariants}
                >
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      className={`w-full ${
                        location.pathname === item.url
                          ? "bg-accent text-accent-foreground"
                          : ""
                      }`}
                    >
                      <Link to={item.url} className="flex items-center gap-2">
                        <item.icon className="h-5 w-5" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </motion.div>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}