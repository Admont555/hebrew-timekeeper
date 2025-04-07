export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          color: string | null
          created_at: string | null
          created_by: string
          id: string
          name: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          created_by: string
          id?: string
          name: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          created_by?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          message: string
          scheduled_time: string
          sent: boolean | null
          task_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          scheduled_time: string
          sent?: boolean | null
          task_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          scheduled_time?: string
          sent?: boolean | null
          task_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          id: string
          language_preference: string | null
          notification_enabled: boolean | null
          theme_preference: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          language_preference?: string | null
          notification_enabled?: boolean | null
          theme_preference?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          language_preference?: string | null
          notification_enabled?: boolean | null
          theme_preference?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      quotes: {
        Row: {
          author: string | null
          content: string
          id: string
        }
        Insert: {
          author?: string | null
          content: string
          id?: string
        }
        Update: {
          author?: string | null
          content?: string
          id?: string
        }
        Relationships: []
      }
      table_columns: {
        Row: {
          created_at: string | null
          id: string
          name: string
          order_index: number
          table_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          order_index: number
          table_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          order_index?: number
          table_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "table_columns_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "tables"
            referencedColumns: ["id"]
          },
        ]
      }
      table_rows: {
        Row: {
          created_at: string | null
          data: Json
          id: string
          table_id: string
        }
        Insert: {
          created_at?: string | null
          data?: Json
          id?: string
          table_id: string
        }
        Update: {
          created_at?: string | null
          data?: Json
          id?: string
          table_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "table_rows_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "tables"
            referencedColumns: ["id"]
          },
        ]
      }
      tables: {
        Row: {
          created_at: string | null
          created_by: string
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      tags: {
        Row: {
          color: string | null
          created_at: string | null
          created_by: string
          id: string
          name: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          created_by: string
          id?: string
          name: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          created_by?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      task_notifications: {
        Row: {
          created_at: string | null
          id: string
          message: string
          read_at: string | null
          scheduled_for: string | null
          task_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          read_at?: string | null
          scheduled_for?: string | null
          task_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          read_at?: string | null
          scheduled_for?: string | null
          task_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_notifications_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_tags: {
        Row: {
          tag_id: string
          task_id: string
        }
        Insert: {
          tag_id: string
          task_id: string
        }
        Update: {
          tag_id?: string
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_tags_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_templates: {
        Row: {
          created_at: string | null
          created_by: string
          duration: number | null
          id: string
          is_public: boolean | null
          priority: string | null
          title: string
        }
        Insert: {
          created_at?: string | null
          created_by: string
          duration?: number | null
          id?: string
          is_public?: boolean | null
          priority?: string | null
          title: string
        }
        Update: {
          created_at?: string | null
          created_by?: string
          duration?: number | null
          id?: string
          is_public?: boolean | null
          priority?: string | null
          title?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          archived_at: string | null
          archived_by: string | null
          assigned_to: string[] | null
          attachments: Json[] | null
          category_id: string | null
          comments: string[] | null
          completed: boolean | null
          date: string | null
          due_date: string | null
          duration: number | null
          id: string
          notification_time: string | null
          offline_id: string | null
          order_index: number | null
          priority: string | null
          reminder_time: string | null
          start_time: string | null
          sync_status: string | null
          tags: string[] | null
          timestamp: string | null
          title: string
          voice_note: string | null
          worker: string
        }
        Insert: {
          archived_at?: string | null
          archived_by?: string | null
          assigned_to?: string[] | null
          attachments?: Json[] | null
          category_id?: string | null
          comments?: string[] | null
          completed?: boolean | null
          date?: string | null
          due_date?: string | null
          duration?: number | null
          id?: string
          notification_time?: string | null
          offline_id?: string | null
          order_index?: number | null
          priority?: string | null
          reminder_time?: string | null
          start_time?: string | null
          sync_status?: string | null
          tags?: string[] | null
          timestamp?: string | null
          title: string
          voice_note?: string | null
          worker?: string
        }
        Update: {
          archived_at?: string | null
          archived_by?: string | null
          assigned_to?: string[] | null
          attachments?: Json[] | null
          category_id?: string | null
          comments?: string[] | null
          completed?: boolean | null
          date?: string | null
          due_date?: string | null
          duration?: number | null
          id?: string
          notification_time?: string | null
          offline_id?: string | null
          order_index?: number | null
          priority?: string | null
          reminder_time?: string | null
          start_time?: string | null
          sync_status?: string | null
          tags?: string[] | null
          timestamp?: string | null
          title?: string
          voice_note?: string | null
          worker?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          id: string
          name: string
          worker_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          id?: string
          name: string
          worker_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          id?: string
          name?: string
          worker_id?: string
        }
        Relationships: []
      }
      time_logs: {
        Row: {
          created_at: string | null
          duration: number | null
          end_time: string | null
          id: string
          start_time: string
          task_id: string
          worker: string
        }
        Insert: {
          created_at?: string | null
          duration?: number | null
          end_time?: string | null
          id?: string
          start_time: string
          task_id: string
          worker: string
        }
        Update: {
          created_at?: string | null
          duration?: number | null
          end_time?: string | null
          id?: string
          start_time?: string
          task_id?: string
          worker?: string
        }
        Relationships: [
          {
            foreignKeyName: "time_logs_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      workflow_connections: {
        Row: {
          created_at: string | null
          id: string
          source_workflow_id: string
          target_workflow_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          source_workflow_id: string
          target_workflow_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          source_workflow_id?: string
          target_workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_connections_source_workflow_id_fkey"
            columns: ["source_workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_connections_target_workflow_id_fkey"
            columns: ["target_workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_tasks: {
        Row: {
          created_at: string | null
          duration: number
          id: string
          position: Json | null
          priority: string
          title: string
          workflow_id: string | null
        }
        Insert: {
          created_at?: string | null
          duration: number
          id?: string
          position?: Json | null
          priority: string
          title: string
          workflow_id?: string | null
        }
        Update: {
          created_at?: string | null
          duration?: number
          id?: string
          position?: Json | null
          priority?: string
          title?: string
          workflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_tasks_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      workflows: {
        Row: {
          created_at: string | null
          id: string
          name: string
          position: Json | null
          steps: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          position?: Json | null
          steps?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          position?: Json | null
          steps?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      verify_password: {
        Args: { stored_hash: string; password_attempt: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "editor"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "editor"],
    },
  },
} as const
