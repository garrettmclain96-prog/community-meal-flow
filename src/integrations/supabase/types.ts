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
      assistance_requests: {
        Row: {
          area: string
          consent: boolean
          created_at: string
          email: string | null
          first_name: string
          household_size: number
          id: string
          matched_kitchen_id: string | null
          matched_partner_id: string | null
          need_type: string
          notes: string | null
          phone: string | null
          requester_id: string | null
          status: string
          updated_at: string
          urgency: string
        }
        Insert: {
          area: string
          consent: boolean
          created_at?: string
          email?: string | null
          first_name: string
          household_size: number
          id?: string
          matched_kitchen_id?: string | null
          matched_partner_id?: string | null
          need_type: string
          notes?: string | null
          phone?: string | null
          requester_id?: string | null
          status?: string
          updated_at?: string
          urgency?: string
        }
        Update: {
          area?: string
          consent?: boolean
          created_at?: string
          email?: string | null
          first_name?: string
          household_size?: number
          id?: string
          matched_kitchen_id?: string | null
          matched_partner_id?: string | null
          need_type?: string
          notes?: string | null
          phone?: string | null
          requester_id?: string | null
          status?: string
          updated_at?: string
          urgency?: string
        }
        Relationships: [
          {
            foreignKeyName: "assistance_requests_matched_kitchen_id_fkey"
            columns: ["matched_kitchen_id"]
            isOneToOne: false
            referencedRelation: "kitchens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assistance_requests_matched_partner_id_fkey"
            columns: ["matched_partner_id"]
            isOneToOne: false
            referencedRelation: "partner_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_runs: {
        Row: {
          claimed_at: string | null
          created_at: string
          delivered_at: string | null
          dropoff_area: string | null
          id: string
          kitchen_id: string
          meals: number
          order_id: string
          picked_up_at: string | null
          status: string
          updated_at: string
          volunteer_id: string | null
          window_end: string
          window_start: string
        }
        Insert: {
          claimed_at?: string | null
          created_at?: string
          delivered_at?: string | null
          dropoff_area?: string | null
          id?: string
          kitchen_id: string
          meals?: number
          order_id: string
          picked_up_at?: string | null
          status?: string
          updated_at?: string
          volunteer_id?: string | null
          window_end?: string
          window_start?: string
        }
        Update: {
          claimed_at?: string | null
          created_at?: string
          delivered_at?: string | null
          dropoff_area?: string | null
          id?: string
          kitchen_id?: string
          meals?: number
          order_id?: string
          picked_up_at?: string | null
          status?: string
          updated_at?: string
          volunteer_id?: string | null
          window_end?: string
          window_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_runs_kitchen_id_fkey"
            columns: ["kitchen_id"]
            isOneToOne: false
            referencedRelation: "kitchens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_runs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "funded_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_runs_volunteer_id_fkey"
            columns: ["volunteer_id"]
            isOneToOne: false
            referencedRelation: "volunteers"
            referencedColumns: ["id"]
          },
        ]
      }
      fulfillment_verifications: {
        Row: {
          id: string
          meals: number
          outcome: string
          referral_id: string
          verified_at: string
          verified_by: string
        }
        Insert: {
          id?: string
          meals?: number
          outcome: string
          referral_id: string
          verified_at?: string
          verified_by: string
        }
        Update: {
          id?: string
          meals?: number
          outcome?: string
          referral_id?: string
          verified_at?: string
          verified_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "fulfillment_verifications_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: true
            referencedRelation: "partner_referrals"
            referencedColumns: ["id"]
          },
        ]
      }
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
      kitchen_claims: {
        Row: {
          created_at: string
          id: string
          kitchen_id: string
          note: string | null
          role_at_kitchen: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          kitchen_id: string
          note?: string | null
          role_at_kitchen?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          kitchen_id?: string
          note?: string | null
          role_at_kitchen?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "kitchen_claims_kitchen_id_fkey"
            columns: ["kitchen_id"]
            isOneToOne: false
            referencedRelation: "kitchens"
            referencedColumns: ["id"]
          },
        ]
      }
      kitchen_support_awards: {
        Row: {
          amount_cents: number
          created_at: string
          details: string | null
          ends_at: string | null
          id: string
          kind: string
          kitchen_id: string
          starts_at: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          amount_cents?: number
          created_at?: string
          details?: string | null
          ends_at?: string | null
          id?: string
          kind: string
          kitchen_id: string
          starts_at?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          details?: string | null
          ends_at?: string | null
          id?: string
          kind?: string
          kitchen_id?: string
          starts_at?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "kitchen_support_awards_kitchen_id_fkey"
            columns: ["kitchen_id"]
            isOneToOne: false
            referencedRelation: "kitchens"
            referencedColumns: ["id"]
          },
        ]
      }
      kitchens: {
        Row: {
          active: boolean
          address: string | null
          approved: boolean
          city: string
          claimed: boolean
          claimed_at: string | null
          cost_per_meal: number
          created_at: string
          daily_capacity_meals: number
          id: string
          is_test: boolean
          kind: string
          kind_detail: string | null
          latitude: number | null
          longitude: number | null
          name: string
          neighborhood: string | null
          owner_id: string | null
          payout_account_id: string | null
          payout_status: string
          postal_code: string | null
          source: string
          summary: string | null
          website: string | null
        }
        Insert: {
          active?: boolean
          address?: string | null
          approved?: boolean
          city?: string
          claimed?: boolean
          claimed_at?: string | null
          cost_per_meal?: number
          created_at?: string
          daily_capacity_meals?: number
          id?: string
          is_test?: boolean
          kind?: string
          kind_detail?: string | null
          latitude?: number | null
          longitude?: number | null
          name: string
          neighborhood?: string | null
          owner_id?: string | null
          payout_account_id?: string | null
          payout_status?: string
          postal_code?: string | null
          source?: string
          summary?: string | null
          website?: string | null
        }
        Update: {
          active?: boolean
          address?: string | null
          approved?: boolean
          city?: string
          claimed?: boolean
          claimed_at?: string | null
          cost_per_meal?: number
          created_at?: string
          daily_capacity_meals?: number
          id?: string
          is_test?: boolean
          kind?: string
          kind_detail?: string | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          neighborhood?: string | null
          owner_id?: string | null
          payout_account_id?: string | null
          payout_status?: string
          postal_code?: string | null
          source?: string
          summary?: string | null
          website?: string | null
        }
        Relationships: []
      }
      legal_document_acceptances: {
        Row: {
          accepted_at: string
          context: string | null
          created_at: string
          document_key: string
          document_version: string
          id: string
          signer_name: string | null
          user_id: string
        }
        Insert: {
          accepted_at?: string
          context?: string | null
          created_at?: string
          document_key: string
          document_version: string
          id?: string
          signer_name?: string | null
          user_id: string
        }
        Update: {
          accepted_at?: string
          context?: string | null
          created_at?: string
          document_key?: string
          document_version?: string
          id?: string
          signer_name?: string | null
          user_id?: string
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
      partner_memberships: {
        Row: {
          created_at: string
          id: string
          partner_id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          partner_id: string
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          partner_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_memberships_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partner_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_organizations: {
        Row: {
          active: boolean
          approved: boolean
          created_at: string
          id: string
          kind: string
          name: string
          service_areas: string[]
          updated_at: string
          website: string | null
        }
        Insert: {
          active?: boolean
          approved?: boolean
          created_at?: string
          id?: string
          kind?: string
          name: string
          service_areas?: string[]
          updated_at?: string
          website?: string | null
        }
        Update: {
          active?: boolean
          approved?: boolean
          created_at?: string
          id?: string
          kind?: string
          name?: string
          service_areas?: string[]
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      partner_referrals: {
        Row: {
          created_at: string
          id: string
          internal_note: string | null
          kitchen_id: string | null
          partner_id: string
          request_id: string
          scheduled_for: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          internal_note?: string | null
          kitchen_id?: string | null
          partner_id: string
          request_id: string
          scheduled_for?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          internal_note?: string | null
          kitchen_id?: string | null
          partner_id?: string
          request_id?: string
          scheduled_for?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_referrals_kitchen_id_fkey"
            columns: ["kitchen_id"]
            isOneToOne: false
            referencedRelation: "kitchens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_referrals_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partner_organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_referrals_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "assistance_requests"
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
      pilot_signups: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          interest: string
          internal_note: string | null
          note: string | null
          postal_code: string | null
          resolved_at: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id?: string
          interest: string
          internal_note?: string | null
          note?: string | null
          postal_code?: string | null
          resolved_at?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          interest?: string
          internal_note?: string | null
          note?: string | null
          postal_code?: string | null
          resolved_at?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      privacy_requests: {
        Row: {
          contact_preference: string | null
          created_at: string
          details: string | null
          id: string
          internal_note: string | null
          request_type: string
          resolved_at: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          contact_preference?: string | null
          created_at?: string
          details?: string | null
          id?: string
          internal_note?: string | null
          request_type: string
          resolved_at?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          contact_preference?: string | null
          created_at?: string
          details?: string | null
          id?: string
          internal_note?: string | null
          request_type?: string
          resolved_at?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      refund_requests: {
        Row: {
          created_at: string
          id: string
          internal_note: string | null
          reason: string | null
          reference_id: string | null
          request_type: string
          resolved_at: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          internal_note?: string | null
          reason?: string | null
          reference_id?: string | null
          request_type: string
          resolved_at?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          internal_note?: string | null
          reason?: string | null
          reference_id?: string | null
          request_type?: string
          resolved_at?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      shift_signups: {
        Row: {
          created_at: string
          hours: number
          id: string
          shift_id: string
          status: string
          updated_at: string
          volunteer_id: string
        }
        Insert: {
          created_at?: string
          hours?: number
          id?: string
          shift_id: string
          status?: string
          updated_at?: string
          volunteer_id: string
        }
        Update: {
          created_at?: string
          hours?: number
          id?: string
          shift_id?: string
          status?: string
          updated_at?: string
          volunteer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shift_signups_shift_id_fkey"
            columns: ["shift_id"]
            isOneToOne: false
            referencedRelation: "volunteer_shifts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shift_signups_volunteer_id_fkey"
            columns: ["volunteer_id"]
            isOneToOne: false
            referencedRelation: "volunteers"
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
          target_id: string | null
          target_label: string | null
          target_type: string | null
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
          target_id?: string | null
          target_label?: string | null
          target_type?: string | null
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
          target_id?: string | null
          target_label?: string | null
          target_type?: string | null
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
      volunteer_shifts: {
        Row: {
          created_at: string
          ends_at: string
          id: string
          kitchen_id: string
          neighborhood: string | null
          notes: string | null
          role: string
          slots: number
          starts_at: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          ends_at: string
          id?: string
          kitchen_id: string
          neighborhood?: string | null
          notes?: string | null
          role?: string
          slots?: number
          starts_at: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          ends_at?: string
          id?: string
          kitchen_id?: string
          neighborhood?: string | null
          notes?: string | null
          role?: string
          slots?: number
          starts_at?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "volunteer_shifts_kitchen_id_fkey"
            columns: ["kitchen_id"]
            isOneToOne: false
            referencedRelation: "kitchens"
            referencedColumns: ["id"]
          },
        ]
      }
      volunteers: {
        Row: {
          active: boolean
          agreement_accepted_at: string | null
          availability: string[]
          can_drive: boolean
          city: string
          created_at: string
          email: string | null
          full_name: string
          id: string
          neighborhoods: string[]
          phone: string | null
          skills: string[]
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          agreement_accepted_at?: string | null
          availability?: string[]
          can_drive?: boolean
          city?: string
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          neighborhoods?: string[]
          phone?: string | null
          skills?: string[]
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          agreement_accepted_at?: string | null
          availability?: string[]
          can_drive?: boolean
          city?: string
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          neighborhoods?: string[]
          phone?: string | null
          skills?: string[]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      advance_delivery_run: {
        Args: { _run_id: string; _status: string }
        Returns: undefined
      }
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
      apply_for_kitchen_support: {
        Args: { _award_id: string }
        Returns: string
      }
      apply_partner_organization: {
        Args: {
          _kind: string
          _name: string
          _service_areas: string[]
          _website: string
        }
        Returns: string
      }
      claim_delivery_run: { Args: { _run_id: string }; Returns: string }
      claim_kitchen: {
        Args: { _kitchen_id: string; _note?: string; _role?: string }
        Returns: string
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
      get_my_kitchen_support: { Args: { _kitchen_id: string }; Returns: Json }
      get_my_partner_workspace: { Args: never; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_approved_partner_member: {
        Args: { _partner_id: string }
        Returns: boolean
      }
      my_volunteer_id: { Args: never; Returns: string }
      owns_household: { Args: { _household_id: string }; Returns: boolean }
      owns_kitchen: { Args: { _kitchen_id: string }; Returns: boolean }
      submit_assistance_request: {
        Args: {
          _area: string
          _consent: boolean
          _email: string
          _first_name: string
          _household_size: number
          _need_type: string
          _notes: string
          _phone: string
          _urgency: string
        }
        Returns: string
      }
      suggest_kitchen_for_area: { Args: { _area: string }; Returns: string }
      update_partner_referral: {
        Args: {
          _meals?: number
          _outcome?: string
          _referral_id: string
          _scheduled_for?: string
          _status: string
        }
        Returns: string
      }
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
