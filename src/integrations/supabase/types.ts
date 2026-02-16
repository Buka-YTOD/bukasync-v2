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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      cart_items: {
        Row: {
          created_at: string
          id: string
          member_id: string
          menu_item_category: string | null
          menu_item_id: string
          menu_item_image: string | null
          menu_item_name: string
          menu_item_price: number
          quantity: number
          session_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          member_id: string
          menu_item_category?: string | null
          menu_item_id: string
          menu_item_image?: string | null
          menu_item_name: string
          menu_item_price: number
          quantity?: number
          session_id: string
        }
        Update: {
          created_at?: string
          id?: string
          member_id?: string
          menu_item_category?: string | null
          menu_item_id?: string
          menu_item_image?: string | null
          menu_item_name?: string
          menu_item_price?: number
          quantity?: number
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "session_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "dining_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      dining_sessions: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          session_code: string
          status: string
          table_number: number
          terminated_at: string | null
          terminated_by: string | null
          termination_comment: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          session_code: string
          status?: string
          table_number: number
          terminated_at?: string | null
          terminated_by?: string | null
          termination_comment?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          session_code?: string
          status?: string
          table_number?: number
          terminated_at?: string | null
          terminated_by?: string | null
          termination_comment?: string | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          created_at: string
          id: string
          items: Json
          session_id: string
          status: string
          submitted_by_id: string | null
          submitted_by_name: string
          total_amount: number
        }
        Insert: {
          created_at?: string
          id?: string
          items: Json
          session_id: string
          status?: string
          submitted_by_id?: string | null
          submitted_by_name: string
          total_amount: number
        }
        Update: {
          created_at?: string
          id?: string
          items?: Json
          session_id?: string
          status?: string
          submitted_by_id?: string | null
          submitted_by_name?: string
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "orders_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "dining_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_submitted_by_id_fkey"
            columns: ["submitted_by_id"]
            isOneToOne: false
            referencedRelation: "session_members"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurants: {
        Row: {
          address: string
          close_time: string
          created_at: string
          delivery_fee: number | null
          description: string | null
          estimated_delivery_mins: number | null
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          open_days: string[]
          open_time: string
          phone: string | null
          rating: number | null
          supports_dinein: boolean
          supports_shop: boolean
        }
        Insert: {
          address: string
          close_time?: string
          created_at?: string
          delivery_fee?: number | null
          description?: string | null
          estimated_delivery_mins?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          open_days?: string[]
          open_time?: string
          phone?: string | null
          rating?: number | null
          supports_dinein?: boolean
          supports_shop?: boolean
        }
        Update: {
          address?: string
          close_time?: string
          created_at?: string
          delivery_fee?: number | null
          description?: string | null
          estimated_delivery_mins?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          open_days?: string[]
          open_time?: string
          phone?: string | null
          rating?: number | null
          supports_dinein?: boolean
          supports_shop?: boolean
        }
        Relationships: []
      }
      session_members: {
        Row: {
          color: string
          device_token: string | null
          id: string
          is_ready: boolean
          joined_at: string
          name: string
          session_id: string
        }
        Insert: {
          color: string
          device_token?: string | null
          id?: string
          is_ready?: boolean
          joined_at?: string
          name: string
          session_id: string
        }
        Update: {
          color?: string
          device_token?: string | null
          id?: string
          is_ready?: boolean
          joined_at?: string
          name?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_members_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "dining_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      shop_menu_items: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_available: boolean
          name: string
          price: number
          restaurant_id: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean
          name: string
          price: number
          restaurant_id: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean
          name?: string
          price?: number
          restaurant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shop_menu_items_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      shop_orders: {
        Row: {
          created_at: string
          customer_email: string | null
          customer_name: string
          customer_phone: string
          delivery_address: string | null
          delivery_fee: number
          fulfillment_type: string
          id: string
          items: Json
          notes: string | null
          payment_status: string
          restaurant_id: string
          status: string
          subtotal: number
          total_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_email?: string | null
          customer_name: string
          customer_phone: string
          delivery_address?: string | null
          delivery_fee?: number
          fulfillment_type?: string
          id?: string
          items: Json
          notes?: string | null
          payment_status?: string
          restaurant_id: string
          status?: string
          subtotal: number
          total_amount: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string
          delivery_address?: string | null
          delivery_fee?: number
          fulfillment_type?: string
          id?: string
          items?: Json
          notes?: string | null
          payment_status?: string
          restaurant_id?: string
          status?: string
          subtotal?: number
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shop_orders_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
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
      clear_session_cart: {
        Args: { target_session_id: string }
        Returns: undefined
      }
      get_member_id_by_device: {
        Args: { check_device_token: string; check_session_id: string }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_session_member: {
        Args: { check_device_token: string; check_session_id: string }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "kitchen" | "waiter" | "cashier" | "host"
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
      app_role: ["admin", "kitchen", "waiter", "cashier", "host"],
    },
  },
} as const
