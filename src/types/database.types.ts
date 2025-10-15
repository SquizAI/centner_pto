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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      donations: {
        Row: {
          amount: number
          campus: string | null
          created_at: string | null
          currency: string | null
          donation_type: string | null
          donor_email: string
          donor_name: string | null
          id: string
          is_anonymous: boolean | null
          is_recurring: boolean | null
          message: string | null
          metadata: Json | null
          recurring_interval: string | null
          status: string | null
          stripe_customer_id: string | null
          stripe_payment_intent_id: string | null
          student_grade: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          campus?: string | null
          created_at?: string | null
          currency?: string | null
          donation_type?: string | null
          donor_email: string
          donor_name?: string | null
          id?: string
          is_anonymous?: boolean | null
          is_recurring?: boolean | null
          message?: string | null
          metadata?: Json | null
          recurring_interval?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_payment_intent_id?: string | null
          student_grade?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          campus?: string | null
          created_at?: string | null
          currency?: string | null
          donation_type?: string | null
          donor_email?: string
          donor_name?: string | null
          id?: string
          is_anonymous?: boolean | null
          is_recurring?: boolean | null
          message?: string | null
          metadata?: Json | null
          recurring_interval?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_payment_intent_id?: string | null
          student_grade?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "donations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      event_rsvps: {
        Row: {
          created_at: string | null
          event_id: string | null
          guests_count: number | null
          id: string
          notes: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_id?: string | null
          guests_count?: number | null
          id?: string
          notes?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_id?: string | null
          guests_count?: number | null
          id?: string
          notes?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_rsvps_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_rsvps_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          campus: string[] | null
          created_at: string | null
          created_by: string | null
          current_attendees: number | null
          description: string | null
          end_date: string | null
          event_date: string
          event_type: string | null
          id: string
          image_url: string | null
          location: string | null
          max_attendees: number | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          campus?: string[] | null
          created_at?: string | null
          created_by?: string | null
          current_attendees?: number | null
          description?: string | null
          end_date?: string | null
          event_date: string
          event_type?: string | null
          id?: string
          image_url?: string | null
          location?: string | null
          max_attendees?: number | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          campus?: string[] | null
          created_at?: string | null
          created_by?: string | null
          current_attendees?: number | null
          description?: string | null
          end_date?: string | null
          event_date?: string
          event_type?: string | null
          id?: string
          image_url?: string | null
          location?: string | null
          max_attendees?: number | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      news_posts: {
        Row: {
          author_id: string
          campus: string
          content: string
          created_at: string | null
          excerpt: string | null
          featured_image_url: string | null
          id: string
          publish_date: string | null
          published: boolean | null
          slug: string
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          author_id: string
          campus?: string
          content: string
          created_at?: string | null
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          publish_date?: string | null
          published?: boolean | null
          slug: string
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string
          campus?: string
          content?: string
          created_at?: string | null
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          publish_date?: string | null
          published?: boolean | null
          slug?: string
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      photo_albums: {
        Row: {
          campus: string[] | null
          cover_image_url: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          event_id: string | null
          id: string
          is_featured: boolean | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          campus?: string[] | null
          cover_image_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          event_id?: string | null
          id?: string
          is_featured?: boolean | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          campus?: string[] | null
          cover_image_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          event_id?: string | null
          id?: string
          is_featured?: boolean | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "photo_albums_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photo_albums_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      photos: {
        Row: {
          album_id: string | null
          caption: string | null
          created_at: string | null
          display_order: number | null
          file_name: string
          id: string
          photographer: string | null
          storage_path: string
          uploaded_by: string | null
        }
        Insert: {
          album_id?: string | null
          caption?: string | null
          created_at?: string | null
          display_order?: number | null
          file_name: string
          id?: string
          photographer?: string | null
          storage_path: string
          uploaded_by?: string | null
        }
        Update: {
          album_id?: string | null
          caption?: string | null
          created_at?: string | null
          display_order?: number | null
          file_name?: string
          id?: string
          photographer?: string | null
          storage_path?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "photos_album_id_fkey"
            columns: ["album_id"]
            isOneToOne: false
            referencedRelation: "photo_albums"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photos_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          campus: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          phone: string | null
          role: string | null
          student_grades: string[] | null
          updated_at: string | null
        }
        Insert: {
          campus?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          phone?: string | null
          role?: string | null
          student_grades?: string[] | null
          updated_at?: string | null
        }
        Update: {
          campus?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: string | null
          student_grades?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      volunteer_opportunities: {
        Row: {
          campus: string
          contact_email: string
          created_at: string
          created_by: string
          current_signups: number
          date: string
          description: string
          end_time: string
          id: string
          location: string
          max_volunteers: number
          requirements: string | null
          start_time: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          campus?: string
          contact_email: string
          created_at?: string
          created_by: string
          current_signups?: number
          date: string
          description: string
          end_time: string
          id?: string
          location: string
          max_volunteers: number
          requirements?: string | null
          start_time: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          campus?: string
          contact_email?: string
          created_at?: string
          created_by?: string
          current_signups?: number
          date?: string
          description?: string
          end_time?: string
          id?: string
          location?: string
          max_volunteers?: number
          requirements?: string | null
          start_time?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      volunteer_signups: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          opportunity_id: string
          signup_date: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          opportunity_id: string
          signup_date?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          opportunity_id?: string
          signup_date?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "volunteer_signups_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "volunteer_opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_slug: {
        Args: { title: string }
        Returns: string
      }
      get_available_spots: {
        Args: { opportunity_uuid: string }
        Returns: number
      }
      get_published_posts_count: {
        Args: { campus_filter?: string }
        Returns: number
      }
      get_user_signups_count: {
        Args: { user_uuid: string }
        Returns: number
      }
      get_user_upcoming_commitments: {
        Args: { user_uuid: string }
        Returns: {
          date: string
          end_time: string
          location: string
          opportunity_id: string
          signup_notes: string
          start_time: string
          title: string
        }[]
      }
      is_opportunity_full: {
        Args: { opportunity_uuid: string }
        Returns: boolean
      }
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
