import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Users, Loader2 } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
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
    console.log("Attempting login with:", values.workerId);

    try {
      // First, check if the worker exists and verify credentials
      const { data: member, error: memberError } = await supabase
        .from('team_members')
        .select('worker_id, password_hash')
        .eq('worker_id', values.workerId)
        .maybeSingle();

      if (memberError) {
        console.error('Member lookup error:', memberError);
        throw new Error('מזהה העובד לא נמצא');
      }

      if (!member) {
        console.error('No member found with worker_id:', values.workerId);
        throw new Error('מזהה העובד לא נמצא');
      }

      // Now attempt to sign in with Supabase auth
      const { data: { session }, error: signInError } = await supabase.auth.signInWithPassword({
        email: `${values.workerId}@example.com`,
        password: values.password,
      });

      if (signInError) {
        console.error('Sign in error:', signInError);
        throw new Error('סיסמה שגויה');
      }

      if (session) {
        toast({
          title: "התחברות בוצעה בהצלחה",
          description: "ברוך הבא!",
        });
        navigate('/');
      }

    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "שגיאת התחברות",
        description: error instanceof Error ? error.message : "אירעה שגיאה בתהליך ההתחברות",
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
                    <FormMessage />
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    מתחבר...
                  </>
                ) : (
                  "התחבר"
                )}
              </Button>
            </form>
          </Form>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;