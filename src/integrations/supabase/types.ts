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
      funded_orders: {
        Row: {
          amount_cents: number
          checkout_id: string | null
          created_at: string
          delivered_at: string | null
          id: string
          kitchen_id: string
          meals_funded: number
          neighborhood: string | null
          paid: boolean
          sponsor_id: string | null
          sponsor_name: string | null
          status: string
          template_id: string | null
        }
        Insert: {
          amount_cents: number
          checkout_id?: string | null
          created_at?: string
          delivered_at?: string | null
          id?: string
          kitchen_id: string
          meals_funded: number
          neighborhood?: string | null
          paid?: boolean
          sponsor_id?: string | null
          sponsor_name?: string | null
          status?: string
          template_id?: string | null
        }
        Update: {
          amount_cents?: number
          checkout_id?: string | null
          created_at?: string
          delivered_at?: string | null
          id?: string
          kitchen_id?: string
          meals_funded?: number
          neighborhood?: string | null
          paid?: boolean
          sponsor_id?: string | null
          sponsor_name?: string | null
          status?: string
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "funded_orders_checkout_id_fkey"
            columns: ["checkout_id"]
            isOneToOne: false
            referencedRelation: "sponsor_checkouts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "funded_orders_kitchen_id_fkey"
            columns: ["kitchen_id"]
            isOneToOne: false
            referencedRelation: "kitchens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "funded_orders_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "meal_templates"
            referencedColumns: ["id"]
          },
        ]
      }
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
      impact_events: {
        Row: {
          id: string
          kind: string
          kitchen_id: string | null
          meals: number
          neighborhood: string | null
          occurred_at: string
          order_id: string | null
        }
        Insert: {
          id?: string
          kind: string
          kitchen_id?: string | null
          meals?: number
          neighborhood?: string | null
          occurred_at?: string
          order_id?: string | null
        }
        Update: {
          id?: string
          kind?: string
          kitchen_id?: string | null
          meals?: number
          neighborhood?: string | null
          occurred_at?: string
          order_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "impact_events_kitchen_id_fkey"
            columns: ["kitchen_id"]
            isOneToOne: false
            referencedRelation: "kitchens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "impact_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "funded_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      ingredient_prices: {
        Row: {
          id: string
          ingredient_id: string
          observed_at: string
          package_label: string
          package_size: number
          package_unit: string
          price: number
          provenance: string
          store_id: string
        }
        Insert: {
          id?: string
          ingredient_id: string
          observed_at?: string
          package_label: string
          package_size: number
          package_unit: string
          price: number
          provenance?: string
          store_id: string
        }
        Update: {
          id?: string
          ingredient_id?: string
          observed_at?: string
          package_label?: string
          package_size?: number
          package_unit?: string
          price?: number
          provenance?: string
          store_id?: string
        }
        Relationships: []
      }
      kitchens: {
        Row: {
          active: boolean
          approved: boolean
          city: string
          cost_per_meal: number
          created_at: string
          daily_capacity_meals: number
          id: string
          kind: string
          kind_detail: string | null
          name: string
          neighborhood: string | null
          owner_id: string
          payout_account_id: string | null
          payout_status: string
        }
        Insert: {
          active?: boolean
          approved?: boolean
          city?: string
          cost_per_meal?: number
          created_at?: string
          daily_capacity_meals?: number
          id?: string
          kind?: string
          kind_detail?: string | null
          name: string
          neighborhood?: string | null
          owner_id: string
          payout_account_id?: string | null
          payout_status?: string
        }
        Update: {
          active?: boolean
          approved?: boolean
          city?: string
          cost_per_meal?: number
          created_at?: string
          daily_capacity_meals?: number
          id?: string
          kind?: string
          kind_detail?: string | null
          name?: string
          neighborhood?: string | null
          owner_id?: string
          payout_account_id?: string | null
          payout_status?: string
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
      meal_templates: {
        Row: {
          active: boolean
          cost_per_meal: number
          created_at: string
          description: string | null
          dietary_tags: string[]
          id: string
          kitchen_id: string
          name: string
          servings_per_batch: number
        }
        Insert: {
          active?: boolean
          cost_per_meal?: number
          created_at?: string
          description?: string | null
          dietary_tags?: string[]
          id?: string
          kitchen_id: string
          name: string
          servings_per_batch?: number
        }
        Update: {
          active?: boolean
          cost_per_meal?: number
          created_at?: string
          description?: string | null
          dietary_tags?: string[]
          id?: string
          kitchen_id?: string
          name?: string
          servings_per_batch?: number
        }
        Relationships: [
          {
            foreignKeyName: "meal_templates_kitchen_id_fkey"
            columns: ["kitchen_id"]
            isOneToOne: false
            referencedRelation: "kitchens"
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
      payouts: {
        Row: {
          amount_cents: number
          created_at: string
          failure_reason: string | null
          id: string
          kitchen_id: string
          order_id: string | null
          paid_at: string | null
          period_end: string
          period_start: string
          status: string
          stripe_transfer_id: string | null
        }
        Insert: {
          amount_cents?: number
          created_at?: string
          failure_reason?: string | null
          id?: string
          kitchen_id: string
          order_id?: string | null
          paid_at?: string | null
          period_end?: string
          period_start?: string
          status?: string
          stripe_transfer_id?: string | null
        }
        Update: {
          amount_cents?: number
          created_at?: string
          failure_reason?: string | null
          id?: string
          kitchen_id?: string
          order_id?: string | null
          paid_at?: string | null
          period_end?: string
          period_start?: string
          status?: string
          stripe_transfer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payouts_kitchen_id_fkey"
            columns: ["kitchen_id"]
            isOneToOne: false
            referencedRelation: "kitchens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payouts_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "funded_orders"
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
      public_recipes: {
        Row: {
          created_at: string
          equipment: string[]
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
      sponsor_checkouts: {
        Row: {
          amount_cents: number
          created_at: string
          environment: string
          id: string
          kitchen_id: string
          meals: number
          neighborhood: string | null
          order_id: string | null
          sponsor_id: string | null
          sponsor_name: string | null
          status: string
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          template_id: string | null
          updated_at: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          environment?: string
          id?: string
          kitchen_id: string
          meals: number
          neighborhood?: string | null
          order_id?: string | null
          sponsor_id?: string | null
          sponsor_name?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          template_id?: string | null
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          environment?: string
          id?: string
          kitchen_id?: string
          meals?: number
          neighborhood?: string | null
          order_id?: string | null
          sponsor_id?: string | null
          sponsor_name?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          template_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sponsor_checkouts_kitchen_id_fkey"
            columns: ["kitchen_id"]
            isOneToOne: false
            referencedRelation: "kitchens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sponsor_checkouts_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "funded_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sponsor_checkouts_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "meal_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      sponsorship_allocations: {
        Row: {
          amount_cents: number
          created_at: string
          environment: string
          id: string
          meals_allocated: number
          stripe_invoice_id: string
          stripe_subscription_id: string | null
          user_id: string | null
        }
        Insert: {
          amount_cents: number
          created_at?: string
          environment?: string
          id?: string
          meals_allocated?: number
          stripe_invoice_id: string
          stripe_subscription_id?: string | null
          user_id?: string | null
        }
        Update: {
          amount_cents?: number
          created_at?: string
          environment?: string
          id?: string
          meals_allocated?: number
          stripe_invoice_id?: string
          stripe_subscription_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          environment: string
          id: string
          price_id: string | null
          product_id: string | null
          status: string
          stripe_customer_id: string
          stripe_subscription_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          price_id?: string | null
          product_id?: string | null
          status?: string
          stripe_customer_id: string
          stripe_subscription_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          price_id?: string | null
          product_id?: string | null
          status?: string
          stripe_customer_id?: string
          stripe_subscription_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      advance_order: {
        Args: { _order_id: string; _status: string }
        Returns: undefined
      }
      allocate_sponsorship_funding: {
        Args: {
          _amount_cents: number
          _sponsor_name?: string
          _user_id: string
        }
        Returns: number
      }
      confirm_sponsor_checkout: {
        Args: { _checkout_id: string; _payment_intent: string }
        Returns: string
      }
      fund_meals: {
        Args: {
          _kitchen_id: string
          _meals: number
          _sponsor_name?: string
          _template_id: string
        }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      owns_household: { Args: { _household_id: string }; Returns: boolean }
      owns_kitchen: { Args: { _kitchen_id: string }; Returns: boolean }
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
