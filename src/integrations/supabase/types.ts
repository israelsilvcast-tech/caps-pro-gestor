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
      attendance_actions: {
        Row: {
          action_date: string
          attendance_id: string
          created_at: string | null
          id: string
          notes: string | null
          procedure_id: string
          professional_id: string
          quantity: number
          updated_at: string | null
        }
        Insert: {
          action_date: string
          attendance_id: string
          created_at?: string | null
          id?: string
          notes?: string | null
          procedure_id: string
          professional_id: string
          quantity?: number
          updated_at?: string | null
        }
        Update: {
          action_date?: string
          attendance_id?: string
          created_at?: string | null
          id?: string
          notes?: string | null
          procedure_id?: string
          professional_id?: string
          quantity?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_actions_attendance_id_fkey"
            columns: ["attendance_id"]
            isOneToOne: false
            referencedRelation: "attendances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_actions_procedure_id_fkey"
            columns: ["procedure_id"]
            isOneToOne: false
            referencedRelation: "procedures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_actions_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
        ]
      }
      attendances: {
        Row: {
          admission_date: string
          cid_primary: string
          cid_secondary1: string | null
          cid_secondary2: string | null
          cid_secondary3: string | null
          created_at: string | null
          drug_type: string | null
          drug_user: string
          esf_cnes: string | null
          esf_coverage: string
          homeless_situation: string
          id: string
          month_reference: string
          patient_destination: string
          patient_id: string
          patient_origin: string
          updated_at: string | null
        }
        Insert: {
          admission_date: string
          cid_primary: string
          cid_secondary1?: string | null
          cid_secondary2?: string | null
          cid_secondary3?: string | null
          created_at?: string | null
          drug_type?: string | null
          drug_user?: string
          esf_cnes?: string | null
          esf_coverage?: string
          homeless_situation?: string
          id?: string
          month_reference: string
          patient_destination: string
          patient_id: string
          patient_origin: string
          updated_at?: string | null
        }
        Update: {
          admission_date?: string
          cid_primary?: string
          cid_secondary1?: string | null
          cid_secondary2?: string | null
          cid_secondary3?: string | null
          created_at?: string | null
          drug_type?: string | null
          drug_user?: string
          esf_cnes?: string | null
          esf_coverage?: string
          homeless_situation?: string
          id?: string
          month_reference?: string
          patient_destination?: string
          patient_id?: string
          patient_origin?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendances_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          address_complement: string | null
          address_neighborhood: string | null
          address_number: string | null
          address_street: string | null
          address_zipcode: string | null
          birth_date: string
          cns: string | null
          cpf: string | null
          created_at: string | null
          email: string | null
          id: string
          mobile: string | null
          mother_name: string | null
          name: string
          phone: string | null
          prontuario: string | null
          race_color: string
          responsible_name: string | null
          sex: string
          updated_at: string | null
        }
        Insert: {
          address_complement?: string | null
          address_neighborhood?: string | null
          address_number?: string | null
          address_street?: string | null
          address_zipcode?: string | null
          birth_date: string
          cns?: string | null
          cpf?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          mobile?: string | null
          mother_name?: string | null
          name: string
          phone?: string | null
          prontuario?: string | null
          race_color: string
          responsible_name?: string | null
          sex: string
          updated_at?: string | null
        }
        Update: {
          address_complement?: string | null
          address_neighborhood?: string | null
          address_number?: string | null
          address_street?: string | null
          address_zipcode?: string | null
          birth_date?: string
          cns?: string | null
          cpf?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          mobile?: string | null
          mother_name?: string | null
          name?: string
          phone?: string | null
          prontuario?: string | null
          race_color?: string
          responsible_name?: string | null
          sex?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      procedures: {
        Row: {
          active: boolean | null
          created_at: string | null
          description: string
          id: string
          procedure_type: string | null
          sigtap_code: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          description: string
          id?: string
          procedure_type?: string | null
          sigtap_code: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          description?: string
          id?: string
          procedure_type?: string | null
          sigtap_code?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      professionals: {
        Row: {
          active: boolean | null
          cbo_code: string
          cbo_description: string
          cns: string | null
          cpf: string | null
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          cbo_code: string
          cbo_description: string
          cns?: string | null
          cpf?: string | null
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          cbo_code?: string
          cbo_description?: string
          cns?: string | null
          cpf?: string | null
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
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
