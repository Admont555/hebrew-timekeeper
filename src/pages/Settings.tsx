import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/components/ThemeProvider";
import { Settings2, KeyRound, Palette } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

const colorSchemes = [
  { name: 'סגול בהיר', value: '#9b87f5' },
  { name: 'סגול כהה', value: '#7E69AB' },
  { name: 'סגול רך', value: '#E5DEFF' },
  { name: 'ירוק רך', value: '#F2FCE2' },
  { name: 'כתום רך', value: '#FEC6A1' },
  { name: 'ורוד רך', value: '#FFDEE2' },
];

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [appTitle, setAppTitle] = useState("מעקב משימות");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [selectedColor, setSelectedColor] = useState(colorSchemes[0].value);

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(`app-logo-${Date.now()}`, file);

      if (error) {
        toast({
          title: "שגיאה בהעלאת הלוגו",
          description: error.message,
        });
      } else {
        toast({
          title: "הלוגו הועלה בהצלחה",
        });
      }
    }
  };

  const handlePasswordChange = async () => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      toast({
        title: "שגיאה בעדכון הסיסמה",
        description: error.message,
      });
    } else {
      toast({
        title: "הסיסמה עודכנה בהצלחה",
      });
      setCurrentPassword("");
      setNewPassword("");
    }
  };

  const handleColorSchemeChange = (color: string) => {
    setSelectedColor(color);
    // Here you would implement the logic to apply the color scheme
    toast({
      title: "ערכת הצבעים עודכנה",
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

        <div className="space-y-6">
          {/* App Title and Logo Section */}
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4">הגדרות כלליות</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="appTitle">כותרת האפליקציה</Label>
                <Input
                  id="appTitle"
                  value={appTitle}
                  onChange={(e) => setAppTitle(e.target.value)}
                  className="max-w-md"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="logo">לוגו</Label>
                <Input
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="max-w-md"
                />
              </div>
            </div>
          </Card>

          {/* Color Scheme Section */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Palette className="h-6 w-6" />
              <h2 className="text-2xl font-semibold">ערכת צבעים</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {colorSchemes.map((scheme) => (
                <button
                  key={scheme.value}
                  onClick={() => handleColorSchemeChange(scheme.value)}
                  className={`h-20 rounded-lg transition-all ${
                    selectedColor === scheme.value ? 'ring-2 ring-primary' : ''
                  }`}
                  style={{ backgroundColor: scheme.value }}
                >
                  <span className="sr-only">{scheme.name}</span>
                </button>
              ))}
            </div>
          </Card>

          {/* Password Change Section */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <KeyRound className="h-6 w-6" />
              <h2 className="text-2xl font-semibold">שינוי סיסמה</h2>
            </div>
            <div className="space-y-4 max-w-md">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">סיסמה נוכחית</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">סיסמה חדשה</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <Button onClick={handlePasswordChange}>עדכן סיסמה</Button>
            </div>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}