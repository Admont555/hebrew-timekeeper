export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      categories: {
        Row: {
          color: string
          created_at: string
          icon: string | null
          id: string
          name: string
          updated_at: string
          worker_id: string
        }
        Insert: {
          color?: string
          created_at?: string
          icon?: string | null
          id?: string
          name: string
          updated_at?: string
          worker_id: string
        }
        Update: {
          color?: string
          created_at?: string
          icon?: string | null
          id?: string
          name?: string
          updated_at?: string
          worker_id?: string
        }
        Relationships: []
      }
      project_files: {
        Row: {
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          project_id: string
          uploaded_at: string
          uploaded_by: string | null
        }
        Insert: {
          file_name: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          project_id: string
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Update: {
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          project_id?: string
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_files_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_notes: {
        Row: {
          content: string | null
          created_at: string
          id: string
          project_id: string
          title: string
          updated_at: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          project_id: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          project_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_notes_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string | null
          id: string
          priority: string | null
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      quotes: {
        Row: {
          author: string | null
          content: string
          created_at: string
          id: string
        }
        Insert: {
          author?: string | null
          content: string
          created_at?: string
          id?: string
        }
        Update: {
          author?: string | null
          content?: string
          created_at?: string
          id?: string
        }
        Relationships: []
      }
      table_columns: {
        Row: {
          created_at: string
          id: string
          name: string
          order_index: number | null
          table_id: string
          type: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          order_index?: number | null
          table_id: string
          type?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          order_index?: number | null
          table_id?: string
          type?: string | null
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
          created_at: string
          data: Json | null
          id: string
          table_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: string
          table_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: string
          table_id?: string
          updated_at?: string
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
          created_at: string
          created_by: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          archived_at: string | null
          archived_by: string | null
          assigned_to: string[] | null
          attachments: Json | null
          category_id: string | null
          comments: string[] | null
          completed: boolean | null
          created_at: string
          date: string | null
          dependencies: string[] | null
          due_date: string | null
          duration: number | null
          id: string
          notification_time: string | null
          offline_id: string | null
          order_index: number | null
          priority: string | null
          progress: number | null
          project_id: string | null
          reminder_time: string | null
          start_time: string | null
          sync_status: string | null
          tags: string[] | null
          timestamp: string | null
          title: string | null
          updated_at: string
          voice_note: string | null
          worker: string | null
        }
        Insert: {
          archived_at?: string | null
          archived_by?: string | null
          assigned_to?: string[] | null
          attachments?: Json | null
          category_id?: string | null
          comments?: string[] | null
          completed?: boolean | null
          created_at?: string
          date?: string | null
          dependencies?: string[] | null
          due_date?: string | null
          duration?: number | null
          id?: string
          notification_time?: string | null
          offline_id?: string | null
          order_index?: number | null
          priority?: string | null
          progress?: number | null
          project_id?: string | null
          reminder_time?: string | null
          start_time?: string | null
          sync_status?: string | null
          tags?: string[] | null
          timestamp?: string | null
          title?: string | null
          updated_at?: string
          voice_note?: string | null
          worker?: string | null
        }
        Update: {
          archived_at?: string | null
          archived_by?: string | null
          assigned_to?: string[] | null
          attachments?: Json | null
          category_id?: string | null
          comments?: string[] | null
          completed?: boolean | null
          created_at?: string
          date?: string | null
          dependencies?: string[] | null
          due_date?: string | null
          duration?: number | null
          id?: string
          notification_time?: string | null
          offline_id?: string | null
          order_index?: number | null
          priority?: string | null
          progress?: number | null
          project_id?: string | null
          reminder_time?: string | null
          start_time?: string | null
          sync_status?: string | null
          tags?: string[] | null
          timestamp?: string | null
          title?: string | null
          updated_at?: string
          voice_note?: string | null
          worker?: string | null
        }
        Relationships: []
      }
      team_members: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          name: string
          updated_at: string
          worker_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          name: string
          updated_at?: string
          worker_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          worker_id?: string
        }
        Relationships: []
      }
      time_logs: {
        Row: {
          created_at: string
          description: string | null
          duration: number | null
          end_time: string | null
          id: string
          start_time: string
          task_id: string | null
          worker: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration?: number | null
          end_time?: string | null
          id?: string
          start_time?: string
          task_id?: string | null
          worker: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration?: number | null
          end_time?: string | null
          id?: string
          start_time?: string
          task_id?: string | null
          worker?: string
        }
        Relationships: []
      }
      workflows: {
        Row: {
          created_at: string
          id: string
          name: string
          position: Json | null
          steps: Json | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          position?: Json | null
          steps?: Json | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          position?: Json | null
          steps?: Json | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
