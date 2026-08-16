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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      accidents: {
        Row: {
          casualties: number
          description: string
          id: string
          lat: number
          lng: number
          occurred_at: string
          road_id: string | null
          severity: Database["public"]["Enums"]["alert_severity"]
        }
        Insert: {
          casualties?: number
          description?: string
          id?: string
          lat: number
          lng: number
          occurred_at?: string
          road_id?: string | null
          severity?: Database["public"]["Enums"]["alert_severity"]
        }
        Update: {
          casualties?: number
          description?: string
          id?: string
          lat?: number
          lng?: number
          occurred_at?: string
          road_id?: string | null
          severity?: Database["public"]["Enums"]["alert_severity"]
        }
        Relationships: [
          {
            foreignKeyName: "accidents_road_id_fkey"
            columns: ["road_id"]
            isOneToOne: false
            referencedRelation: "roads"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_models: {
        Row: {
          accuracy: number | null
          algorithm: string
          artifact: string | null
          confusion: Json
          dataset_rows: number
          f1: number | null
          features: Json
          id: string
          mae: number | null
          name: string
          precision_score: number | null
          r2: number | null
          recall: number | null
          rmse: number | null
          status: string
          trained_at: string
          version: string
        }
        Insert: {
          accuracy?: number | null
          algorithm?: string
          artifact?: string | null
          confusion?: Json
          dataset_rows?: number
          f1?: number | null
          features?: Json
          id?: string
          mae?: number | null
          name: string
          precision_score?: number | null
          r2?: number | null
          recall?: number | null
          rmse?: number | null
          status?: string
          trained_at?: string
          version: string
        }
        Update: {
          accuracy?: number | null
          algorithm?: string
          artifact?: string | null
          confusion?: Json
          dataset_rows?: number
          f1?: number | null
          features?: Json
          id?: string
          mae?: number | null
          name?: string
          precision_score?: number | null
          r2?: number | null
          recall?: number | null
          rmse?: number | null
          status?: string
          trained_at?: string
          version?: string
        }
        Relationships: []
      }
      alerts: {
        Row: {
          area: string
          created_at: string
          id: string
          message: string
          road_id: string | null
          severity: Database["public"]["Enums"]["alert_severity"]
          status: Database["public"]["Enums"]["alert_status"]
          type: string
        }
        Insert: {
          area?: string
          created_at?: string
          id?: string
          message: string
          road_id?: string | null
          severity?: Database["public"]["Enums"]["alert_severity"]
          status?: Database["public"]["Enums"]["alert_status"]
          type: string
        }
        Update: {
          area?: string
          created_at?: string
          id?: string
          message?: string
          road_id?: string | null
          severity?: Database["public"]["Enums"]["alert_severity"]
          status?: Database["public"]["Enums"]["alert_status"]
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "alerts_road_id_fkey"
            columns: ["road_id"]
            isOneToOne: false
            referencedRelation: "roads"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics: {
        Row: {
          bucket: string
          bucket_index: number
          dims: Json
          id: string
          metric: string
          period: string
          value: number
        }
        Insert: {
          bucket: string
          bucket_index?: number
          dims?: Json
          id?: string
          metric: string
          period: string
          value: number
        }
        Update: {
          bucket?: string
          bucket_index?: number
          dims?: Json
          id?: string
          metric?: string
          period?: string
          value?: number
        }
        Relationships: []
      }
      congestion: {
        Row: {
          category: Database["public"]["Enums"]["congestion_category"]
          congestion_pct: number
          id: string
          recorded_at: string
          road_id: string
        }
        Insert: {
          category?: Database["public"]["Enums"]["congestion_category"]
          congestion_pct: number
          id?: string
          recorded_at?: string
          road_id: string
        }
        Update: {
          category?: Database["public"]["Enums"]["congestion_category"]
          congestion_pct?: number
          id?: string
          recorded_at?: string
          road_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "congestion_road_id_fkey"
            columns: ["road_id"]
            isOneToOne: false
            referencedRelation: "roads"
            referencedColumns: ["id"]
          },
        ]
      }
      heatmaps: {
        Row: {
          captured_at: string
          grid_x: number
          grid_y: number
          id: string
          lat: number
          layer: string
          lng: number
          value: number
        }
        Insert: {
          captured_at?: string
          grid_x: number
          grid_y: number
          id?: string
          lat: number
          layer: string
          lng: number
          value: number
        }
        Update: {
          captured_at?: string
          grid_x?: number
          grid_y?: number
          id?: string
          lat?: number
          layer?: string
          lng?: number
          value?: number
        }
        Relationships: []
      }
      logs: {
        Row: {
          action: string
          actor_id: string | null
          actor_name: string
          created_at: string
          id: string
          target: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          actor_name?: string
          created_at?: string
          id?: string
          target?: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          actor_name?: string
          created_at?: string
          id?: string
          target?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          id: string
          read: boolean
          title: string
          user_id: string
        }
        Insert: {
          body?: string
          created_at?: string
          id?: string
          read?: boolean
          title: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          read?: boolean
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      places: {
        Row: {
          area: string
          capacity: number
          category: string
          city: string
          id: number
          lat: number
          lng: number
          name: string
          samples: number
          search: string
          signal: number
          speed: number
          vehicles: number
        }
        Insert: {
          area?: string
          capacity?: number
          category?: string
          city?: string
          id?: number
          lat: number
          lng: number
          name: string
          samples?: number
          search?: string
          signal?: number
          speed?: number
          vehicles?: number
        }
        Update: {
          area?: string
          capacity?: number
          category?: string
          city?: string
          id?: number
          lat?: number
          lng?: number
          name?: string
          samples?: number
          search?: string
          signal?: number
          speed?: number
          vehicles?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          city: string
          created_at: string
          email: string
          full_name: string
          id: string
          mobile: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          city?: string
          created_at?: string
          email?: string
          full_name?: string
          id: string
          mobile?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          city?: string
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          mobile?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string
          format: string
          id: string
          kind: string
          name: string
          payload: Json
          period: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          format?: string
          id?: string
          kind: string
          name: string
          payload?: Json
          period?: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          format?: string
          id?: string
          kind?: string
          name?: string
          payload?: Json
          period?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      road_conditions: {
        Row: {
          condition: string
          id: string
          notes: string | null
          road_id: string
          surface_score: number
          updated_at: string
        }
        Insert: {
          condition: string
          id?: string
          notes?: string | null
          road_id: string
          surface_score?: number
          updated_at?: string
        }
        Update: {
          condition?: string
          id?: string
          notes?: string | null
          road_id?: string
          surface_score?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "road_conditions_road_id_fkey"
            columns: ["road_id"]
            isOneToOne: false
            referencedRelation: "roads"
            referencedColumns: ["id"]
          },
        ]
      }
      roads: {
        Row: {
          area: string
          cameras: number
          city: string
          code: string
          condition: string
          created_at: string
          id: string
          lanes: number
          lat: number
          length_km: number
          lng: number
          name: string
          road_type: string
          road_width_m: number
          signals: number
        }
        Insert: {
          area: string
          cameras?: number
          city?: string
          code: string
          condition?: string
          created_at?: string
          id?: string
          lanes?: number
          lat: number
          length_km?: number
          lng: number
          name: string
          road_type?: string
          road_width_m?: number
          signals?: number
        }
        Update: {
          area?: string
          cameras?: number
          city?: string
          code?: string
          condition?: string
          created_at?: string
          id?: string
          lanes?: number
          lat?: number
          length_km?: number
          lng?: number
          name?: string
          road_type?: string
          road_width_m?: number
          signals?: number
        }
        Relationships: []
      }
      routes: {
        Row: {
          created_at: string
          destination: string
          id: string
          options: Json
          reasoning: string
          recommended: Json
          source: string
          user_id: string
        }
        Insert: {
          created_at?: string
          destination: string
          id?: string
          options?: Json
          reasoning?: string
          recommended?: Json
          source: string
          user_id: string
        }
        Update: {
          created_at?: string
          destination?: string
          id?: string
          options?: Json
          reasoning?: string
          recommended?: Json
          source?: string
          user_id?: string
        }
        Relationships: []
      }
      settings: {
        Row: {
          id: string
          preferences: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          preferences?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          preferences?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      traffic_data: {
        Row: {
          accident_flag: boolean
          avg_speed: number
          congestion: number
          day_of_week: number
          hour_of_day: number
          id: string
          is_holiday: boolean
          is_peak: boolean
          occupancy: number
          recorded_at: string
          road_id: string
          signal_delay_sec: number
          status: Database["public"]["Enums"]["road_status"]
          travel_time_min: number
          vehicle_count: number
          weather: string
        }
        Insert: {
          accident_flag?: boolean
          avg_speed: number
          congestion: number
          day_of_week: number
          hour_of_day: number
          id?: string
          is_holiday?: boolean
          is_peak?: boolean
          occupancy: number
          recorded_at?: string
          road_id: string
          signal_delay_sec?: number
          status?: Database["public"]["Enums"]["road_status"]
          travel_time_min?: number
          vehicle_count: number
          weather?: string
        }
        Update: {
          accident_flag?: boolean
          avg_speed?: number
          congestion?: number
          day_of_week?: number
          hour_of_day?: number
          id?: string
          is_holiday?: boolean
          is_peak?: boolean
          occupancy?: number
          recorded_at?: string
          road_id?: string
          signal_delay_sec?: number
          status?: Database["public"]["Enums"]["road_status"]
          travel_time_min?: number
          vehicle_count?: number
          weather?: string
        }
        Relationships: [
          {
            foreignKeyName: "traffic_data_road_id_fkey"
            columns: ["road_id"]
            isOneToOne: false
            referencedRelation: "roads"
            referencedColumns: ["id"]
          },
        ]
      }
      traffic_predictions: {
        Row: {
          category: Database["public"]["Enums"]["congestion_category"]
          confidence: number
          congestion_pct: number
          created_at: string
          destination_area: string
          expected_delay_min: number
          explanation: string
          id: string
          inputs: Json
          source_area: string
          traffic_density: number
          travel_time_min: number
          user_id: string
          vehicle_flow: number
        }
        Insert: {
          category: Database["public"]["Enums"]["congestion_category"]
          confidence: number
          congestion_pct: number
          created_at?: string
          destination_area: string
          expected_delay_min: number
          explanation?: string
          id?: string
          inputs?: Json
          source_area: string
          traffic_density: number
          travel_time_min: number
          user_id: string
          vehicle_flow: number
        }
        Update: {
          category?: Database["public"]["Enums"]["congestion_category"]
          confidence?: number
          congestion_pct?: number
          created_at?: string
          destination_area?: string
          expected_delay_min?: number
          explanation?: string
          id?: string
          inputs?: Json
          source_area?: string
          traffic_density?: number
          travel_time_min?: number
          user_id?: string
          vehicle_flow?: number
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
          role?: Database["public"]["Enums"]["app_role"]
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
      vehicle_counts: {
        Row: {
          autos: number
          bikes: number
          buses: number
          cars: number
          emergency: number
          id: string
          recorded_at: string
          road_id: string
          trucks: number
        }
        Insert: {
          autos?: number
          bikes?: number
          buses?: number
          cars?: number
          emergency?: number
          id?: string
          recorded_at?: string
          road_id: string
          trucks?: number
        }
        Update: {
          autos?: number
          bikes?: number
          buses?: number
          cars?: number
          emergency?: number
          id?: string
          recorded_at?: string
          road_id?: string
          trucks?: number
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_counts_road_id_fkey"
            columns: ["road_id"]
            isOneToOne: false
            referencedRelation: "roads"
            referencedColumns: ["id"]
          },
        ]
      }
      weather: {
        Row: {
          city: string
          condition: string
          humidity: number
          id: string
          rain_mm: number
          recorded_at: string
          temp_c: number
          wind_kph: number
        }
        Insert: {
          city?: string
          condition: string
          humidity?: number
          id?: string
          rain_mm?: number
          recorded_at?: string
          temp_c: number
          wind_kph?: number
        }
        Update: {
          city?: string
          condition?: string
          humidity?: number
          id?: string
          rain_mm?: number
          recorded_at?: string
          temp_c?: number
          wind_kph?: number
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
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {
      alert_severity: "Critical" | "High" | "Medium" | "Low"
      alert_status: "Active" | "Acknowledged" | "Resolved"
      app_role: "admin" | "operator" | "analyst" | "viewer"
      congestion_category: "Low" | "Medium" | "High"
      road_status: "Free flow" | "Moderate" | "Heavy" | "Gridlock"
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
      alert_severity: ["Critical", "High", "Medium", "Low"],
      alert_status: ["Active", "Acknowledged", "Resolved"],
      app_role: ["admin", "operator", "analyst", "viewer"],
      congestion_category: ["Low", "Medium", "High"],
      road_status: ["Free flow", "Moderate", "Heavy", "Gridlock"],
    },
  },
} as const
