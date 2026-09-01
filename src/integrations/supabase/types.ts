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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      household_members: {
        Row: {
          age_group: string
          appetite: number
          created_at: string
          household_id: string
          id: string
          name: string
        }
        Insert: {
          age_group?: string
          appetite?: number
          created_at?: string
          household_id: string
          id?: string
          name: string
        }
        Update: {
          age_group?: string
          appetite?: number
          created_at?: string
          household_id?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "household_members_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      households: {
        Row: {
          allergies: string[]
          avoid_tags: string[]
          created_at: string
          dietary_preferences: string[]
          dinners_per_week: number
          equipment: string[]
          id: string
          max_cook_minutes: number
          name: string
          onboarded: boolean
          owner_id: string
          store_ids: string[]
          updated_at: string
          weekly_budget: number
        }
        Insert: {
          allergies?: string[]
          avoid_tags?: string[]
          created_at?: string
          dietary_preferences?: string[]
          dinners_per_week?: number
          equipment?: string[]
          id?: string
          max_cook_minutes?: number
          name?: string
          onboarded?: boolean
          owner_id: string
          store_ids?: string[]
          updated_at?: string
          weekly_budget?: number
        }
        Update: {
          allergies?: string[]
          avoid_tags?: string[]
          created_at?: string
          dietary_preferences?: string[]
          dinners_per_week?: number
          equipment?: string[]
          id?: string
          max_cook_minutes?: number
          name?: string
          onboarded?: boolean
          owner_id?: string
          store_ids?: string[]
          updated_at?: string
          weekly_budget?: number
        }
        Relationships: []
      }
      meal_plans: {
        Row: {
          checked: string[]
          created_at: string
          household_id: string
          id: string
          plan: Json
        }
        Insert: {
          checked?: string[]
          created_at?: string
          household_id: string
          id?: string
          plan: Json
        }
        Update: {
          checked?: string[]
          created_at?: string
          household_id?: string
          id?: string
          plan?: Json
        }
        Relationships: [
          {
            foreignKeyName: "meal_plans_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      pantry_items: {
        Row: {
          added_at: string
          amount: number
          expires_at: string | null
          household_id: string
          id: string
          ingredient_id: string
          origin: string
          unit: string
        }
        Insert: {
          added_at?: string
          amount: number
          expires_at?: string | null
          household_id: string
          id?: string
          ingredient_id: string
          origin?: string
          unit: string
        }
        Update: {
          added_at?: string
          amount?: number
          expires_at?: string | null
          household_id?: string
          id?: string
          ingredient_id?: string
          origin?: string
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "pantry_items_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      price_observations: {
        Row: {
          household_id: string
          id: string
          ingredient_id: string
          observed_at: string
          package_label: string | null
          price: number
          store_id: string
        }
        Insert: {
          household_id: string
          id?: string
          ingredient_id: string
          observed_at?: string
          package_label?: string | null
          price: number
          store_id: string
        }
        Update: {
          household_id?: string
          id?: string
          ingredient_id?: string
          observed_at?: string
          package_label?: string | null
          price?: number
          store_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "price_observations_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string | null
          id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
        }
        Relationships: []
      }
      recipes: {
        Row: {
          created_at: string
          equipment: string[]
          household_id: string
          id: string
          ingredients: Json
          servings: number
          slug: string
          source: Json
          steps: Json
          tags: string[]
          title: string
          total_time_minutes: number
        }
        Insert: {
          created_at?: string
          equipment?: string[]
          household_id: string
          id?: string
          ingredients?: Json
          servings?: number
          slug: string
          source?: Json
          steps?: Json
          tags?: string[]
          title: string
          total_time_minutes?: number
        }
        Update: {
          created_at?: string
          equipment?: string[]
          household_id?: string
          id?: string
          ingredients?: Json
          servings?: number
          slug?: string
          source?: Json
          steps?: Json
          tags?: string[]
          title?: string
          total_time_minutes?: number
        }
        Relationships: [
          {
            foreignKeyName: "recipes_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      owns_household: { Args: { _household_id: string }; Returns: boolean }
    }
    Enums: {
      app_role:
        | "household"
        | "kitchen"
        | "nonprofit"
        | "sponsor"
        | "city_admin"
        | "platform_admin"
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
    Enums: {
      app_role: [
        "household",
        "kitchen",
        "nonprofit",
        "sponsor",
        "city_admin",
        "platform_admin",
      ],
    },
  },
} as const
