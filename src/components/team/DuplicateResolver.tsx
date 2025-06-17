
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, User, CheckCircle, Trash2 } from "lucide-react";
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
      console.log('Fetching team members with task counts...');
      
      // Get all team members
      const { data: members, error: membersError } = await supabase
        .from('team_members')
        .select('*');

      if (membersError) {
        console.error('Error fetching team members:', membersError);
        throw membersError;
      }

      console.log('Found team members:', members);

      // Get task counts for each member
      const membersWithTasks = await Promise.all(
        members.map(async (member) => {
          const { count } = await supabase
            .from('tasks')
            .select('*', { count: 'exact', head: true })
            .eq('worker', member.worker_id);

          console.log(`Member ${member.name} (${member.worker_id}) has ${count} tasks`);

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
    mutationFn: async (member: TeamMemberWithTasks) => {
      console.log('Attempting to delete member:', member);
      
      // First, check if member has any tasks
      const { count: taskCount } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('worker', member.worker_id);

      console.log(`Member ${member.name} has ${taskCount} tasks`);

      if (taskCount && taskCount > 0) {
        throw new Error(`לא ניתן למחוק את ${member.name} כי יש לו ${taskCount} משימות`);
      }

      // Try to delete the member
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', member.id);

      if (error) {
        console.error('Delete error:', error);
        throw error;
      }

      console.log('Successfully deleted member:', member.name);
    },
    onSuccess: (_, deletedMember) => {
      queryClient.invalidateQueries({ queryKey: ['all-team-members-with-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      toast({
        title: "חבר צוות נמחק",
        description: `${deletedMember.name} הוסר בהצלחה`,
      });
    },
    onError: (error, member) => {
      console.error('Error deleting member:', error);
      toast({
        title: "שגיאה במחיקת חבר צוות",
        description: error.message || `לא ניתן למחוק את ${member.name}`,
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
          {allMembers.length > 0 && (
            <div className="mt-4 text-sm text-muted-foreground">
              <p>נמצאו {allMembers.length} חברי צוות:</p>
              <ul className="list-disc list-inside mt-2">
                {allMembers.map(member => (
                  <li key={member.id}>
                    {member.name} ({member.worker_id}) - {member.task_count} משימות
                  </li>
                ))}
              </ul>
            </div>
          )}
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
                        <div className="text-xs text-muted-foreground">
                          ID: {member.id}
                        </div>
                      </div>
                      <Badge variant={member.task_count > 0 ? "default" : "secondary"}>
                        {member.task_count} משימות
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {member.task_count > 0 && (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          מומלץ לשמור
                        </Badge>
                      )}
                      
                      <Button
                        variant={member.task_count > 0 ? "outline" : "destructive"}
                        size="sm"
                        onClick={() => deleteMemberMutation.mutate(member)}
                        disabled={deleteMemberMutation.isPending}
                        className="gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        {deleteMemberMutation.isPending ? "מוחק..." : "מחק"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          <div className="text-sm text-muted-foreground mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <strong>המלצה:</strong> שמור את חבר הצוות עם המשימות ומחק את השאר.
            <br />
            <strong>שים לב:</strong> אם לא ניתן למחוק, ייתכן שיש לחבר הצוות משימות או קשרים אחרים במערכת.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DuplicateResolver;
