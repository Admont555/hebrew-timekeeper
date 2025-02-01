import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useTheme } from "@/components/ThemeProvider";
import { Settings2, Bell, Monitor, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);

  const handleSaveSettings = () => {
    toast({
      title: "הגדרות נשמרו",
      description: "השינויים שביצעת נשמרו בהצלחה",
    });
  };

  return (
    <div className="container mx-auto p-6 min-h-screen bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <Settings2 className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">הגדרות</h1>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
            <TabsTrigger value="profile">פרופיל</TabsTrigger>
            <TabsTrigger value="notifications">התראות</TabsTrigger>
            <TabsTrigger value="display">תצוגה</TabsTrigger>
            <TabsTrigger value="team">צוות</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4">הגדרות פרופיל</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">שם</Label>
                  <Input id="name" placeholder="השם שלך" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">אימייל</Label>
                  <Input id="email" type="email" placeholder="האימייל שלך" />
                </div>
                <Button onClick={handleSaveSettings}>שמור שינויים</Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Bell className="h-6 w-6" />
                <h2 className="text-2xl font-semibold">הגדרות התראות</h2>
              </div>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>התראות אימייל</Label>
                    <p className="text-sm text-muted-foreground">
                      קבל התראות על משימות חדשות באימייל
                    </p>
                  </div>
                  <Switch
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>התראות דחיפה</Label>
                    <p className="text-sm text-muted-foreground">
                      קבל התראות על משימות חדשות בדפדפן
                    </p>
                  </div>
                  <Switch
                    checked={pushNotifications}
                    onCheckedChange={setPushNotifications}
                  />
                </div>
                <Button onClick={handleSaveSettings}>שמור הגדרות התראות</Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="display">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Monitor className="h-6 w-6" />
                <h2 className="text-2xl font-semibold">הגדרות תצוגה</h2>
              </div>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>מצב כהה</Label>
                    <p className="text-sm text-muted-foreground">
                      החלף בין מצב בהיר לכהה
                    </p>
                  </div>
                  <Switch
                    checked={theme === "dark"}
                    onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                  />
                </div>
                <Button onClick={handleSaveSettings}>שמור הגדרות תצוגה</Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="team">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Users className="h-6 w-6" />
                <h2 className="text-2xl font-semibold">הגדרות צוות</h2>
              </div>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  נהל את חברי הצוות והרשאות
                </p>
                <Button onClick={handleSaveSettings}>שמור הגדרות צוות</Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}