
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Get tasks with upcoming reminders
    const now = new Date();
    const { data: tasks, error: tasksError } = await supabaseClient
      .from('tasks')
      .select('*')
      .lt('reminder_time', now.toISOString())
      .is('completed', false);

    if (tasksError) throw tasksError;

    // Create notifications for each task
    for (const task of tasks) {
      const { error: notificationError } = await supabaseClient
        .from('task_notifications')
        .insert({
          task_id: task.id,
          user_id: task.worker,
          type: 'reminder',
          message: `תזכורת: ${task.title}`,
          scheduled_for: task.reminder_time
        });

      if (notificationError) throw notificationError;

      // Clear the reminder time to prevent duplicate notifications
      const { error: updateError } = await supabaseClient
        .from('tasks')
        .update({ reminder_time: null })
        .eq('id', task.id);

      if (updateError) throw updateError;
    }

    return new Response(
      JSON.stringify({ success: true, processed: tasks.length }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
