import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Users } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

const loginSchema = z.object({
  workerId: z.string().min(1, "מזהה עובד נדרש"),
  password: z.string().min(1, "סיסמה נדרשת"),
});

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      workerId: "",
      password: "",
    },
  });

  const handleLogin = async (values: z.infer<typeof loginSchema>) => {
    setIsLoading(true);

    try {
      // First, check if the worker exists
      const { data: member, error: memberError } = await supabase
        .from('team_members')
        .select('worker_id, password_hash')
        .eq('worker_id', values.workerId)
        .maybeSingle();

      if (memberError) throw memberError;

      if (!member) {
        toast({
          title: "שגיאת התחברות",
          description: "מזהה העובד לא נמצא",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Verify the password
      const { data: isValid, error: verifyError } = await supabase
        .rpc('verify_password', {
          stored_hash: member.password_hash,
          password_attempt: values.password
        });

      if (verifyError) throw verifyError;

      if (!isValid) {
        toast({
          title: "שגיאת התחברות",
          description: "סיסמה שגויה",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Store session
      localStorage.setItem('worker_session', JSON.stringify({ workerId: member.worker_id }));
      
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

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-4">
              <FormField
                control={form.control}
                name="workerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>מזהה עובד</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="text"
                        placeholder="הכנס מזהה עובד"
                        className="text-right"
                        disabled={isLoading}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>סיסמה</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder="הכנס סיסמה"
                        className="text-right"
                        disabled={isLoading}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "מתחבר..." : "התחבר"}
              </Button>
            </form>
          </Form>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;