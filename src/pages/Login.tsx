import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Users, Loader2, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Checkbox } from "@/components/ui/checkbox";

const loginSchema = z.object({
  email: z.string().email("כתובת אימייל לא תקינה"),
  password: z.string().min(1, "סיסמה נדרשת"),
  rememberMe: z.boolean().default(true),
});

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
    try {
      const { data: { session }, error: signInError } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (signInError) throw new Error('שם משתמש או סיסמה שגויים');

      if (session) {
        const { data: member, error: memberError } = await supabase
          .from('team_members')
          .select('worker_id')
          .eq('worker_id', values.email)
          .maybeSingle();

        if (memberError) throw new Error('שגיאה בבדיקת פרטי משתמש');

        if (!member) {
          const { error: createError } = await supabase
            .from('team_members')
            .insert([{ worker_id: values.email, name: values.email.split('@')[0] }]);
          if (createError) throw new Error('שגיאה ביצירת פרופיל משתמש');
        }

        toast({ title: "התחברות בוצעה בהצלחה", description: "ברוך הבא!" });
        navigate('/');
      }
    } catch (error) {
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
    <div className="min-h-screen relative overflow-hidden bg-gradient-subtle">
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full mix-blend-multiply filter blur-xl"
          animate={{ x: [0, 100, 0], y: [0, -100, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute top-1/3 right-1/4 w-96 h-96 bg-accent/20 rounded-full mix-blend-multiply filter blur-xl"
          animate={{ x: [0, -100, 0], y: [0, 100, 0], scale: [1.2, 1, 1.2] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <div className="flex items-center justify-center min-h-screen p-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="p-8 space-y-6 glass border-0 rounded-2xl shadow-2xl">
            <div className="text-center space-y-2">
              <motion.div className="flex justify-center mb-4" whileHover={{ scale: 1.1 }}>
                <Users className="h-12 w-12 text-primary-foreground bg-gradient-primary rounded-xl p-2" />
              </motion.div>
              <h1 className="text-3xl font-bold text-gradient mb-0">התחברות למערכת</h1>
              <p className="text-muted-foreground">הזן את פרטי ההתחברות שלך</p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground/80 font-medium">אימייל</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <Input {...field} type="email" placeholder="הכנס כתובת אימייל" className="text-right pl-10 bg-background/50 backdrop-blur-sm border-border hover:border-primary transition-all duration-300 focus-visible:ring-primary/50" disabled={isLoading} />
                        </div>
                      </FormControl>
                      <FormMessage className="text-destructive" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground/80 font-medium">סיסמה</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2">
                            <Lock className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <Input {...field} type={showPassword ? "text" : "password"} placeholder="הכנס סיסמה" className="text-right pl-10 bg-background/50 backdrop-blur-sm border-border hover:border-primary transition-all duration-300 focus-visible:ring-primary/50" disabled={isLoading} />
                          <Button type="button" variant="ghost" size="sm" className="absolute left-10 top-1/2 -translate-y-1/2 hover:bg-transparent" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-destructive" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="rememberMe"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-2 space-y-0 rtl:space-x-reverse">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} className="w-5 h-5 border-2 border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary rounded-md transition-all duration-200 hover:border-primary" />
                      </FormControl>
                      <FormLabel className="text-sm font-medium leading-none text-foreground/80 select-none cursor-pointer">זכור אותי</FormLabel>
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full bg-gradient-primary hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl text-primary-foreground font-medium" disabled={isLoading}>
                  {isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />מתחבר...</>) : "התחבר"}
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
