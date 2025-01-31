import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Users } from "lucide-react";

const Login = () => {
  const [workerId, setWorkerId] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('worker_id, password_hash')
        .eq('worker_id', workerId)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        toast({
          title: "שגיאת התחברות",
          description: "מזהה העובד לא נמצא",
          variant: "destructive",
        });
        return;
      }

      const { data: isValid, error: verifyError } = await supabase
        .rpc('verify_password', {
          stored_hash: data.password_hash,
          password_attempt: password
        });

      if (verifyError) throw verifyError;

      if (!isValid) {
        toast({
          title: "שגיאת התחברות",
          description: "סיסמה שגויה",
          variant: "destructive",
        });
        return;
      }

      // Store session
      localStorage.setItem('worker_session', JSON.stringify({ workerId: data.worker_id }));
      
      toast({
        title: "התחברות בוצעה בהצלחה",
        description: "ברוך הבא!",
      });

      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "שגיאת התחברות",
        description: "אירעה שגיאה בתהליך ההתחברות",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-4">
              <Users className="h-12 w-12 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">התחברות למערכת</h1>
            <p className="text-muted-foreground">
              הזן את פרטי ההתחברות שלך
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="מזהה עובד"
                value={workerId}
                onChange={(e) => setWorkerId(e.target.value)}
                className="text-right"
                required
              />
            </div>
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="סיסמה"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="text-right"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "מתחבר..." : "התחבר"}
            </Button>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;