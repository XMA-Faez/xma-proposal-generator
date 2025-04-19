export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      clients: {
        Row: {
          company_name: string
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          company_name: string
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          company_name?: string
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      package_features: {
        Row: {
          id: string
          is_bold: boolean | null
          is_included: boolean | null
          order_index: number
          package_id: string
          text: string
        }
        Insert: {
          id?: string
          is_bold?: boolean | null
          is_included?: boolean | null
          order_index: number
          package_id: string
          text: string
        }
        Update: {
          id?: string
          is_bold?: boolean | null
          is_included?: boolean | null
          order_index?: number
          package_id?: string
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "package_features_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          }
        ]
      }
      packages: {
        Row: {
          created_at: string | null
          currency: string | null
          description: string | null
          id: string
          is_popular: boolean | null
          name: string
          price: number
          updated_at: string | null
          usd_price: number | null
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          is_popular?: boolean | null
          name: string
          price: number
          updated_at?: string | null
          usd_price?: number | null
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          is_popular?: boolean | null
          name?: string
          price?: number
          updated_at?: string | null
          usd_price?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          id: string
          name: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id: string
          name?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      proposal_links: {
        Row: {
          created_at: string | null
          id: string
          proposal_id: string
          token: string
          views_count: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          proposal_id: string
          token: string
          views_count?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          proposal_id?: string
          token?: string
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "proposal_links_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          }
        ]
      }
      proposal_services: {
        Row: {
          discount_type: string | null
          discount_value: number | null
          id: string
          proposal_id: string
          service_id: string | null
        }
        Insert: {
          discount_type?: string | null
          discount_value?: number | null
          id?: string
          proposal_id: string
          service_id?: string | null
        }
        Update: {
          discount_type?: string | null
          discount_value?: number | null
          id?: string
          proposal_id?: string
          service_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proposal_services_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposal_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          }
        ]
      }
      proposals: {
        Row: {
          additional_info: string | null
          client_id: string | null
          company_name: string
          created_at: string | null
          encoded_data: string | null
          id: string
          include_package: boolean | null
          overall_discount_type: string | null
          overall_discount_value: number | null
          package_discount_type: string | null
          package_discount_value: number | null
          package_id: string | null
          proposal_data: Json | null
          proposal_date: string
          status: string | null
          title: string | null
          updated_at: string | null
          client_name: string
        }
        Insert: {
          additional_info?: string | null
          client_id?: string | null
          company_name: string
          created_at?: string | null
          encoded_data?: string | null
          id?: string
          include_package?: boolean | null
          overall_discount_type?: string | null
          overall_discount_value?: number | null
          package_discount_type?: string | null
          package_discount_value?: number | null
          package_id?: string | null
          proposal_data?: Json | null
          proposal_date: string
          status?: string | null
          title?: string | null
          updated_at?: string | null
          client_name: string
        }
        Update: {
          additional_info?: string | null
          client_id?: string | null
          company_name?: string
          created_at?: string | null
          encoded_data?: string | null
          id?: string
          include_package?: boolean | null
          overall_discount_type?: string | null
          overall_discount_value?: number | null
          package_discount_type?: string | null
          package_discount_value?: number | null
          package_id?: string | null
          proposal_data?: Json | null
          proposal_date?: string
          status?: string | null
          title?: string | null
          updated_at?: string | null
          client_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "proposals_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          }
        ]
      }
      services: {
        Row: {
          created_at: string | null
          currency: string | null
          description: string | null
          id: string
          is_monthly: boolean | null
          name: string
          price: number
          setup_fee: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          is_monthly?: boolean | null
          name: string
          price: number
          setup_fee?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          is_monthly?: boolean | null
          name?: string
          price?: number
          setup_fee?: number | null
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
