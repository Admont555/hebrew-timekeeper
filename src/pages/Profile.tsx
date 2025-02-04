import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [themePreference, setThemePreference] = useState("system");
  const [languagePreference, setLanguagePreference] = useState("he");
  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function loadProfile() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          toast({
            title: "לא מחובר",
            description: "נא להתחבר כדי לצפות בפרופיל",
            variant: "destructive",
          });
          return;
        }

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();

        if (error) throw error;

        if (profile) {
          setUsername(profile.username || "");
          setThemePreference(profile.theme_preference || "system");
          setLanguagePreference(profile.language_preference || "he");
          setNotificationEnabled(profile.notification_enabled ?? true);
        } else {
          // If no profile exists, we'll create one with default values
          const { error: insertError } = await supabase
            .from('profiles')
            .insert([{
              id: session.user.id,
              username: "",
              theme_preference: "system",
              language_preference: "he",
              notification_enabled: true
            }]);

          if (insertError) throw insertError;

          toast({
            title: "פרופיל חדש נוצר",
            description: "הפרופיל שלך נוצר בהצלחה",
          });
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        toast({
          title: "שגיאה בטעינת הפרופיל",
          description: "אנא נסה שוב מאוחר יותר",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('No user session found');

      const { error } = await supabase
        .from('profiles')
        .update({
          username,
          theme_preference: themePreference,
          language_preference: languagePreference,
          notification_enabled: notificationEnabled,
        })
        .eq('id', session.user.id);

      if (error) throw error;

      toast({
        title: "הפרופיל עודכן בהצלחה",
        description: "השינויים נשמרו במערכת",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "שגיאה בעדכון הפרופיל",
        description: "אנא נסה שוב מאוחר יותר",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>הגדרות פרופיל</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username">שם משתמש</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="הזן שם משתמש"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="theme">ערכת נושא</Label>
              <Select value={themePreference} onValueChange={setThemePreference}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">בהיר</SelectItem>
                  <SelectItem value="dark">כהה</SelectItem>
                  <SelectItem value="system">מערכת</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">שפה</Label>
              <Select value={languagePreference} onValueChange={setLanguagePreference}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="he">עברית</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="notifications">התראות</Label>
              <Switch
                id="notifications"
                checked={notificationEnabled}
                onCheckedChange={setNotificationEnabled}
              />
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? "שומר שינויים..." : "שמור שינויים"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}