import { LogOut, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";
import { logout } from "@/utils/auth";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar";

export function NavMenu() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="fixed top-4 left-4 z-50 flex items-center gap-2">
      <Menubar className="border-none bg-transparent">
        <MenubarMenu>
          <MenubarTrigger className="cursor-pointer data-[state=open]:bg-accent">
            {theme === "dark" ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </MenubarTrigger>
          <MenubarContent align="start" className="w-48">
            <MenubarItem onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
              {theme === "light" ? "מצב כהה" : "מצב בהיר"}
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={logout}
        className="hover:bg-destructive/10"
      >
        <LogOut className="h-5 w-5" />
        <span className="sr-only">התנתק</span>
      </Button>
    </div>
  );
}