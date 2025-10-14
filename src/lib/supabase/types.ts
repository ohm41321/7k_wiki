export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string | null
          name: string | null
          created_at: string
        }
        Insert: {
          id: string
          email?: string | null
          name?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          name?: string | null
          created_at?: string
        }
      }
      comments: {
        Row: {
          id: number
          content: string
          post_id: number
          created_at: string
          author_name: string | null
        }
        Insert: {
          id?: number
          content: string
          post_id: number
          created_at?: string
          author_name?: string | null
        }
        Update: {
          id?: number
          content?: string
          post_id?: number
          created_at?: string
          author_name?: string | null
        }
      }
      posts: {
        Row: {
          id: number
          slug: string
          title: string
          content: string | null
          created_at: string
          author_name: string | null
          game: string | null
          category: string | null
          tags: string[] | null
          imageurls: string[] | null
          author_id: string | null
        }
        Insert: {
          id?: number
          slug: string
          title: string
          content?: string | null
          created_at?: string
          author_name?: string | null
          game?: string | null
          category?: string | null
          tags?: string[] | null
          imageurls?: string[] | null
          author_id?: string | null
        }
        Update: {
          id?: number
          slug?: string
          title?: string
          content?: string | null
          created_at?: string
          author_name?: string | null
          game?: string | null
          category?: string | null
          tags?: string[] | null
          imageurls?: string[] | null
          author_id?: string | null
        }
      }
      calendar_events: {
        Row: {
          id: number
          title: string
          description: string | null
          event_date: string
          event_time: string | null
          game: string | null
          event_type: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          title: string
          description?: string | null
          event_date: string
          event_time?: string | null
          game?: string | null
          event_type: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          title?: string
          description?: string | null
          event_date?: string
          event_time?: string | null
          game?: string | null
          event_type?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      announcements: {
        Row: {
          id: string
          title: string
          content: string
          type: string
          version: string | null
          priority: number
          active: boolean
          published: boolean
          published_at: string | null
          expires_at: string | null
          target_audience: string
          game: string | null
          image_url: string | null
          action_url: string | null
          action_text: string
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          type?: string
          version?: string | null
          priority?: number
          active?: boolean
          published?: boolean
          published_at?: string | null
          expires_at?: string | null
          target_audience?: string
          game?: string | null
          image_url?: string | null
          action_url?: string | null
          action_text?: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          type?: string
          version?: string | null
          priority?: number
          active?: boolean
          published?: boolean
          published_at?: string | null
          expires_at?: string | null
          target_audience?: string
          game?: string | null
          image_url?: string | null
          action_url?: string | null
          action_text?: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: { [_ in never]: never }
  }
}