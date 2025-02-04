import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Users, TableProperties, Settings, UserCircle2 } from "lucide-react";

export function AppSidebar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleToggle = () => setOpen(!open);
    window.addEventListener('toggleSidebar', handleToggle);
    return () => window.removeEventListener('toggleSidebar', handleToggle);
  }, [open]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="right" className="p-0">
        <ScrollArea className="h-full py-6">
          <div className="space-y-4">
            <div className="px-3 py-2">
              <div className="space-y-1">
                <Link to="/" onClick={() => setOpen(false)}>
                  <Button
                    variant={location.pathname === "/" ? "secondary" : "ghost"}
                    className="w-full justify-start"
                  >
                    <Users className="ml-2 h-5 w-5" />
                    חברי צוות
                  </Button>
                </Link>
                <Link to="/tables" onClick={() => setOpen(false)}>
                  <Button
                    variant={location.pathname === "/tables" ? "secondary" : "ghost"}
                    className="w-full justify-start"
                  >
                    <TableProperties className="ml-2 h-5 w-5" />
                    טבלאות
                  </Button>
                </Link>
                <Link to="/profile" onClick={() => setOpen(false)}>
                  <Button
                    variant={location.pathname === "/profile" ? "secondary" : "ghost"}
                    className="w-full justify-start"
                  >
                    <UserCircle2 className="ml-2 h-5 w-5" />
                    הפרופיל שלי
                  </Button>
                </Link>
                <Link to="/settings" onClick={() => setOpen(false)}>
                  <Button
                    variant={location.pathname === "/settings" ? "secondary" : "ghost"}
                    className="w-full justify-start"
                  >
                    <Settings className="ml-2 h-5 w-5" />
                    הגדרות
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}