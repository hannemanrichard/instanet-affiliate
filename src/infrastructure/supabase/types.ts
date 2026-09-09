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
    PostgrestVersion: "10.2.0 (e07807d)"
  }
  public: {
    Tables: {
      affiliate_claim_attachments: {
        Row: {
          claim_id: number
          created_at: string
          file_name: string | null
          file_type: string | null
          file_url: string
          id: number
        }
        Insert: {
          claim_id: number
          created_at?: string
          file_name?: string | null
          file_type?: string | null
          file_url: string
          id?: number
        }
        Update: {
          claim_id?: number
          created_at?: string
          file_name?: string | null
          file_type?: string | null
          file_url?: string
          id?: number
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_claim_attachments_claim_id_fkey"
            columns: ["claim_id"]
            isOneToOne: false
            referencedRelation: "affiliate_claims"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_claims: {
        Row: {
          admin_notes: string | null
          category: string
          created_at: string
          description: string
          id: number
          order_id: number
          partner_id: number
          resolved_at: string | null
          resolved_by: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          category: string
          created_at?: string
          description: string
          id?: number
          order_id: number
          partner_id: number
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          category?: string
          created_at?: string
          description?: string
          id?: number
          order_id?: number
          partner_id?: number
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_claims_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_claims_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          changed_by: number | null
          created_at: string
          id: number
          new_values: Json | null
          old_values: Json | null
          record_id: number | null
          record_uuid: string | null
          source: string
          table_name: string
        }
        Insert: {
          action: string
          changed_by?: number | null
          created_at?: string
          id?: number
          new_values?: Json | null
          old_values?: Json | null
          record_id?: number | null
          record_uuid?: string | null
          source?: string
          table_name: string
        }
        Update: {
          action?: string
          changed_by?: number | null
          created_at?: string
          id?: number
          new_values?: Json | null
          old_values?: Json | null
          record_id?: number | null
          record_uuid?: string | null
          source?: string
          table_name?: string
        }
        Relationships: []
      }
      badges: {
        Row: {
          category: string
          created_at: string | null
          description: string
          icon_url: string | null
          id: string
          is_active: boolean | null
          name: string
          rarity: string
          requirements: Json | null
          updated_at: string | null
          xp_reward: number | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description: string
          icon_url?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          rarity?: string
          requirements?: Json | null
          updated_at?: string | null
          xp_reward?: number | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string
          icon_url?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          rarity?: string
          requirements?: Json | null
          updated_at?: string | null
          xp_reward?: number | null
        }
        Relationships: []
      }
      bonus_configurations: {
        Row: {
          bonus_amount: number
          bonus_type: string
          created_at: string | null
          currency: string | null
          description: string
          id: string
          is_active: boolean | null
          updated_at: string | null
          xp_required: number
        }
        Insert: {
          bonus_amount: number
          bonus_type: string
          created_at?: string | null
          currency?: string | null
          description: string
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
          xp_required: number
        }
        Update: {
          bonus_amount?: number
          bonus_type?: string
          created_at?: string | null
          currency?: string | null
          description?: string
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
          xp_required?: number
        }
        Relationships: []
      }
      claims: {
        Row: {
          category_id: string | null
          claim_id: string
          created_at: string
          description: string | null
          parcel_id: string
          status: string | null
          title: string | null
        }
        Insert: {
          category_id?: string | null
          claim_id?: string
          created_at?: string
          description?: string | null
          parcel_id?: string
          status?: string | null
          title?: string | null
        }
        Update: {
          category_id?: string | null
          claim_id?: string
          created_at?: string
          description?: string | null
          parcel_id?: string
          status?: string | null
          title?: string | null
        }
        Relationships: []
      }
      commissions: {
        Row: {
          amount: number
          created_at: string
          id: number
          is_earned: boolean
          order_id: number
          partner_id: number
          product_id: number | null
          product_name: string | null
          quantity: number
          unit_commission: number
          unit_discount: number
        }
        Insert: {
          amount: number
          created_at?: string
          id?: number
          is_earned?: boolean
          order_id: number
          partner_id: number
          product_id?: number | null
          product_name?: string | null
          quantity?: number
          unit_commission: number
          unit_discount?: number
        }
        Update: {
          amount?: number
          created_at?: string
          id?: number
          is_earned?: boolean
          order_id?: number
          partner_id?: number
          product_id?: number | null
          product_name?: string | null
          quantity?: number
          unit_commission?: number
          unit_discount?: number
        }
        Relationships: [
          {
            foreignKeyName: "commissions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_catalog_view"
            referencedColumns: ["id"]
          },
        ]
      }
      course_analytics: {
        Row: {
          average_completion_time: number | null
          average_rating: number | null
          calculated_at: string | null
          completion_rate: number | null
          course_id: string
          drop_off_points: string[] | null
          engagement_metrics: Json | null
          id: string
          most_watched_videos: string[] | null
          total_enrollments: number | null
        }
        Insert: {
          average_completion_time?: number | null
          average_rating?: number | null
          calculated_at?: string | null
          completion_rate?: number | null
          course_id: string
          drop_off_points?: string[] | null
          engagement_metrics?: Json | null
          id?: string
          most_watched_videos?: string[] | null
          total_enrollments?: number | null
        }
        Update: {
          average_completion_time?: number | null
          average_rating?: number | null
          calculated_at?: string | null
          completion_rate?: number | null
          course_id?: string
          drop_off_points?: string[] | null
          engagement_metrics?: Json | null
          id?: string
          most_watched_videos?: string[] | null
          total_enrollments?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "course_analytics_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: true
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_completions: {
        Row: {
          badges_earned: string[] | null
          completed_at: string | null
          completion_percentage: number
          course_id: string
          id: string
          partner_id: number
          time_spent_minutes: number | null
          total_xp_earned: number | null
        }
        Insert: {
          badges_earned?: string[] | null
          completed_at?: string | null
          completion_percentage: number
          course_id: string
          id?: string
          partner_id: number
          time_spent_minutes?: number | null
          total_xp_earned?: number | null
        }
        Update: {
          badges_earned?: string[] | null
          completed_at?: string | null
          completion_percentage?: number
          course_id?: string
          id?: string
          partner_id?: number
          time_spent_minutes?: number | null
          total_xp_earned?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "course_completions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_completions_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      course_enrollments: {
        Row: {
          completed_at: string | null
          course_id: string
          current_module_id: string | null
          current_video_id: string | null
          enrolled_at: string | null
          id: string
          last_watched_at: string | null
          partner_id: number
          progress_percentage: number | null
          started_at: string | null
          status: string
        }
        Insert: {
          completed_at?: string | null
          course_id: string
          current_module_id?: string | null
          current_video_id?: string | null
          enrolled_at?: string | null
          id?: string
          last_watched_at?: string | null
          partner_id: number
          progress_percentage?: number | null
          started_at?: string | null
          status?: string
        }
        Update: {
          completed_at?: string | null
          course_id?: string
          current_module_id?: string | null
          current_video_id?: string | null
          enrolled_at?: string | null
          id?: string
          last_watched_at?: string | null
          partner_id?: number
          progress_percentage?: number | null
          started_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_enrollments_current_module_id_fkey"
            columns: ["current_module_id"]
            isOneToOne: false
            referencedRelation: "course_modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_enrollments_current_video_id_fkey"
            columns: ["current_video_id"]
            isOneToOne: false
            referencedRelation: "course_videos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_enrollments_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      course_modules: {
        Row: {
          course_id: string
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          id: string
          is_active: boolean | null
          order_index: number
          title: string
        }
        Insert: {
          course_id: string
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          order_index: number
          title: string
        }
        Update: {
          course_id?: string
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          order_index?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_progress: {
        Row: {
          badges_earned: string[] | null
          course_id: string
          created_at: string | null
          id: string
          last_activity_at: string | null
          modules_completed: number | null
          overall_progress: number | null
          partner_id: number
          total_modules: number
          total_videos: number
          updated_at: string | null
          videos_completed: number | null
          xp_earned: number | null
        }
        Insert: {
          badges_earned?: string[] | null
          course_id: string
          created_at?: string | null
          id?: string
          last_activity_at?: string | null
          modules_completed?: number | null
          overall_progress?: number | null
          partner_id: number
          total_modules: number
          total_videos: number
          updated_at?: string | null
          videos_completed?: number | null
          xp_earned?: number | null
        }
        Update: {
          badges_earned?: string[] | null
          course_id?: string
          created_at?: string | null
          id?: string
          last_activity_at?: string | null
          modules_completed?: number | null
          overall_progress?: number | null
          partner_id?: number
          total_modules?: number
          total_videos?: number
          updated_at?: string | null
          videos_completed?: number | null
          xp_earned?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "course_progress_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_progress_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      course_videos: {
        Row: {
          created_at: string | null
          description: string | null
          duration_seconds: number
          external_provider: string
          external_video_id: string | null
          id: string
          is_active: boolean | null
          module_id: string
          order_index: number
          thumbnail_url: string | null
          title: string
          video_type: string
          video_url: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration_seconds: number
          external_provider: string
          external_video_id?: string | null
          id?: string
          is_active?: boolean | null
          module_id: string
          order_index: number
          thumbnail_url?: string | null
          title: string
          video_type: string
          video_url?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration_seconds?: number
          external_provider?: string
          external_video_id?: string | null
          id?: string
          is_active?: boolean | null
          module_id?: string
          order_index?: number
          thumbnail_url?: string | null
          title?: string
          video_type?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_videos_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "course_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          category: string
          created_at: string | null
          description: string
          difficulty: string
          duration_minutes: number
          id: string
          instructor_avatar: string | null
          instructor_bio: string | null
          instructor_name: string
          is_active: boolean | null
          is_featured: boolean | null
          learning_objectives: string[] | null
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description: string
          difficulty: string
          duration_minutes: number
          id?: string
          instructor_avatar?: string | null
          instructor_bio?: string | null
          instructor_name: string
          is_active?: boolean | null
          is_featured?: boolean | null
          learning_objectives?: string[] | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string
          difficulty?: string
          duration_minutes?: number
          id?: string
          instructor_avatar?: string | null
          instructor_bio?: string | null
          instructor_name?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          learning_objectives?: string[] | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number | null
          category: string | null
          comment: string | null
          corresponding_product: string | null
          corresponding_qty: number | null
          created_at: string
          department: string | null
          id: number
          type: string | null
        }
        Insert: {
          amount?: number | null
          category?: string | null
          comment?: string | null
          corresponding_product?: string | null
          corresponding_qty?: number | null
          created_at?: string
          department?: string | null
          id?: number
          type?: string | null
        }
        Update: {
          amount?: number | null
          category?: string | null
          comment?: string | null
          corresponding_product?: string | null
          corresponding_qty?: number | null
          created_at?: string
          department?: string | null
          id?: number
          type?: string | null
        }
        Relationships: []
      }
      "fb-lead": {
        Row: {
          address: string | null
          comment: string | null
          commune: string | null
          commune_in: string | null
          created_at: string | null
          created_time: string | null
          first_name: string | null
          id: number
          is_stopdesk: boolean | null
          last_name: string | null
          phone: string | null
          price: number | null
          status: string | null
          stopdesk: string | null
          wilaya: string | null
          wilaya_in: string | null
        }
        Insert: {
          address?: string | null
          comment?: string | null
          commune?: string | null
          commune_in?: string | null
          created_at?: string | null
          created_time?: string | null
          first_name?: string | null
          id?: number
          is_stopdesk?: boolean | null
          last_name?: string | null
          phone?: string | null
          price?: number | null
          status?: string | null
          stopdesk?: string | null
          wilaya?: string | null
          wilaya_in?: string | null
        }
        Update: {
          address?: string | null
          comment?: string | null
          commune?: string | null
          commune_in?: string | null
          created_at?: string | null
          created_time?: string | null
          first_name?: string | null
          id?: number
          is_stopdesk?: boolean | null
          last_name?: string | null
          phone?: string | null
          price?: number | null
          status?: string | null
          stopdesk?: string | null
          wilaya?: string | null
          wilaya_in?: string | null
        }
        Relationships: []
      }
      "fb-leads": {
        Row: {
          address: string | null
          comment: string | null
          commune: string | null
          commune_in: string | null
          created_at: string | null
          created_time: string | null
          first_name: string | null
          id: number
          is_stopdesk: boolean | null
          last_name: string | null
          phone: string | null
          status: string | null
          stopdesk: string | null
          wilaya: string | null
          wilaya_in: string | null
        }
        Insert: {
          address?: string | null
          comment?: string | null
          commune?: string | null
          commune_in?: string | null
          created_at?: string | null
          created_time?: string | null
          first_name?: string | null
          id?: number
          is_stopdesk?: boolean | null
          last_name?: string | null
          phone?: string | null
          status?: string | null
          stopdesk?: string | null
          wilaya?: string | null
          wilaya_in?: string | null
        }
        Update: {
          address?: string | null
          comment?: string | null
          commune?: string | null
          commune_in?: string | null
          created_at?: string | null
          created_time?: string | null
          first_name?: string | null
          id?: number
          is_stopdesk?: boolean | null
          last_name?: string | null
          phone?: string | null
          status?: string | null
          stopdesk?: string | null
          wilaya?: string | null
          wilaya_in?: string | null
        }
        Relationships: []
      }
      followups: {
        Row: {
          created_at: string | null
          id: number
          is_handled_center: boolean | null
          is_handled_center_2: boolean | null
          is_handled_center_3: boolean | null
          is_handled_delivered: boolean | null
          is_handled_missed: boolean | null
          is_handled_missed_2: boolean | null
          is_handled_missed_3: boolean | null
          is_handled_out: boolean | null
          is_handled_out_2: boolean | null
          is_handled_out_3: boolean | null
          is_handled_received: boolean | null
          last_changed: string | null
          tracker_id: number | null
          tracking: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          is_handled_center?: boolean | null
          is_handled_center_2?: boolean | null
          is_handled_center_3?: boolean | null
          is_handled_delivered?: boolean | null
          is_handled_missed?: boolean | null
          is_handled_missed_2?: boolean | null
          is_handled_missed_3?: boolean | null
          is_handled_out?: boolean | null
          is_handled_out_2?: boolean | null
          is_handled_out_3?: boolean | null
          is_handled_received?: boolean | null
          last_changed?: string | null
          tracker_id?: number | null
          tracking?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          is_handled_center?: boolean | null
          is_handled_center_2?: boolean | null
          is_handled_center_3?: boolean | null
          is_handled_delivered?: boolean | null
          is_handled_missed?: boolean | null
          is_handled_missed_2?: boolean | null
          is_handled_missed_3?: boolean | null
          is_handled_out?: boolean | null
          is_handled_out_2?: boolean | null
          is_handled_out_3?: boolean | null
          is_handled_received?: boolean | null
          last_changed?: string | null
          tracker_id?: number | null
          tracking?: string | null
        }
        Relationships: []
      }
      histories: {
        Row: {
          center_name: string | null
          commune_name: string | null
          created_at: string
          reason: string | null
          status: string | null
          tracking: string
          wilaya_name: string | null
        }
        Insert: {
          center_name?: string | null
          commune_name?: string | null
          created_at: string
          reason?: string | null
          status?: string | null
          tracking: string
          wilaya_name?: string | null
        }
        Update: {
          center_name?: string | null
          commune_name?: string | null
          created_at?: string
          reason?: string | null
          status?: string | null
          tracking?: string
          wilaya_name?: string | null
        }
        Relationships: []
      }
      inventory: {
        Row: {
          id: number
          item_id: number
          quantity: number | null
        }
        Insert: {
          id?: number
          item_id: number
          quantity?: number | null
        }
        Update: {
          id?: number
          item_id?: number
          quantity?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: true
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_adjustments: {
        Row: {
          adjusted_by: number | null
          created_at: string | null
          delta: number | null
          id: number
          item_id: number
          new_quantity: number | null
          previous_quantity: number | null
          product_id: number
          reason: string | null
        }
        Insert: {
          adjusted_by?: number | null
          created_at?: string | null
          delta?: number | null
          id?: number
          item_id: number
          new_quantity?: number | null
          previous_quantity?: number | null
          product_id: number
          reason?: string | null
        }
        Update: {
          adjusted_by?: number | null
          created_at?: string | null
          delta?: number | null
          id?: number
          item_id?: number
          new_quantity?: number | null
          previous_quantity?: number | null
          product_id?: number
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_adjustments_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_adjustments_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_adjustments_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_catalog_view"
            referencedColumns: ["id"]
          },
        ]
      }
      item_inv_landing_page: {
        Row: {
          color: string | null
          product: string
          quantity: number | null
          size: string | null
        }
        Insert: {
          color?: string | null
          product: string
          quantity?: number | null
          size?: string | null
        }
        Update: {
          color?: string | null
          product?: string
          quantity?: number | null
          size?: string | null
        }
        Relationships: []
      }
      items: {
        Row: {
          cog: number | null
          color: string | null
          color_hex: string
          created_at: string | null
          id: number
          product: string | null
          product_id: number | null
          size: string | null
          thumbnail: string | null
        }
        Insert: {
          cog?: number | null
          color?: string | null
          color_hex?: string
          created_at?: string | null
          id?: number
          product?: string | null
          product_id?: number | null
          size?: string | null
          thumbnail?: string | null
        }
        Update: {
          cog?: number | null
          color?: string | null
          color_hex?: string
          created_at?: string | null
          id?: number
          product?: string | null
          product_id?: number | null
          size?: string | null
          thumbnail?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_catalog_view"
            referencedColumns: ["id"]
          },
        ]
      }
      items_inventory: {
        Row: {
          color: string | null
          id: number
          product: string
          quantity: number | null
          size: string | null
          thumbnail: string | null
        }
        Insert: {
          color?: string | null
          id?: number
          product: string
          quantity?: number | null
          size?: string | null
          thumbnail?: string | null
        }
        Update: {
          color?: string | null
          id?: number
          product?: string
          quantity?: number | null
          size?: string | null
          thumbnail?: string | null
        }
        Relationships: []
      }
      items_inventorys: {
        Row: {
          color: string | null
          id: number
          product: string | null
          quantity: number | null
          size: string | null
          thumbnail: string | null
        }
        Insert: {
          color?: string | null
          id?: number
          product?: string | null
          quantity?: number | null
          size?: string | null
          thumbnail?: string | null
        }
        Update: {
          color?: string | null
          id?: number
          product?: string | null
          quantity?: number | null
          size?: string | null
          thumbnail?: string | null
        }
        Relationships: []
      }
      keydoubleval: {
        Row: {
          key: number
          val1: string | null
          val2: string | null
        }
        Insert: {
          key: number
          val1?: string | null
          val2?: string | null
        }
        Update: {
          key?: number
          val1?: string | null
          val2?: string | null
        }
        Relationships: []
      }
      keyval: {
        Row: {
          key: number
          value: number | null
        }
        Insert: {
          key: number
          value?: number | null
        }
        Update: {
          key?: number
          value?: number | null
        }
        Relationships: []
      }
      keyvalbool: {
        Row: {
          key: boolean | null
          value: number | null
        }
        Insert: {
          key?: boolean | null
          value?: number | null
        }
        Update: {
          key?: boolean | null
          value?: number | null
        }
        Relationships: []
      }
      keyvalcount: {
        Row: {
          count: number | null
          key: number
          val: string
        }
        Insert: {
          count?: number | null
          key: number
          val: string
        }
        Update: {
          count?: number | null
          key?: number
          val?: string
        }
        Relationships: []
      }
      keyvalstr: {
        Row: {
          key: string
          value: number | null
        }
        Insert: {
          key: string
          value?: number | null
        }
        Update: {
          key?: string
          value?: number | null
        }
        Relationships: []
      }
      lead_hop: {
        Row: {
          agent_id: number
          lead_id: number
        }
        Insert: {
          agent_id: number
          lead_id: number
        }
        Update: {
          agent_id?: number
          lead_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "lead_hop_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_item: {
        Row: {
          item_id: number
          lead_id: number
          qty: number
        }
        Insert: {
          item_id: number
          lead_id?: number
          qty: number
        }
        Update: {
          item_id?: number
          lead_id?: number
          qty?: number
        }
        Relationships: [
          {
            foreignKeyName: "lead_item_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_item_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leaderboard_cache: {
        Row: {
          calculated_at: string | null
          id: string
          leaderboard_type: string
          metadata: Json | null
          partner_id: number
          period: string
          rank: number
          score: number
        }
        Insert: {
          calculated_at?: string | null
          id?: string
          leaderboard_type: string
          metadata?: Json | null
          partner_id: number
          period: string
          rank: number
          score: number
        }
        Update: {
          calculated_at?: string | null
          id?: string
          leaderboard_type?: string
          metadata?: Json | null
          partner_id?: number
          period?: string
          rank?: number
          score?: number
        }
        Relationships: [
          {
            foreignKeyName: "leaderboard_cache_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          address: string | null
          agent_id: number | null
          channel: string | null
          color: string | null
          comment: string | null
          commune: string | null
          created_at: string | null
          first_name: string | null
          has_recourse: boolean | null
          id: number
          is_abondoned: boolean | null
          is_moved: boolean | null
          is_wholesale: boolean | null
          last_changed_status: string | null
          last_name: string | null
          objective: string | null
          offer: string | null
          partner_id: number | null
          phone: string | null
          price: string | null
          product: string | null
          size: string | null
          status: string | null
          wilaya: string | null
        }
        Insert: {
          address?: string | null
          agent_id?: number | null
          channel?: string | null
          color?: string | null
          comment?: string | null
          commune?: string | null
          created_at?: string | null
          first_name?: string | null
          has_recourse?: boolean | null
          id?: number
          is_abondoned?: boolean | null
          is_moved?: boolean | null
          is_wholesale?: boolean | null
          last_changed_status?: string | null
          last_name?: string | null
          objective?: string | null
          offer?: string | null
          partner_id?: number | null
          phone?: string | null
          price?: string | null
          product?: string | null
          size?: string | null
          status?: string | null
          wilaya?: string | null
        }
        Update: {
          address?: string | null
          agent_id?: number | null
          channel?: string | null
          color?: string | null
          comment?: string | null
          commune?: string | null
          created_at?: string | null
          first_name?: string | null
          has_recourse?: boolean | null
          id?: number
          is_abondoned?: boolean | null
          is_moved?: boolean | null
          is_wholesale?: boolean | null
          last_changed_status?: string | null
          last_name?: string | null
          objective?: string | null
          offer?: string | null
          partner_id?: number | null
          phone?: string | null
          price?: string | null
          product?: string | null
          size?: string | null
          status?: string | null
          wilaya?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      levels: {
        Row: {
          benefits: Json | null
          created_at: string | null
          description: string | null
          icon_url: string | null
          id: string
          is_active: boolean | null
          level_number: number
          name: string
          xp_required: number
        }
        Insert: {
          benefits?: Json | null
          created_at?: string | null
          description?: string | null
          icon_url?: string | null
          id?: string
          is_active?: boolean | null
          level_number: number
          name: string
          xp_required: number
        }
        Update: {
          benefits?: Json | null
          created_at?: string | null
          description?: string | null
          icon_url?: string | null
          id?: string
          is_active?: boolean | null
          level_number?: number
          name?: string
          xp_required?: number
        }
        Relationships: []
      }
      logs: {
        Row: {
          action: string | null
          attempt: number | null
          created_at: string | null
          delivery_company: string | null
          entity: string | null
          id: number
          last_status: string | null
          number: string | null
          user_fullname: string | null
        }
        Insert: {
          action?: string | null
          attempt?: number | null
          created_at?: string | null
          delivery_company?: string | null
          entity?: string | null
          id?: number
          last_status?: string | null
          number?: string | null
          user_fullname?: string | null
        }
        Update: {
          action?: string | null
          attempt?: number | null
          created_at?: string | null
          delivery_company?: string | null
          entity?: string | null
          id?: number
          last_status?: string | null
          number?: string | null
          user_fullname?: string | null
        }
        Relationships: []
      }
      order_item: {
        Row: {
          item_id: number
          order_id: number
          product_page_id: number | null
          qty: number | null
          unit_supplier_price: number | null
        }
        Insert: {
          item_id: number
          order_id: number
          product_page_id?: number | null
          qty?: number | null
          unit_supplier_price?: number | null
        }
        Update: {
          item_id?: number
          order_id?: number
          product_page_id?: number | null
          qty?: number | null
          unit_supplier_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "order_item_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_item_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_item_product_page_id_fkey"
            columns: ["product_page_id"]
            isOneToOne: false
            referencedRelation: "product_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address: string | null
          agent_id: number | null
          attempt: number | null
          channel: string | null
          comment: string | null
          commune: string | null
          created_at: string | null
          dc_recent_status: string | null
          delivery_attempt: number | null
          delivery_company: string | null
          delivery_fees: number | null
          delivery_notes: number | null
          first_name: string | null
          followedup_at: string | null
          followup_status: string | null
          followups: number | null
          has_claim: boolean
          has_defect: boolean
          has_exchange: boolean | null
          id: number
          is_auto_delivered: boolean
          is_exchange: boolean | null
          is_exchange_required: boolean
          is_free_shipping: boolean | null
          is_stopdesk: boolean | null
          is_supplier_paid: boolean
          is_wholesale: boolean | null
          last_name: string | null
          modified_at: string | null
          objective: string | null
          parcel_id: string | null
          partner_id: number | null
          phone: string | null
          phone2: string | null
          product: string | null
          product_color: string | null
          product_price: number | null
          product_qty: number
          product_size: string | null
          return_processed: boolean
          shipping_price: number | null
          status: string | null
          stopdesk: string | null
          store_id: number
          swap_count: number | null
          tracker_id: number | null
          tracking_id: string | null
          wilaya: string | null
          yalidine_status: string | null
        }
        Insert: {
          address?: string | null
          agent_id?: number | null
          attempt?: number | null
          channel?: string | null
          comment?: string | null
          commune?: string | null
          created_at?: string | null
          dc_recent_status?: string | null
          delivery_attempt?: number | null
          delivery_company?: string | null
          delivery_fees?: number | null
          delivery_notes?: number | null
          first_name?: string | null
          followedup_at?: string | null
          followup_status?: string | null
          followups?: number | null
          has_claim?: boolean
          has_defect?: boolean
          has_exchange?: boolean | null
          id?: number
          is_auto_delivered?: boolean
          is_exchange?: boolean | null
          is_exchange_required?: boolean
          is_free_shipping?: boolean | null
          is_stopdesk?: boolean | null
          is_supplier_paid?: boolean
          is_wholesale?: boolean | null
          last_name?: string | null
          modified_at?: string | null
          objective?: string | null
          parcel_id?: string | null
          partner_id?: number | null
          phone?: string | null
          phone2?: string | null
          product?: string | null
          product_color?: string | null
          product_price?: number | null
          product_qty?: number
          product_size?: string | null
          return_processed?: boolean
          shipping_price?: number | null
          status?: string | null
          stopdesk?: string | null
          store_id?: number
          swap_count?: number | null
          tracker_id?: number | null
          tracking_id?: string | null
          wilaya?: string | null
          yalidine_status?: string | null
        }
        Update: {
          address?: string | null
          agent_id?: number | null
          attempt?: number | null
          channel?: string | null
          comment?: string | null
          commune?: string | null
          created_at?: string | null
          dc_recent_status?: string | null
          delivery_attempt?: number | null
          delivery_company?: string | null
          delivery_fees?: number | null
          delivery_notes?: number | null
          first_name?: string | null
          followedup_at?: string | null
          followup_status?: string | null
          followups?: number | null
          has_claim?: boolean
          has_defect?: boolean
          has_exchange?: boolean | null
          id?: number
          is_auto_delivered?: boolean
          is_exchange?: boolean | null
          is_exchange_required?: boolean
          is_free_shipping?: boolean | null
          is_stopdesk?: boolean | null
          is_supplier_paid?: boolean
          is_wholesale?: boolean | null
          last_name?: string | null
          modified_at?: string | null
          objective?: string | null
          parcel_id?: string | null
          partner_id?: number | null
          phone?: string | null
          phone2?: string | null
          product?: string | null
          product_color?: string | null
          product_price?: number | null
          product_qty?: number
          product_size?: string | null
          return_processed?: boolean
          shipping_price?: number | null
          status?: string | null
          stopdesk?: string | null
          store_id?: number
          swap_count?: number | null
          tracker_id?: number | null
          tracking_id?: string | null
          wilaya?: string | null
          yalidine_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      "parcel-updates": {
        Row: {
          created_at: string
          delivery_man: string | null
          is_handled: boolean | null
          note: string | null
          station: string | null
          status: string
          tracker_id: number | null
          tracking: string
          type: number
        }
        Insert: {
          created_at?: string
          delivery_man?: string | null
          is_handled?: boolean | null
          note?: string | null
          station?: string | null
          status: string
          tracker_id?: number | null
          tracking: string
          type: number
        }
        Update: {
          created_at?: string
          delivery_man?: string | null
          is_handled?: boolean | null
          note?: string | null
          station?: string | null
          status?: string
          tracker_id?: number | null
          tracking?: string
          type?: number
        }
        Relationships: []
      }
      parcels: {
        Row: {
          address: string | null
          center: string | null
          commune: string | null
          created_at: string | null
          date_last_status: string | null
          delivery_fee: number | null
          first_name: string | null
          is_stopdesk: boolean | null
          last_name: string | null
          last_status: string | null
          partner_id: number | null
          payment_status: string | null
          phone: string | null
          price: number | null
          product: string | null
          tracker_id: number | null
          tracking: string
          wilaya: string | null
          zr_parcel_id: string | null
        }
        Insert: {
          address?: string | null
          center?: string | null
          commune?: string | null
          created_at?: string | null
          date_last_status?: string | null
          delivery_fee?: number | null
          first_name?: string | null
          is_stopdesk?: boolean | null
          last_name?: string | null
          last_status?: string | null
          partner_id?: number | null
          payment_status?: string | null
          phone?: string | null
          price?: number | null
          product?: string | null
          tracker_id?: number | null
          tracking: string
          wilaya?: string | null
          zr_parcel_id?: string | null
        }
        Update: {
          address?: string | null
          center?: string | null
          commune?: string | null
          created_at?: string | null
          date_last_status?: string | null
          delivery_fee?: number | null
          first_name?: string | null
          is_stopdesk?: boolean | null
          last_name?: string | null
          last_status?: string | null
          partner_id?: number | null
          payment_status?: string | null
          phone?: string | null
          price?: number | null
          product?: string | null
          tracker_id?: number | null
          tracking?: string
          wilaya?: string | null
          zr_parcel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "parcels_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_badges: {
        Row: {
          badge_id: string
          earned_at: string | null
          id: string
          partner_id: number
          xp_earned: number | null
        }
        Insert: {
          badge_id: string
          earned_at?: string | null
          id?: string
          partner_id: number
          xp_earned?: number | null
        }
        Update: {
          badge_id?: string
          earned_at?: string | null
          id?: string
          partner_id?: number
          xp_earned?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "partner_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_badges_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_bonuses: {
        Row: {
          bonus_amount: number
          bonus_type: string
          claimed_at: string | null
          created_at: string | null
          currency: string | null
          description: string | null
          expires_at: string | null
          id: string
          partner_id: number
          status: string
          unlocked_at: string | null
          updated_at: string | null
          xp_earned: number | null
          xp_required: number | null
        }
        Insert: {
          bonus_amount: number
          bonus_type: string
          claimed_at?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          partner_id: number
          status?: string
          unlocked_at?: string | null
          updated_at?: string | null
          xp_earned?: number | null
          xp_required?: number | null
        }
        Update: {
          bonus_amount?: number
          bonus_type?: string
          claimed_at?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          partner_id?: number
          status?: string
          unlocked_at?: string | null
          updated_at?: string | null
          xp_earned?: number | null
          xp_required?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "partner_bonuses_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_quests: {
        Row: {
          completed_at: string | null
          created_at: string | null
          current_step: number | null
          id: string
          partner_id: number
          progress: Json | null
          quest_id: string
          started_at: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          current_step?: number | null
          id?: string
          partner_id: number
          progress?: Json | null
          quest_id: string
          started_at?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          current_step?: number | null
          id?: string
          partner_id?: number
          progress?: Json | null
          quest_id?: string
          started_at?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partner_quests_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_quests_quest_id_fkey"
            columns: ["quest_id"]
            isOneToOne: false
            referencedRelation: "quests"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_streaks: {
        Row: {
          created_at: string | null
          current_streak: number | null
          id: string
          is_active: boolean | null
          last_activity_date: string | null
          longest_streak: number | null
          partner_id: number
          streak_start_date: string | null
          streak_type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_streak?: number | null
          id?: string
          is_active?: boolean | null
          last_activity_date?: string | null
          longest_streak?: number | null
          partner_id: number
          streak_start_date?: string | null
          streak_type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_streak?: number | null
          id?: string
          is_active?: boolean | null
          last_activity_date?: string | null
          longest_streak?: number | null
          partner_id?: number
          streak_start_date?: string | null
          streak_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partner_streaks_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_xp: {
        Row: {
          created_at: string | null
          current_level: number | null
          id: string
          partner_id: number
          total_xp: number | null
          updated_at: string | null
          xp_to_next_level: number | null
        }
        Insert: {
          created_at?: string | null
          current_level?: number | null
          id?: string
          partner_id: number
          total_xp?: number | null
          updated_at?: string | null
          xp_to_next_level?: number | null
        }
        Update: {
          created_at?: string | null
          current_level?: number | null
          id?: string
          partner_id?: number
          total_xp?: number | null
          updated_at?: string | null
          xp_to_next_level?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "partner_xp_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: true
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      partners: {
        Row: {
          avatar: string | null
          background: string | null
          baridimob_rib: string | null
          bio: string | null
          birthdate: string | null
          created_at: string
          email: string | null
          fullname: string | null
          gender: string | null
          id: number
          instagram: string | null
          linkedin: string | null
          redotpay_account: string | null
          referral_source: string | null
          status: string
          tiktok: string | null
          usdt_address: string | null
          username: string | null
        }
        Insert: {
          avatar?: string | null
          background?: string | null
          baridimob_rib?: string | null
          bio?: string | null
          birthdate?: string | null
          created_at?: string
          email?: string | null
          fullname?: string | null
          gender?: string | null
          id?: number
          instagram?: string | null
          linkedin?: string | null
          redotpay_account?: string | null
          referral_source?: string | null
          status?: string
          tiktok?: string | null
          usdt_address?: string | null
          username?: string | null
        }
        Update: {
          avatar?: string | null
          background?: string | null
          baridimob_rib?: string | null
          bio?: string | null
          birthdate?: string | null
          created_at?: string
          email?: string | null
          fullname?: string | null
          gender?: string | null
          id?: number
          instagram?: string | null
          linkedin?: string | null
          redotpay_account?: string | null
          referral_source?: string | null
          status?: string
          tiktok?: string | null
          usdt_address?: string | null
          username?: string | null
        }
        Relationships: []
      }
      payment_orders: {
        Row: {
          amount: number
          order_id: number
          payment_id: number
        }
        Insert: {
          amount?: number
          order_id: number
          payment_id: number
        }
        Update: {
          amount?: number
          order_id?: number
          payment_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "payment_orders_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_orders_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          code: string
          created_at: string
          id: number
          is_paid: boolean
          note: string | null
          paid_at: string | null
          store_id: number
        }
        Insert: {
          amount?: number
          code: string
          created_at?: string
          id?: number
          is_paid?: boolean
          note?: string | null
          paid_at?: string | null
          store_id?: number
        }
        Update: {
          amount?: number
          code?: string
          created_at?: string
          id?: number
          is_paid?: boolean
          note?: string | null
          paid_at?: string | null
          store_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "payments_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          product_id: number
          url: string
        }
        Insert: {
          product_id?: number
          url: string
        }
        Update: {
          product_id?: number
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_catalog_view"
            referencedColumns: ["id"]
          },
        ]
      }
      product_info: {
        Row: {
          offer_timeout: string | null
          pbd_four: number | null
          pbd_one: number | null
          pbd_three: number | null
          pbd_two: number | null
          price_four: number | null
          price_one: number | null
          price_three: number | null
          price_two: number | null
          product_name: string
        }
        Insert: {
          offer_timeout?: string | null
          pbd_four?: number | null
          pbd_one?: number | null
          pbd_three?: number | null
          pbd_two?: number | null
          price_four?: number | null
          price_one?: number | null
          price_three?: number | null
          price_two?: number | null
          product_name: string
        }
        Update: {
          offer_timeout?: string | null
          pbd_four?: number | null
          pbd_one?: number | null
          pbd_three?: number | null
          pbd_two?: number | null
          price_four?: number | null
          price_one?: number | null
          price_three?: number | null
          price_two?: number | null
          product_name?: string
        }
        Relationships: []
      }
      product_page_assets: {
        Row: {
          file_name: string | null
          id: number
          media_type: string
          product_page_id: number
          url: string
        }
        Insert: {
          file_name?: string | null
          id?: number
          media_type: string
          product_page_id: number
          url: string
        }
        Update: {
          file_name?: string | null
          id?: number
          media_type?: string
          product_page_id?: number
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_page_assets_product_page_id_fkey"
            columns: ["product_page_id"]
            isOneToOne: false
            referencedRelation: "product_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      product_page_images: {
        Row: {
          id: number
          product_page_id: number
          url: string
        }
        Insert: {
          id?: number
          product_page_id: number
          url: string
        }
        Update: {
          id?: number
          product_page_id?: number
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_page_images_product_page_id_fkey"
            columns: ["product_page_id"]
            isOneToOne: false
            referencedRelation: "product_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      product_page_items: {
        Row: {
          display_order: number | null
          item_id: number
          product_page_id: number
        }
        Insert: {
          display_order?: number | null
          item_id: number
          product_page_id: number
        }
        Update: {
          display_order?: number | null
          item_id?: number
          product_page_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_page_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_page_items_product_page_id_fkey"
            columns: ["product_page_id"]
            isOneToOne: false
            referencedRelation: "product_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      product_page_testimonials: {
        Row: {
          created_at: string
          id: number
          product_page_id: number
          url: string
        }
        Insert: {
          created_at?: string
          id?: number
          product_page_id: number
          url: string
        }
        Update: {
          created_at?: string
          id?: number
          product_page_id?: number
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_page_testimonials_product_page_id_fkey"
            columns: ["product_page_id"]
            isOneToOne: false
            referencedRelation: "product_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      product_pages: {
        Row: {
          created_at: string | null
          description: string | null
          headline: string
          hero_media: Json | null
          id: number
          is_active: boolean | null
          is_affiliate_friendly: boolean
          is_freeshipping: boolean
          product_id: number
          promo_point: number
          seo_metadata: Json | null
          slug: string
          subheadline: string | null
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          headline: string
          hero_media?: Json | null
          id?: number
          is_active?: boolean | null
          is_affiliate_friendly?: boolean
          is_freeshipping?: boolean
          product_id: number
          promo_point?: number
          seo_metadata?: Json | null
          slug: string
          subheadline?: string | null
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          headline?: string
          hero_media?: Json | null
          id?: number
          is_active?: boolean | null
          is_affiliate_friendly?: boolean
          is_freeshipping?: boolean
          product_id?: number
          promo_point?: number
          seo_metadata?: Json | null
          slug?: string
          subheadline?: string | null
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_pages_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_pages_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_catalog_view"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: number
          name: string
          retail_commission: number | null
          retail_min_price: number | null
          retail_price: number | null
          retail_price_2: number | null
          retail_price_3: number | null
          store_id: number
          supplier_price: number | null
          thumbnail: string | null
          weight: number | null
          wholesale_commission: number | null
          wholesale_min_price: number | null
          wholesale_price: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: number
          name: string
          retail_commission?: number | null
          retail_min_price?: number | null
          retail_price?: number | null
          retail_price_2?: number | null
          retail_price_3?: number | null
          store_id?: number
          supplier_price?: number | null
          thumbnail?: string | null
          weight?: number | null
          wholesale_commission?: number | null
          wholesale_min_price?: number | null
          wholesale_price?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: number
          name?: string
          retail_commission?: number | null
          retail_min_price?: number | null
          retail_price?: number | null
          retail_price_2?: number | null
          retail_price_3?: number | null
          store_id?: number
          supplier_price?: number | null
          thumbnail?: string | null
          weight?: number | null
          wholesale_commission?: number | null
          wholesale_min_price?: number | null
          wholesale_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      quest_rewards: {
        Row: {
          claimed_at: string | null
          created_at: string | null
          id: string
          partner_quest_id: string
          reward_type: string
          reward_value: number
        }
        Insert: {
          claimed_at?: string | null
          created_at?: string | null
          id?: string
          partner_quest_id: string
          reward_type: string
          reward_value: number
        }
        Update: {
          claimed_at?: string | null
          created_at?: string | null
          id?: string
          partner_quest_id?: string
          reward_type?: string
          reward_value?: number
        }
        Relationships: [
          {
            foreignKeyName: "quest_rewards_partner_quest_id_fkey"
            columns: ["partner_quest_id"]
            isOneToOne: false
            referencedRelation: "partner_quests"
            referencedColumns: ["id"]
          },
        ]
      }
      quest_steps: {
        Row: {
          action_data: Json | null
          action_type: string
          created_at: string | null
          description: string | null
          id: string
          is_required: boolean | null
          order_index: number
          quest_id: string
          step_number: number
          title: string
        }
        Insert: {
          action_data?: Json | null
          action_type: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_required?: boolean | null
          order_index: number
          quest_id: string
          step_number: number
          title: string
        }
        Update: {
          action_data?: Json | null
          action_type?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_required?: boolean | null
          order_index?: number
          quest_id?: string
          step_number?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "quest_steps_quest_id_fkey"
            columns: ["quest_id"]
            isOneToOne: false
            referencedRelation: "quests"
            referencedColumns: ["id"]
          },
        ]
      }
      quests: {
        Row: {
          badge_reward_id: string | null
          created_at: string | null
          description: string
          difficulty: string
          id: string
          is_active: boolean | null
          is_repeatable: boolean | null
          quest_type: string
          requirements: Json | null
          title: string
          updated_at: string | null
          xp_reward: number | null
        }
        Insert: {
          badge_reward_id?: string | null
          created_at?: string | null
          description: string
          difficulty?: string
          id?: string
          is_active?: boolean | null
          is_repeatable?: boolean | null
          quest_type: string
          requirements?: Json | null
          title: string
          updated_at?: string | null
          xp_reward?: number | null
        }
        Update: {
          badge_reward_id?: string | null
          created_at?: string | null
          description?: string
          difficulty?: string
          id?: string
          is_active?: boolean | null
          is_repeatable?: boolean | null
          quest_type?: string
          requirements?: Json | null
          title?: string
          updated_at?: string | null
          xp_reward?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "quests_badge_reward_id_fkey"
            columns: ["badge_reward_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
      return_orders: {
        Row: {
          order_id: number
          return_id: number
        }
        Insert: {
          order_id: number
          return_id: number
        }
        Update: {
          order_id?: number
          return_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "return_orders_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "return_orders_return_id_fkey"
            columns: ["return_id"]
            isOneToOne: false
            referencedRelation: "returns"
            referencedColumns: ["id"]
          },
        ]
      }
      returns: {
        Row: {
          code: string
          created_at: string
          id: number
          modified_at: string
          status: string
          store_id: number
        }
        Insert: {
          code: string
          created_at?: string
          id?: number
          modified_at?: string
          status?: string
          store_id?: number
        }
        Update: {
          code?: string
          created_at?: string
          id?: number
          modified_at?: string
          status?: string
          store_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "returns_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      rewards: {
        Row: {
          amount: number | null
          date: string
          user_id: number
        }
        Insert: {
          amount?: number | null
          date: string
          user_id: number
        }
        Update: {
          amount?: number | null
          date?: string
          user_id?: number
        }
        Relationships: []
      }
      settings: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          key: string
          updated_at: string | null
          value: string | null
        }
        Insert: {
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          key: string
          updated_at?: string | null
          value?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          key?: string
          updated_at?: string | null
          value?: string | null
        }
        Relationships: []
      }
      status: {
        Row: {
          comment: string | null
          created_at: string | null
          id: number
          order_id: number | null
          reason: string | null
          status: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          id?: number
          order_id?: number | null
          reason?: string | null
          status?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          id?: number
          order_id?: number | null
          reason?: string | null
          status?: string | null
        }
        Relationships: []
      }
      store_assignments: {
        Row: {
          created_at: string
          email: string
          id: number
          store_id: number
        }
        Insert: {
          created_at?: string
          email: string
          id?: number
          store_id: number
        }
        Update: {
          created_at?: string
          email?: string
          id?: number
          store_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "store_assignments_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      stores: {
        Row: {
          avatar: string | null
          created_at: string
          email: string | null
          fullname: string | null
          id: number
          status: string
          username: string | null
        }
        Insert: {
          avatar?: string | null
          created_at?: string
          email?: string | null
          fullname?: string | null
          id?: number
          status?: string
          username?: string | null
        }
        Update: {
          avatar?: string | null
          created_at?: string
          email?: string | null
          fullname?: string | null
          id?: number
          status?: string
          username?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          dob: string | null
          email: string
          gender: string | null
          id: number
          is_active: boolean
          name: string | null
          phone: string | null
          role: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          dob?: string | null
          email: string
          gender?: string | null
          id?: number
          is_active?: boolean
          name?: string | null
          phone?: string | null
          role?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          dob?: string | null
          email?: string
          gender?: string | null
          id?: number
          is_active?: boolean
          name?: string | null
          phone?: string | null
          role?: string
        }
        Relationships: []
      }
      val: {
        Row: {
          value: number
        }
        Insert: {
          value: number
        }
        Update: {
          value?: number
        }
        Relationships: []
      }
      valstr: {
        Row: {
          val: string
        }
        Insert: {
          val: string
        }
        Update: {
          val?: string
        }
        Relationships: []
      }
      video_milestones: {
        Row: {
          id: string
          milestone: number
          reached_at: string | null
          video_progress_id: string
          xp_awarded: number | null
        }
        Insert: {
          id?: string
          milestone: number
          reached_at?: string | null
          video_progress_id: string
          xp_awarded?: number | null
        }
        Update: {
          id?: string
          milestone?: number
          reached_at?: string | null
          video_progress_id?: string
          xp_awarded?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "video_milestones_video_progress_id_fkey"
            columns: ["video_progress_id"]
            isOneToOne: false
            referencedRelation: "video_progress"
            referencedColumns: ["id"]
          },
        ]
      }
      video_progress: {
        Row: {
          completion_percentage: number | null
          course_id: string
          created_at: string | null
          id: string
          is_completed: boolean | null
          last_watched_at: string | null
          partner_id: number
          total_duration_seconds: number
          updated_at: string | null
          video_id: string
          watch_time_seconds: number | null
        }
        Insert: {
          completion_percentage?: number | null
          course_id: string
          created_at?: string | null
          id?: string
          is_completed?: boolean | null
          last_watched_at?: string | null
          partner_id: number
          total_duration_seconds: number
          updated_at?: string | null
          video_id: string
          watch_time_seconds?: number | null
        }
        Update: {
          completion_percentage?: number | null
          course_id?: string
          created_at?: string | null
          id?: string
          is_completed?: boolean | null
          last_watched_at?: string | null
          partner_id?: number
          total_duration_seconds?: number
          updated_at?: string | null
          video_id?: string
          watch_time_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "video_progress_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_progress_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_progress_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "course_videos"
            referencedColumns: ["id"]
          },
        ]
      }
      withdraws: {
        Row: {
          amount: number
          created_at: string
          id: number
          is_paid: boolean
          partner_id: number
          status: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: number
          is_paid?: boolean
          partner_id: number
          status?: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: number
          is_paid?: boolean
          partner_id?: number
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "withdraws_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      xp_events: {
        Row: {
          created_at: string | null
          description: string | null
          event_type: string
          id: string
          metadata: Json | null
          multiplier: number | null
          partner_id: number
          total_xp_earned: number
          xp_amount: number
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          multiplier?: number | null
          partner_id: number
          total_xp_earned: number
          xp_amount: number
        }
        Update: {
          created_at?: string | null
          description?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          multiplier?: number | null
          partner_id?: number
          total_xp_earned?: number
          xp_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "xp_events_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      product_inventory_phase_details: {
        Row: {
          color: string | null
          color_hex: string | null
          phase: string | null
          product_id: number | null
          product_name: string | null
          size: string | null
          units: number | null
        }
        Relationships: [
          {
            foreignKeyName: "items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_catalog_view"
            referencedColumns: ["id"]
          },
        ]
      }
      product_inventory_phases: {
        Row: {
          delivered: number | null
          in_delivery: number | null
          in_stock: number | null
          ordered: number | null
          product_id: number | null
        }
        Relationships: [
          {
            foreignKeyName: "items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_catalog_view"
            referencedColumns: ["id"]
          },
        ]
      }
      products_catalog_view: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: number | null
          name: string | null
          price: number | null
          primary_image: string | null
          total_stock: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      award_video_milestone_xp: {
        Args: { p_milestone: number; p_partner_id: number; p_video_id: string }
        Returns: number
      }
      bulk_update_product_inventory: {
        Args: { adjustments_in: Json; product_id_in: number }
        Returns: undefined
      }
      calculate_course_progress: {
        Args: { p_course_id: string; p_partner_id: number }
        Returns: number
      }
      check_and_unlock_bonuses: {
        Args: { new_total_xp: number; partner_id_param: number }
        Returns: {
          bonus_amount: number
          bonus_id: string
          status: string
        }[]
      }
      claim_bonus: { Args: { bonus_id_param: string }; Returns: boolean }
      create_signup_bonus_for_partner: {
        Args: { partner_id_param: number }
        Returns: string
      }
      decrement:
        | {
            Args: { color: string; name: string; size: string }
            Returns: undefined
          }
        | { Args: { row_id: number }; Returns: undefined }
      decrement_inventory: {
        Args: { item_id_in: number; qty_in: number }
        Returns: undefined
      }
      decrement_product: {
        Args: { color: string; name: string; qty: number; size: string }
        Returns: undefined
      }
      decrement_qty:
        | {
            Args: { color: string; name: string; size: string }
            Returns: undefined
          }
        | {
            Args: { color: string; name: string; qty: number; size: string }
            Returns: undefined
          }
      decrement_stock: {
        Args: {
          color_in: string
          name_in: string
          qty_in: number
          size_in: string
        }
        Returns: undefined
      }
      get_active_rewards: {
        Args: { agent_in: number; date_in: string }
        Returns: {
          value: number
        }[]
        SetofOptions: {
          from: "*"
          to: "val"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_active_rewards_all: {
        Args: { date_in: string }
        Returns: {
          value: number
        }[]
        SetofOptions: {
          from: "*"
          to: "val"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_active_rewards_range: {
        Args: { agent_in: number; date_in: string; date_out: string }
        Returns: {
          value: number
        }[]
        SetofOptions: {
          from: "*"
          to: "val"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_agents:
        | {
            Args: never
            Returns: {
              key: number
              value: number | null
            }[]
            SetofOptions: {
              from: "*"
              to: "keyval"
              isOneToOne: false
              isSetofReturn: true
            }
          }
        | {
            Args: { state: string }
            Returns: {
              key: number
              value: number | null
            }[]
            SetofOptions: {
              from: "*"
              to: "keyval"
              isOneToOne: false
              isSetofReturn: true
            }
          }
      get_all_leads_by_agent_with_date_range:
        | {
            Args: { date1: string; date2: string }
            Returns: {
              address: string | null
              agent_id: number | null
              channel: string | null
              color: string | null
              comment: string | null
              commune: string | null
              created_at: string | null
              first_name: string | null
              has_recourse: boolean | null
              id: number
              is_abondoned: boolean | null
              is_moved: boolean | null
              is_wholesale: boolean | null
              last_changed_status: string | null
              last_name: string | null
              objective: string | null
              offer: string | null
              partner_id: number | null
              phone: string | null
              price: string | null
              product: string | null
              size: string | null
              status: string | null
              wilaya: string | null
            }[]
            SetofOptions: {
              from: "*"
              to: "leads"
              isOneToOne: false
              isSetofReturn: true
            }
          }
        | {
            Args: { date1: string; date2: string; objective_in: string }
            Returns: {
              address: string | null
              agent_id: number | null
              channel: string | null
              color: string | null
              comment: string | null
              commune: string | null
              created_at: string | null
              first_name: string | null
              has_recourse: boolean | null
              id: number
              is_abondoned: boolean | null
              is_moved: boolean | null
              is_wholesale: boolean | null
              last_changed_status: string | null
              last_name: string | null
              objective: string | null
              offer: string | null
              partner_id: number | null
              phone: string | null
              price: string | null
              product: string | null
              size: string | null
              status: string | null
              wilaya: string | null
            }[]
            SetofOptions: {
              from: "*"
              to: "leads"
              isOneToOne: false
              isSetofReturn: true
            }
          }
      get_all_products: {
        Args: never
        Returns: {
          val: string
        }[]
        SetofOptions: {
          from: "*"
          to: "valstr"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_aov_by_agent: {
        Args: never
        Returns: {
          key: number
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyval"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_aov_by_agent_with_date_range: {
        Args: { date1: string; date2: string }
        Returns: {
          key: number
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyval"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_attempts: {
        Args: never
        Returns: {
          key: number
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyval"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_available_colors_in_product: {
        Args: { product_in: string }
        Returns: {
          key: string
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyvalstr"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_available_products: {
        Args: never
        Returns: {
          key: string
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyvalstr"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_available_sizes_in_product:
        | {
            Args: { product_in: string }
            Returns: {
              key: string
              value: number | null
            }[]
            SetofOptions: {
              from: "*"
              to: "keyvalstr"
              isOneToOne: false
              isSetofReturn: true
            }
          }
        | {
            Args: { color_in: string; product_in: string }
            Returns: {
              key: string
              value: number | null
            }[]
            SetofOptions: {
              from: "*"
              to: "keyvalstr"
              isOneToOne: false
              isSetofReturn: true
            }
          }
      get_average_price: {
        Args: never
        Returns: {
          key: string
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyvalstr"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_calls_by_agent: {
        Args: never
        Returns: {
          key: string
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyvalstr"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_calls_today: {
        Args: never
        Returns: {
          value: number
        }[]
        SetofOptions: {
          from: "*"
          to: "val"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_charges: {
        Args: never
        Returns: {
          value: number
        }[]
        SetofOptions: {
          from: "*"
          to: "val"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_confirmed_count_by_agent:
        | {
            Args: never
            Returns: {
              key: number
              value: number | null
            }[]
            SetofOptions: {
              from: "*"
              to: "keyval"
              isOneToOne: false
              isSetofReturn: true
            }
          }
        | {
            Args: { objective_in: string }
            Returns: {
              key: number
              value: number | null
            }[]
            SetofOptions: {
              from: "*"
              to: "keyval"
              isOneToOne: false
              isSetofReturn: true
            }
          }
      get_confirmed_count_by_agent_size: {
        Args: never
        Returns: {
          key: string
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyvalstr"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_confirmed_count_by_agent_with_date_range:
        | {
            Args: { date1: string; date2: string }
            Returns: {
              key: number
              value: number | null
            }[]
            SetofOptions: {
              from: "*"
              to: "keyval"
              isOneToOne: false
              isSetofReturn: true
            }
          }
        | {
            Args: { date1: string; date2: string; objective_in: string }
            Returns: {
              key: number
              value: number | null
            }[]
            SetofOptions: {
              from: "*"
              to: "keyval"
              isOneToOne: false
              isSetofReturn: true
            }
          }
      get_confirmed_count_by_agent_with_objectivefilter: {
        Args: { objective_in: string }
        Returns: {
          key: number
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyval"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_confirmed_count_by_agent_with_objectivefilter_with_date_ran: {
        Args: { date1: string; date2: string; objective_in: string }
        Returns: {
          key: number
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyval"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_confirmed_count_by_agent_with_objf: {
        Args: { objective_in: string }
        Returns: {
          key: number
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyval"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_confirmed_count_by_agent_with_objf_with_date_range: {
        Args: { date1: string; date2: string; objective_in: string }
        Returns: {
          key: number
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyval"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_confirmed_count_by_channel_with_objectivefilter: {
        Args: { objective_in: string }
        Returns: {
          key: string
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyvalstr"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_confirmed_count_by_channel_with_objectivefilter_with_date_r: {
        Args: { date1: string; date2: string; objective_in: string }
        Returns: {
          key: string
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyvalstr"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_confirmed_count_by_channel_with_objf: {
        Args: { objective_in: string }
        Returns: {
          key: string
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyvalstr"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_confirmed_count_by_channel_with_objf_with_date_range: {
        Args: { date1: string; date2: string; objective_in: string }
        Returns: {
          key: string
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyvalstr"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_confirmed_count_by_product:
        | {
            Args: never
            Returns: {
              key: string
              value: number | null
            }[]
            SetofOptions: {
              from: "*"
              to: "keyvalstr"
              isOneToOne: false
              isSetofReturn: true
            }
          }
        | {
            Args: { objective_in: string }
            Returns: {
              key: string
              value: number | null
            }[]
            SetofOptions: {
              from: "*"
              to: "keyvalstr"
              isOneToOne: false
              isSetofReturn: true
            }
          }
      get_confirmed_count_by_product_with_date_range:
        | {
            Args: { date1: string; date2: string }
            Returns: {
              key: string
              value: number | null
            }[]
            SetofOptions: {
              from: "*"
              to: "keyvalstr"
              isOneToOne: false
              isSetofReturn: true
            }
          }
        | {
            Args: { date1: string; date2: string; objective_in: string }
            Returns: {
              key: string
              value: number | null
            }[]
            SetofOptions: {
              from: "*"
              to: "keyvalstr"
              isOneToOne: false
              isSetofReturn: true
            }
          }
      get_confirmed_count_by_product_with_objectivefilter: {
        Args: { objective_in: string }
        Returns: {
          key: string
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyvalstr"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_confirmed_count_by_product_with_objectivefilter_with_date_r: {
        Args: { date1: string; date2: string; objective_in: string }
        Returns: {
          key: string
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyvalstr"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_confirmed_count_by_product_with_objf: {
        Args: { objective_in: string }
        Returns: {
          key: string
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyvalstr"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_confirmed_count_by_product_with_objf_with_date_range: {
        Args: { date1: string; date2: string; objective_in: string }
        Returns: {
          key: string
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyvalstr"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_delivered_count_by_agent: {
        Args: never
        Returns: {
          key: number
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyval"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_delivered_count_by_agent_lina: {
        Args: never
        Returns: {
          key: number
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyval"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_delivered_count_by_agent_with_date_range: {
        Args: { date1: string; date2: string }
        Returns: {
          key: number
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyval"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_delivered_count_by_agent_with_objectivefilter: {
        Args: { objective_in: string }
        Returns: {
          key: number
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyval"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_delivered_count_by_agent_with_objectivefilter_with_date_ran: {
        Args: { date1: string; date2: string; objective_in: string }
        Returns: {
          key: number
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyval"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_delivered_count_by_agent_with_objf: {
        Args: { objective_in: string }
        Returns: {
          key: number
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyval"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_delivered_count_by_agent_with_objf_with_date_range: {
        Args: { date1: string; date2: string; objective_in: string }
        Returns: {
          key: number
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyval"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_delivered_count_by_channel_with_objectivefilter: {
        Args: { objective_in: string }
        Returns: {
          key: string
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyvalstr"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_delivered_count_by_channel_with_objectivefilter_with_date_r: {
        Args: { date1: string; date2: string; objective_in: string }
        Returns: {
          key: string
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyvalstr"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_delivered_count_by_channel_with_objf: {
        Args: { objective_in: string }
        Returns: {
          key: string
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyvalstr"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_delivered_count_by_channel_with_objf_with_date_range: {
        Args: { date1: string; date2: string; objective_in: string }
        Returns: {
          key: string
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyvalstr"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_delivered_count_by_product: {
        Args: never
        Returns: {
          key: string
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyvalstr"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_delivered_count_by_product_by_deliverytype_with_date_range: {
        Args: { date1: string; date2: string }
        Returns: {
          key: string
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyvalstr"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_delivered_count_by_product_with_date_range: {
        Args: { date1: string; date2: string }
        Returns: {
          key: string
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyvalstr"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_delivered_count_by_product_with_objectivefilter: {
        Args: { objective_in: string }
        Returns: {
          key: string
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyvalstr"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_delivered_count_by_product_with_objectivefilter_with_date_r: {
        Args: { date1: string; date2: string; objective_in: string }
        Returns: {
          key: string
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyvalstr"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_delivered_count_by_product_with_objf: {
        Args: { objective_in: string }
        Returns: {
          key: string
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyvalstr"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_delivered_count_by_product_with_objf_with_date_range: {
        Args: { date1: string; date2: string; objective_in: string }
        Returns: {
          key: string
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyvalstr"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_delivered_count_by_tracker: {
        Args: never
        Returns: {
          key: number
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyval"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_delivered_count_by_tracker_with_date_range: {
        Args: { date1: string; date2: string }
        Returns: {
          key: number
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyval"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_delivered_count_by_wilaya: {
        Args: never
        Returns: {
          key: string
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyvalstr"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_delivered_count_by_wilaya_with_date_range: {
        Args: { date1: string; date2: string }
        Returns: {
          key: string
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyvalstr"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_delivered_orders_by_agent_by_date:
        | {
            Args: { date_in: string }
            Returns: {
              key: string
              value: number | null
            }[]
            SetofOptions: {
              from: "*"
              to: "keyvalstr"
              isOneToOne: false
              isSetofReturn: true
            }
          }
        | {
            Args: { agent: number; date_in: string }
            Returns: {
              key: string
              value: number | null
            }[]
            SetofOptions: {
              from: "*"
              to: "keyvalstr"
              isOneToOne: false
              isSetofReturn: true
            }
          }
      get_expenses_by_date: {
        Args: { date1: string; date2: string }
        Returns: {
          value: number
        }[]
        SetofOptions: {
          from: "*"
          to: "val"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_failures_by_reason: {
        Args: never
        Returns: {
          key: string
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyvalstr"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_failures_by_reason_by_agent: {
        Args: never
        Returns: {
          count: number | null
          key: number
          val: string
        }[]
        SetofOptions: {
          from: "*"
          to: "keyvalcount"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_items_count: {
        Args: never
        Returns: {
          key: number
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyval"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_items_inventory:
        | {
            Args: never
            Returns: {
              color: string | null
              id: number
              product: string | null
              quantity: number | null
              size: string | null
              thumbnail: string | null
            }[]
            SetofOptions: {
              from: "*"
              to: "items_inventorys"
              isOneToOne: false
              isSetofReturn: true
            }
          }
        | {
            Args: { product: string }
            Returns: {
              color: string | null
              id: number
              product: string | null
              quantity: number | null
              size: string | null
              thumbnail: string | null
            }[]
            SetofOptions: {
              from: "*"
              to: "items_inventorys"
              isOneToOne: false
              isSetofReturn: true
            }
          }
      get_items_inventory_by_product: {
        Args: { product_in: string }
        Returns: {
          color: string | null
          id: number
          product: string | null
          quantity: number | null
          size: string | null
          thumbnail: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "items_inventorys"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_items_inventory_with_product_filter: {
        Args: { product_in: string }
        Returns: {
          color: string | null
          id: number
          product: string | null
          quantity: number | null
          size: string | null
          thumbnail: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "items_inventorys"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_items_inventory4: {
        Args: never
        Returns: {
          color: string | null
          id: number
          product: string
          quantity: number | null
          size: string | null
          thumbnail: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "items_inventory"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_items_stock: {
        Args: never
        Returns: {
          color: string | null
          id: number
          product: string
          quantity: number | null
          size: string | null
          thumbnail: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "items_inventory"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_items_stock_by_product: {
        Args: { product_in: string }
        Returns: {
          color: string | null
          product: string
          quantity: number | null
          size: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "item_inv_landing_page"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_items_stock_with_product_filter: {
        Args: { product_in: string }
        Returns: {
          color: string | null
          id: number
          product: string
          quantity: number | null
          size: string | null
          thumbnail: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "items_inventory"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_ld: {
        Args: never
        Returns: {
          key: number
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyval"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_lds:
        | {
            Args: never
            Returns: {
              key: string
              value: number | null
            }[]
            SetofOptions: {
              from: "*"
              to: "keyvalstr"
              isOneToOne: false
              isSetofReturn: true
            }
          }
        | {
            Args: { date1: string; date2: string }
            Returns: {
              key: string
              value: number | null
            }[]
            SetofOptions: {
              from: "*"
              to: "keyvalstr"
              isOneToOne: false
              isSetofReturn: true
            }
          }
      get_lead_summary: {
        Args: { p_partner_id?: number }
        Returns: {
          total_confirmed: number
          total_leads: number
          total_pending: number
          total_wholesale: number
        }[]
      }
      get_leads_by_agent:
        | {
            Args: never
            Returns: {
              key: number
              value: number | null
            }[]
            SetofOptions: {
              from: "*"
              to: "keyval"
              isOneToOne: false
              isSetofReturn: true
            }
          }
        | {
            Args: { objective_in: string }
            Returns: {
              key: number
              value: number | null
            }[]
            SetofOptions: {
              from: "*"
              to: "keyval"
              isOneToOne: false
              isSetofReturn: true
            }
          }
      get_leads_by_agent_with_date_range:
        | {
            Args: never
            Returns: {
              key: number
              value: number | null
            }[]
            SetofOptions: {
              from: "*"
              to: "keyval"
              isOneToOne: false
              isSetofReturn: true
            }
          }
        | {
            Args: { date1: string; date2: string }
            Returns: {
              key: number
              value: number | null
            }[]
            SetofOptions: {
              from: "*"
              to: "keyval"
              isOneToOne: false
              isSetofReturn: true
            }
          }
        | {
            Args: { date1: string; date2: string; objective_in: string }
            Returns: {
              key: number
              value: number | null
            }[]
            SetofOptions: {
              from: "*"
              to: "keyval"
              isOneToOne: false
              isSetofReturn: true
            }
          }
      get_leads_by_agent_with_objective_filter: {
        Args: { objective_in: string }
        Returns: {
          key: number
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyval"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_leads_by_agent_with_objective_filter_with_date_range: {
        Args: { date1: string; date2: string; objective_in: string }
        Returns: {
          key: number
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyval"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_leads_by_agent_with_objectivefilter: {
        Args: { objective_in: string }
        Returns: {
          key: number
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyval"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_leads_by_agent_with_objectivefilter_with_date_range: {
        Args: { date1: string; date2: string; objective_in: string }
        Returns: {
          key: number
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyval"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_leads_by_agent_with_objf: {
        Args: { objective_in: string }
        Returns: {
          key: number
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyval"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_leads_by_agent_with_objf_with_date_range: {
        Args: { date1: string; date2: string; objective_in: string }
        Returns: {
          key: number
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyval"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_leads_by_channel:
        | {
            Args: never
            Returns: {
              key: string
              value: number | null
            }[]
            SetofOptions: {
              from: "*"
              to: "keyvalstr"
              isOneToOne: false
              isSetofReturn: true
            }
          }
        | {
            Args: { objective_in: string }
            Returns: {
              key: string
              value: number | null
            }[]
            SetofOptions: {
              from: "*"
              to: "keyvalstr"
              isOneToOne: false
              isSetofReturn: true
            }
          }
      get_leads_by_channel_with_date_range:
        | {
            Args: { date1: string; date2: string }
            Returns: {
              key: string
              value: number | null
            }[]
            SetofOptions: {
              from: "*"
              to: "keyvalstr"
              isOneToOne: false
              isSetofReturn: true
            }
          }
        | {
            Args: { date1: string; date2: string; objective_in: string }
            Returns: {
              key: string
              value: number | null
            }[]
            SetofOptions: {
              from: "*"
              to: "keyvalstr"
              isOneToOne: false
              isSetofReturn: true
            }
          }
      get_leads_by_channel_with_objectivefilter: {
        Args: { objective_in: string }
        Returns: {
          key: string
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyvalstr"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_leads_by_channel_with_objectivefilter_with_date_range: {
        Args: { date1: string; date2: string; objective_in: string }
        Returns: {
          key: string
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyvalstr"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_leads_by_channel_with_objf: {
        Args: { objective_in: string }
        Returns: {
          key: string
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyvalstr"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_leads_by_channel_with_objf_with_date_range: {
        Args: { date1: string; date2: string; objective_in: string }
        Returns: {
          key: string
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyvalstr"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_leads_by_comment: {
        Args: never
        Returns: {
          key: string
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyvalstr"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_leads_by_date: {
        Args: never
        Returns: {
          key: number
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyval"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_leads_by_hour: {
        Args: never
        Returns: {
          key: string
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyvalstr"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_leads_by_objective: {
        Args: never
        Returns: {
          key: string
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyvalstr"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_leads_by_objective_with_date_range: {
        Args: { date1: string; date2: string }
        Returns: {
          key: string
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyvalstr"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_leads_by_product:
        | {
            Args: never
            Returns: {
              key: string
              value: number | null
            }[]
            SetofOptions: {
              from: "*"
              to: "keyvalstr"
              isOneToOne: false
              isSetofReturn: true
            }
          }
        | {
            Args: { objective_in: string }
            Returns: {
              key: string
              value: number | null
            }[]
            SetofOptions: {
              from: "*"
              to: "keyvalstr"
              isOneToOne: false
              isSetofReturn: true
            }
          }
      get_leads_by_product_with_date_range:
        | {
            Args: { date1: string; date2: string }
            Returns: {
              key: string
              value: number | null
            }[]
            SetofOptions: {
              from: "*"
              to: "keyvalstr"
              isOneToOne: false
              isSetofReturn: true
            }
          }
        | {
            Args: { date1: string; date2: string; objective_in: string }
            Returns: {
              key: string
              value: number | null
            }[]
            SetofOptions: {
              from: "*"
              to: "keyvalstr"
              isOneToOne: false
              isSetofReturn: true
            }
          }
      get_leads_by_product_with_objectivefilter: {
        Args: { objective_in: string }
        Returns: {
          key: string
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyvalstr"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_leads_by_product_with_objectivefilter_with_date_range: {
        Args: { date1: string; date2: string; objective_in: string }
        Returns: {
          key: string
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyvalstr"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_leads_by_product_with_objf: {
        Args: { objective_in: string }
        Returns: {
          key: string
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyvalstr"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_leads_by_product_with_objf_with_date_range: {
        Args: { date1: string; date2: string; objective_in: string }
        Returns: {
          key: string
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyvalstr"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_leads_by_size_os: {
        Args: never
        Returns: {
          key: string
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyvalstr"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_leads_by_status: {
        Args: never
        Returns: {
          key: string
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyvalstr"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_leads_by_status_by_agent: {
        Args: { agent_in: number; date1: string; date2: string }
        Returns: {
          key: string
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyvalstr"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_logs_by_agent:
        | {
            Args: { agent: string }
            Returns: {
              action: string | null
              attempt: number | null
              created_at: string | null
              delivery_company: string | null
              entity: string | null
              id: number
              last_status: string | null
              number: string | null
              user_fullname: string | null
            }[]
            SetofOptions: {
              from: "*"
              to: "logs"
              isOneToOne: false
              isSetofReturn: true
            }
          }
        | {
            Args: { act: string; agent: string }
            Returns: {
              action: string | null
              attempt: number | null
              created_at: string | null
              delivery_company: string | null
              entity: string | null
              id: number
              last_status: string | null
              number: string | null
              user_fullname: string | null
            }[]
            SetofOptions: {
              from: "*"
              to: "logs"
              isOneToOne: false
              isSetofReturn: true
            }
          }
      get_message_orders_by_agent:
        | {
            Args: never
            Returns: {
              key: number
              value: number | null
            }[]
            SetofOptions: {
              from: "*"
              to: "keyval"
              isOneToOne: false
              isSetofReturn: true
            }
          }
        | {
            Args: { today: string }
            Returns: {
              key: number
              value: number | null
            }[]
            SetofOptions: {
              from: "*"
              to: "keyval"
              isOneToOne: false
              isSetofReturn: true
            }
          }
        | {
            Args: { agent: number; today: string }
            Returns: {
              key: number
              value: number | null
            }[]
            SetofOptions: {
              from: "*"
              to: "keyval"
              isOneToOne: false
              isSetofReturn: true
            }
          }
      get_missed_by_reason: {
        Args: never
        Returns: {
          key: string
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyvalstr"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_nr_by_agent_with_date_range: {
        Args: { date1: string; date2: string }
        Returns: {
          key: number
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyval"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_number_confirmed_leads_last_week: {
        Args: { date1: string; date2: string }
        Returns: {
          key: string
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyvalstr"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_number_leads_last_week: {
        Args: { date1: string; date2: string }
        Returns: {
          key: string
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyvalstr"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_number_of_units_sold:
        | {
            Args: never
            Returns: {
              key: string
              value: number | null
            }[]
            SetofOptions: {
              from: "*"
              to: "keyvalstr"
              isOneToOne: false
              isSetofReturn: true
            }
          }
        | {
            Args: { date1: string; date2: string }
            Returns: {
              key: string
              value: number | null
            }[]
            SetofOptions: {
              from: "*"
              to: "keyvalstr"
              isOneToOne: false
              isSetofReturn: true
            }
          }
      get_number_of_units_sold_by_daterange: {
        Args: { date1: string; date2: string }
        Returns: {
          key: string
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyvalstr"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_number_of_units_sold_with_date_range: {
        Args: { date1: string; date2: string }
        Returns: {
          key: string
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyvalstr"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_number_orders_by_wilaya: {
        Args: never
        Returns: {
          key: string
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyvalstr"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_number_orders_last_week: {
        Args: { date1: string; date2: string }
        Returns: {
          key: string
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyvalstr"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_number_units: {
        Args: never
        Returns: {
          key: string
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyvalstr"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_number_units_added: {
        Args: never
        Returns: {
          key: string
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyvalstr"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_number_units_sold:
        | {
            Args: never
            Returns: {
              key: string
              value: number | null
            }[]
            SetofOptions: {
              from: "*"
              to: "keyvalstr"
              isOneToOne: false
              isSetofReturn: true
            }
          }
        | {
            Args: { date1: string; date2: string }
            Returns: {
              key: string
              value: number | null
            }[]
            SetofOptions: {
              from: "*"
              to: "keyvalstr"
              isOneToOne: false
              isSetofReturn: true
            }
          }
      get_number_units_sold_wholesale: {
        Args: never
        Returns: {
          key: string
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyvalstr"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_number_units_sold2: {
        Args: never
        Returns: {
          key: string
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyvalstr"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_number_units_sold3: {
        Args: never
        Returns: {
          key: string
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyvalstr"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_order_count_by_product_by_deliverytype_with_date_range: {
        Args: { date1: string; date2: string }
        Returns: {
          key: string
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyvalstr"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_order_summary: {
        Args: { p_partner_id?: number }
        Returns: {
          total_delivered: number
          total_orders: number
          total_processing: number
          total_value: number
        }[]
      }
      get_ordered_items: {
        Args: never
        Returns: {
          key: number
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyval"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_orders_by_agent: {
        Args: never
        Returns: {
          key: number
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyval"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_orders_by_agent_with_date_range: {
        Args: { date1: string; date2: string }
        Returns: {
          key: number
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyval"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_orders_by_agent_with_objective_filter: {
        Args: { objective_in: string }
        Returns: {
          key: number
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyval"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_orders_by_agent_with_objective_filter_with_date_range: {
        Args: { date1: string; date2: string; objective_in: string }
        Returns: {
          key: number
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyval"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_orders_by_agent_with_objectivefilter: {
        Args: { objective_in: string }
        Returns: {
          key: number
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyval"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_orders_by_agent_with_objectivefilter_with_date_range: {
        Args: { date1: string; date2: string; objective_in: string }
        Returns: {
          key: number
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyval"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_orders_by_agent_with_objf: {
        Args: { objective_in: string }
        Returns: {
          key: number
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyval"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_orders_by_agent_with_objf_with_date_range: {
        Args: { date1: string; date2: string; objective_in: string }
        Returns: {
          key: number
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyval"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_orders_by_channel: {
        Args: never
        Returns: {
          key: string
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyvalstr"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_orders_by_channel_with_date_range: {
        Args: { date1: string; date2: string }
        Returns: {
          key: string
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyvalstr"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_orders_by_channel_with_objectivefilter: {
        Args: { objective_in: string }
        Returns: {
          key: string
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyvalstr"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_orders_by_channel_with_objectivefilter_with_date_range: {
        Args: { date1: string; date2: string; objective_in: string }
        Returns: {
          key: string
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyvalstr"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_orders_by_channel_with_objf: {
        Args: { objective_in: string }
        Returns: {
          key: string
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyvalstr"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_orders_by_channel_with_objf_with_date_range: {
        Args: { date1: string; date2: string; objective_in: string }
        Returns: {
          key: string
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyvalstr"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_orders_by_color: {
        Args: never
        Returns: {
          key: string
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyvalstr"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_orders_by_comment: {
        Args: never
        Returns: {
          key: string
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyvalstr"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_orders_by_item: {
        Args: never
        Returns: {
          key: string
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyvalstr"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_orders_by_objective: {
        Args: never
        Returns: {
          key: string
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyvalstr"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_orders_by_objective_with_date_range: {
        Args: { date1: string; date2: string }
        Returns: {
          key: string
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyvalstr"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_orders_by_product: {
        Args: never
        Returns: {
          key: string
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyvalstr"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_orders_by_product_with_date_range: {
        Args: { date1: string; date2: string }
        Returns: {
          key: string
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyvalstr"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_orders_by_product_with_objectivefilter: {
        Args: { objective_in: string }
        Returns: {
          key: string
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyvalstr"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_orders_by_product_with_objectivefilter_with_date_range: {
        Args: { date1: string; date2: string; objective_in: string }
        Returns: {
          key: string
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyvalstr"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_orders_by_product_with_objf: {
        Args: { objective_in: string }
        Returns: {
          key: string
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyvalstr"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_orders_by_product_with_objf_with_date_range: {
        Args: { date1: string; date2: string; objective_in: string }
        Returns: {
          key: string
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyvalstr"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_orders_by_status: {
        Args: never
        Returns: {
          key: string
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyvalstr"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_orders_by_tracker: {
        Args: never
        Returns: {
          key: number
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyval"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_orders_by_tracker_with_date_range: {
        Args: { date1: string; date2: string }
        Returns: {
          key: number
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyval"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_orders_by_wilaya:
        | {
            Args: never
            Returns: {
              key: string
              value: number | null
            }[]
            SetofOptions: {
              from: "*"
              to: "keyvalstr"
              isOneToOne: false
              isSetofReturn: true
            }
          }
        | {
            Args: { wilaya_in: string }
            Returns: {
              key: string
              value: number | null
            }[]
            SetofOptions: {
              from: "*"
              to: "keyvalstr"
              isOneToOne: false
              isSetofReturn: true
            }
          }
      get_orders_by_wilaya_in: {
        Args: { wilaya_in: string }
        Returns: {
          address: string | null
          agent_id: number | null
          attempt: number | null
          channel: string | null
          comment: string | null
          commune: string | null
          created_at: string | null
          dc_recent_status: string | null
          delivery_attempt: number | null
          delivery_company: string | null
          delivery_fees: number | null
          delivery_notes: number | null
          first_name: string | null
          followedup_at: string | null
          followup_status: string | null
          followups: number | null
          has_claim: boolean
          has_defect: boolean
          has_exchange: boolean | null
          id: number
          is_auto_delivered: boolean
          is_exchange: boolean | null
          is_exchange_required: boolean
          is_free_shipping: boolean | null
          is_stopdesk: boolean | null
          is_supplier_paid: boolean
          is_wholesale: boolean | null
          last_name: string | null
          modified_at: string | null
          objective: string | null
          parcel_id: string | null
          partner_id: number | null
          phone: string | null
          phone2: string | null
          product: string | null
          product_color: string | null
          product_price: number | null
          product_qty: number
          product_size: string | null
          return_processed: boolean
          shipping_price: number | null
          status: string | null
          stopdesk: string | null
          store_id: number
          swap_count: number | null
          tracker_id: number | null
          tracking_id: string | null
          wilaya: string | null
          yalidine_status: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "orders"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_orders_by_wilaya_with_date_range: {
        Args: { date1: string; date2: string }
        Returns: {
          key: string
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyvalstr"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_orders_by_yalidine_status_by_date: {
        Args: { date_in: string; tracker_in: number }
        Returns: {
          key: string
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyvalstr"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_prod_count: {
        Args: never
        Returns: {
          key: string
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyvalstr"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_product_phase_details: {
        Args: { phase_in: string; product_id_in: number }
        Returns: {
          color: string
          color_hex: string
          size: string
          units: number
        }[]
      }
      get_product_phase_summary: {
        Args: { product_id_in: number }
        Returns: {
          phase: string
          units: number
        }[]
      }
      get_revenue_by_date: {
        Args: { date1: string; date2: string }
        Returns: {
          value: number
        }[]
        SetofOptions: {
          from: "*"
          to: "val"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_reward_by_date: {
        Args: never
        Returns: {
          key: string
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyvalstr"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_rewards_by_user: {
        Args: never
        Returns: {
          key: number
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyval"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_salary_by_agent: {
        Args: { date1: string; date2: string }
        Returns: {
          key: number
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyval"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_salary_by_date: {
        Args: { date1: string; date2: string }
        Returns: {
          value: number
        }[]
        SetofOptions: {
          from: "*"
          to: "val"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_sales: {
        Args: never
        Returns: {
          value: number
        }[]
        SetofOptions: {
          from: "*"
          to: "val"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_sales_by_agent: {
        Args: never
        Returns: {
          key: number
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyval"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_sales_by_agent_with_date_range: {
        Args: { date1: string; date2: string }
        Returns: {
          key: number
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyval"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_sales_by_product: {
        Args: never
        Returns: {
          key: string
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyvalstr"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_sales_by_product_with_date_range: {
        Args: { date1: string; date2: string }
        Returns: {
          key: string
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyvalstr"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_sales_by_province: {
        Args: never
        Returns: {
          key: string
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyvalstr"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_sales_by_province_with_date_range: {
        Args: { date1: string; date2: string }
        Returns: {
          key: string
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyvalstr"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_sizes: {
        Args: never
        Returns: {
          key: number
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyval"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_sizes_by_order_qty: {
        Args: never
        Returns: {
          key: string
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyvalstr"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_sizes_by_order_qty2: {
        Args: never
        Returns: {
          key: string
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyvalstr"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_sizes_n4: {
        Args: never
        Returns: {
          key: string
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyvalstr"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_sizes_x: {
        Args: never
        Returns: {
          key: string
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyvalstr"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_stopdesk: {
        Args: never
        Returns: {
          key: boolean | null
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyvalbool"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_total_revenue: {
        Args: never
        Returns: {
          key: string
          value: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keyvalstr"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_tracking_history_by_status:
        | {
            Args: { date_in: string; tracker_in: number }
            Returns: {
              key: string
              value: number | null
            }[]
            SetofOptions: {
              from: "*"
              to: "keyvalstr"
              isOneToOne: false
              isSetofReturn: true
            }
          }
        | {
            Args: { date1: string; date2: string; tracker_in: number }
            Returns: {
              key: string
              value: number | null
            }[]
            SetofOptions: {
              from: "*"
              to: "keyvalstr"
              isOneToOne: false
              isSetofReturn: true
            }
          }
      get_tracking_history_by_tracker: {
        Args: { date_in: string; tracker_in: number }
        Returns: {
          key: number
          val1: string | null
          val2: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "keydoubleval"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      increment:
        | {
            Args: { color: string; name: string; size: string }
            Returns: undefined
          }
        | { Args: { row_id: number }; Returns: undefined }
      increment_inventory: {
        Args: { item_id_in: number; qty_in: number }
        Returns: undefined
      }
      increment_product: {
        Args: { color: string; name: string; qty: number; size: string }
        Returns: undefined
      }
      increment_qty:
        | {
            Args: { color: string; name: string; size: string }
            Returns: undefined
          }
        | {
            Args: { color: string; name: string; qty: number; size: string }
            Returns: undefined
          }
      refresh_product_inventory_phase_details: {
        Args: never
        Returns: undefined
      }
      retrieve_total_revenue: {
        Args: never
        Returns: {
          value: number
        }[]
        SetofOptions: {
          from: "*"
          to: "val"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      update_course_progress: {
        Args: { p_course_id: string; p_partner_id: number }
        Returns: undefined
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
    Enums: {},
  },
} as const
