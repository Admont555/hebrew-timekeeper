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
import { NavMenu } from "@/components/NavMenu";
import { Checkbox } from "@/components/ui/checkbox";

const loginSchema = z.object({
  email: z.string().email("כתובת אימייל לא תקינה"),
  password: z.string().min(1, "סיסמה נדרשת"),
  rememberMe: z.boolean().default(true),
});

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: true,
    },
  });

  const handleLogin = async (values: z.infer<typeof loginSchema>) => {
    setIsLoading(true);
    console.log("Attempting login with:", values.email);

    try {
      const { data: { session }, error: signInError } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (signInError) {
        console.error('Sign in error:', signInError);
        throw new Error('שם משתמש או סיסמה שגויים');
      }

      if (session) {
        const { data: member, error: memberError } = await supabase
          .from('team_members')
          .select('worker_id')
          .eq('worker_id', values.email)
          .maybeSingle();

        if (memberError) {
          console.error('Member lookup error:', memberError);
          throw new Error('שגיאה בבדיקת פרטי משתמש');
        }

        if (!member) {
          const { error: createError } = await supabase
            .from('team_members')
            .insert([{ 
              worker_id: values.email,
              name: values.email.split('@')[0]
            }]);

          if (createError) {
            console.error('Error creating team member:', createError);
            throw new Error('שגיאה ביצירת פרופיל משתמש');
          }
        }

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
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-purple-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      {/* Animated background shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-400/20 rounded-full mix-blend-multiply filter blur-xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-400/20 rounded-full mix-blend-multiply filter blur-xl"
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
            scale: [1.2, 1, 1.2],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-400/20 rounded-full mix-blend-multiply filter blur-xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 100, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      <NavMenu />
      <div className="flex items-center justify-center min-h-screen p-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="p-8 space-y-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-2xl hover:shadow-3xl transition-all duration-300 border-0 rounded-2xl">
            <div className="text-center space-y-2">
              <motion.div 
                className="flex justify-center mb-4"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Users className="h-12 w-12 text-primary animate-gradient bg-gradient-to-r from-purple-600 to-blue-500 rounded-xl p-2 text-white" />
              </motion.div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">התחברות למערכת</h1>
              <p className="text-muted-foreground">
                הזן את פרטי ההתחברות שלך
              </p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground/80">אימייל</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          placeholder="הכנס כתובת אימייל"
                          className="text-right bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-0 shadow-sm"
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
                      <FormLabel className="text-foreground/80">סיסמה</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          placeholder="הכנס סיסמה"
                          className="text-right bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-0 shadow-sm"
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="rememberMe"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-2 space-y-0 rtl:space-x-reverse">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="data-[state=checked]:bg-purple-600"
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        זכור אותי
                      </FormLabel>
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl"
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
    </div>
  );
};

export default Login;