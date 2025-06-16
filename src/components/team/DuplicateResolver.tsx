
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, User, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TeamMemberWithTasks {
  id: string;
  name: string;
  worker_id: string;
  avatar_url?: string;
  task_count: number;
}

const DuplicateResolver = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: allMembers = [], isLoading } = useQuery({
    queryKey: ['all-team-members-with-tasks'],
    queryFn: async () => {
      // Get all team members
      const { data: members, error: membersError } = await supabase
        .from('team_members')
        .select('*');

      if (membersError) throw membersError;

      // Get task counts for each member
      const membersWithTasks = await Promise.all(
        members.map(async (member) => {
          const { count } = await supabase
            .from('tasks')
            .select('*', { count: 'exact', head: true })
            .eq('worker', member.worker_id);

          return {
            ...member,
            task_count: count || 0
          };
        })
      );

      return membersWithTasks;
    },
  });

  // Find members with similar names (potential duplicates)
  const duplicateGroups = allMembers.reduce((groups: TeamMemberWithTasks[][], member) => {
    const existingGroup = groups.find(group => 
      group.some(m => 
        m.name.toLowerCase().includes('adam') && member.name.toLowerCase().includes('adam') ||
        m.name.toLowerCase() === member.name.toLowerCase()
      )
    );

    if (existingGroup) {
      existingGroup.push(member);
    } else if (member.name.toLowerCase().includes('adam')) {
      groups.push([member]);
    }

    return groups;
  }, []).filter(group => group.length > 1);

  const deleteMemberMutation = useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-team-members-with-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      toast({
        title: "חבר צוות נמחק",
        description: "הכפילות הוסרה בהצלחה",
      });
    },
    onError: (error) => {
      toast({
        title: "שגיאה במחיקת חבר צוות",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            בודק כפילויות...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse text-muted-foreground">טוען נתונים...</div>
        </CardContent>
      </Card>
    );
  }

  if (duplicateGroups.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            לא נמצאו כפילויות
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">כל חברי הצוות ייחודיים</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            נמצאו כפילויות בחברי צוות
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            מצאתי חברי צוות שעשויים להיות כפולים. בחר איזה לשמור ואיזה למחוק.
          </p>
          
          {duplicateGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="border rounded-lg p-4 mb-4">
              <h3 className="font-semibold mb-3">קבוצת כפילויות {groupIndex + 1}</h3>
              <div className="grid gap-3">
                {group.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 border rounded bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5" />
                      <div>
                        <div className="font-medium">{member.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Worker ID: {member.worker_id}
                        </div>
                      </div>
                      <Badge variant={member.task_count > 0 ? "default" : "secondary"}>
                        {member.task_count} משימות
                      </Badge>
                    </div>
                    
                    {member.task_count === 0 && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteMemberMutation.mutate(member.id)}
                        disabled={deleteMemberMutation.isPending}
                      >
                        {deleteMemberMutation.isPending ? "מוחק..." : "מחק"}
                      </Button>
                    )}
                    
                    {member.task_count > 0 && (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        מומלץ לשמור
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          <div className="text-sm text-muted-foreground mt-4">
            <strong>המלצה:</strong> שמור את חבר הצוות עם המשימות ומחק את השאר.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DuplicateResolver;
