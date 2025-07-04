// types/supabase.ts with added order_id field
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      clients: {
        Row: {
          company_name: string;
          created_at: string;
          email: string | null;
          id: string;
          name: string;
          phone: string | null;
          updated_at: string | null;
        };
        Insert: {
          company_name: string;
          created_at?: string;
          email?: string | null;
          id?: string;
          name: string;
          phone?: string | null;
          updated_at?: string | null;
        };
        Update: {
          company_name?: string;
          created_at?: string;
          email?: string | null;
          id?: string;
          name?: string;
          phone?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      package_features: {
        Row: {
          id: string;
          is_bold: boolean | null;
          is_included: boolean | null;
          order_index: number;
          package_id: string;
          text: string;
          color: string | null;
        };
        Insert: {
          id?: string;
          is_bold?: boolean | null;
          is_included?: boolean | null;
          order_index: number;
          package_id: string;
          text: string;
          color?: string | null;
        };
        Update: {
          id?: string;
          is_bold?: boolean | null;
          is_included?: boolean | null;
          order_index?: number;
          package_id?: string;
          text?: string;
          color?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "package_features_package_id_fkey";
            columns: ["package_id"];
            isOneToOne: false;
            referencedRelation: "packages";
            referencedColumns: ["id"];
          },
        ];
      };
      packages: {
        Row: {
          created_at: string | null;
          currency: string | null;
          description: string | null;
          id: string;
          is_popular: boolean | null;
          name: string;
          price: number;
          updated_at: string | null;
          usd_price: number | null;
        };
        Insert: {
          created_at?: string | null;
          currency?: string | null;
          description?: string | null;
          id?: string;
          is_popular?: boolean | null;
          name: string;
          price: number;
          updated_at?: string | null;
          usd_price?: number | null;
        };
        Update: {
          created_at?: string | null;
          currency?: string | null;
          description?: string | null;
          id?: string;
          is_popular?: boolean | null;
          name?: string;
          price?: number;
          updated_at?: string | null;
          usd_price?: number | null;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          email: string | null;
          id: string;
          name: string | null;
          role: "admin" | "sales_rep" | null;
          updated_at: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          email?: string | null;
          id: string;
          name?: string | null;
          role?: string | null;
          updated_at?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          email?: string | null;
          id?: string;
          name?: string | null;
          role?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      proposal_links: {
        Row: {
          created_at: string | null;
          id: string;
          proposal_id: string;
          token: string;
          views_count: number | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          proposal_id: string;
          token: string;
          views_count?: number | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          proposal_id?: string;
          token?: string;
          views_count?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "proposal_links_proposal_id_fkey";
            columns: ["proposal_id"];
            isOneToOne: false;
            referencedRelation: "proposals";
            referencedColumns: ["id"];
          },
        ];
      };
      proposal_services: {
        Row: {
          discount_type: string | null;
          discount_value: number | null;
          id: string;
          proposal_id: string;
          service_id: string | null;
        };
        Insert: {
          discount_type?: string | null;
          discount_value?: number | null;
          id?: string;
          proposal_id: string;
          service_id?: string | null;
        };
        Update: {
          discount_type?: string | null;
          discount_value?: number | null;
          id?: string;
          proposal_id?: string;
          service_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "proposal_services_proposal_id_fkey";
            columns: ["proposal_id"];
            isOneToOne: false;
            referencedRelation: "proposals";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "proposal_services_service_id_fkey";
            columns: ["service_id"];
            isOneToOne: false;
            referencedRelation: "services";
            referencedColumns: ["id"];
          },
        ];
      };
      proposals: {
        Row: {
          additional_info: string | null;
          client_id: string | null;
          company_name: string;
          created_at: string | null;
          encoded_data: string | null;
          id: string;
          include_package: boolean | null;
          overall_discount_type: string | null;
          overall_discount_value: number | null;
          package_discount_type: string | null;
          package_discount_value: number | null;
          package_id: string | null;
          proposal_data: Json | null;
          proposal_date: string;
          status: string | null;
          title: string | null;
          updated_at: string | null;
          client_name: string;
          order_id: string | null; // Added the order_id field
          validity_days: number | null;
          expires_at: string | null;
          created_by: string;
          archived_at: string | null;
          archived_by: string | null;
        };
        Insert: {
          additional_info?: string | null;
          client_id?: string | null;
          company_name: string;
          created_at?: string | null;
          encoded_data?: string | null;
          id?: string;
          include_package?: boolean | null;
          overall_discount_type?: string | null;
          overall_discount_value?: number | null;
          package_discount_type?: string | null;
          package_discount_value?: number | null;
          package_id?: string | null;
          proposal_data?: Json | null;
          proposal_date: string;
          status?: string | null;
          title?: string | null;
          updated_at?: string | null;
          client_name: string;
          order_id?: string | null; // Added the order_id field
          validity_days?: number | null;
          expires_at?: string | null;
          created_by: string;
          archived_at?: string | null;
          archived_by?: string | null;
        };
        Update: {
          additional_info?: string | null;
          client_id?: string | null;
          company_name?: string;
          created_at?: string | null;
          encoded_data?: string | null;
          id?: string;
          include_package?: boolean | null;
          overall_discount_type?: string | null;
          overall_discount_value?: number | null;
          package_discount_type?: string | null;
          package_discount_value?: number | null;
          package_id?: string | null;
          proposal_data?: Json | null;
          proposal_date?: string;
          status?: string | null;
          title?: string | null;
          updated_at?: string | null;
          client_name?: string;
          order_id?: string | null; // Added the order_id field
          validity_days?: number | null;
          expires_at?: string | null;
          created_by?: string;
          archived_at?: string | null;
          archived_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "proposals_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "proposals_package_id_fkey";
            columns: ["package_id"];
            isOneToOne: false;
            referencedRelation: "packages";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "proposals_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "proposals_archived_by_fkey";
            columns: ["archived_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      activity_logs: {
        Row: {
          id: string;
          user_id: string;
          action: string;
          entity_type: string;
          entity_id: string | null;
          metadata: Json | null;
          created_at: string;
          ip_address: string | null;
          user_agent: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          metadata?: Json | null;
          created_at?: string;
          ip_address?: string | null;
          user_agent?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          action?: string;
          entity_type?: string;
          entity_id?: string | null;
          metadata?: Json | null;
          created_at?: string;
          ip_address?: string | null;
          user_agent?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "activity_logs_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      services: {
        Row: {
          created_at: string | null;
          currency: string | null;
          description: string | null;
          id: string;
          is_monthly: boolean | null;
          name: string;
          price: number;
          setup_fee: number | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          currency?: string | null;
          description?: string | null;
          id?: string;
          is_monthly?: boolean | null;
          name: string;
          price: number;
          setup_fee?: number | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          currency?: string | null;
          description?: string | null;
          id?: string;
          is_monthly?: boolean | null;
          name?: string;
          price?: number;
          setup_fee?: number | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      invoices: {
        Row: {
          id: string;
          invoice_number: string;
          proposal_id: string | null;
          order_id: string;
          issuer_name: string;
          issuer_address: string;
          issuer_phone: string;
          issuer_trn: string;
          client_name: string;
          client_company: string;
          client_address: string;
          client_trn: string | null;
          issue_date: string;
          due_date: string;
          currency: string;
          line_items: Json;
          bank_account_holder: string;
          iban: string;
          swift_code: string;
          bank_address: string;
          subtotal: number;
          vat_amount: number;
          total_amount: number;
          status: string | null;
          created_by: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          invoice_number?: string;
          proposal_id?: string | null;
          order_id: string;
          issuer_name?: string;
          issuer_address: string;
          issuer_phone: string;
          issuer_trn?: string;
          client_name: string;
          client_company: string;
          client_address: string;
          client_trn?: string | null;
          issue_date?: string;
          due_date: string;
          currency?: string;
          line_items: Json;
          bank_account_holder?: string;
          iban: string;
          swift_code: string;
          bank_address: string;
          subtotal: number;
          vat_amount: number;
          total_amount: number;
          status?: string | null;
          created_by?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          invoice_number?: string;
          proposal_id?: string | null;
          order_id?: string;
          issuer_name?: string;
          issuer_address?: string;
          issuer_phone?: string;
          issuer_trn?: string;
          client_name?: string;
          client_company?: string;
          client_address?: string;
          client_trn?: string | null;
          issue_date?: string;
          due_date?: string;
          currency?: string;
          line_items?: Json;
          bank_account_holder?: string;
          iban?: string;
          swift_code?: string;
          bank_address?: string;
          subtotal?: number;
          vat_amount?: number;
          total_amount?: number;
          status?: string | null;
          created_by?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "invoices_proposal_id_fkey";
            columns: ["proposal_id"];
            isOneToOne: false;
            referencedRelation: "proposals";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "invoices_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      active_proposals: {
        Row: {
          additional_info: string | null;
          client_id: string | null;
          company_name: string;
          created_at: string | null;
          encoded_data: string | null;
          id: string;
          include_package: boolean | null;
          overall_discount_type: string | null;
          overall_discount_value: number | null;
          package_discount_type: string | null;
          package_discount_value: number | null;
          package_id: string | null;
          proposal_data: Json | null;
          proposal_date: string;
          status: string | null;
          title: string | null;
          updated_at: string | null;
          client_name: string;
          order_id: string | null;
          validity_days: number | null;
          expires_at: string | null;
          created_by: string;
          archived_at: string | null;
          archived_by: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "proposals_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "proposals_package_id_fkey";
            columns: ["package_id"];
            isOneToOne: false;
            referencedRelation: "packages";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "proposals_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "proposals_archived_by_fkey";
            columns: ["archived_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      is_sales_rep: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      log_activity: {
        Args: {
          p_action: string;
          p_entity_type: string;
          p_entity_id?: string;
          p_metadata?: Json;
        };
        Returns: void;
      };
      generate_invoice_number: {
        Args: Record<string, never>;
        Returns: string;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
