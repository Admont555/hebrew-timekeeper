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

export function AppSidebar() {
  const location = useLocation();

  return (
    <Sidebar 
      side="right" 
      variant="floating"
      className="border-l border-sidebar-border bg-white/50 dark:bg-gray-900/50 backdrop-blur-lg"
    >
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-purple-600 dark:text-purple-400 font-semibold">
            ניווט
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    isActive={location.pathname === item.url}
                    tooltip={item.title}
                    className="hover:bg-purple-50 dark:hover:bg-purple-900/20 data-[active=true]:bg-purple-100 dark:data-[active=true]:bg-purple-900/30"
                  >
                    <Link to={item.url} className="flex flex-row-reverse">
                      <item.icon className="h-4 w-4 ml-2 text-purple-600 dark:text-purple-400" />
                      <span className="text-gray-700 dark:text-gray-200">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}