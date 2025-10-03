export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      comments: {
        Row: {
          id: number
          content: string
          post_id: number
          user_id: string
          created_at: string
        }
        Insert: {
          id?: number
          content: string
          post_id: number
          user_id: string
          created_at?: string
        }
        Update: {
          id?: number
          content?: string
          post_id?: number
          user_id?: string
          created_at?: string
        }
      }
      posts: {
        Row: {
          id: number
          slug: string
          title: string
          content: string | null
          author_id: string
          created_at: string
          updated_at: string
          game: string | null
        }
        Insert: {
          id?: number
          slug: string
          title: string
          content?: string | null
          author_id: string
          created_at?: string
          updated_at?: string
          game: string | null
        }
        Update: {
          id?: number
          slug?: string
          title?: string
          content?: string | null
          author_id?: string
          created_at?: string
          updated_at?: string
          game: string | null
        }
      }
      users: {
        Row: {
          id: string
          username: string
          created_at: string
        }
        Insert: {
          id: string
          username: string
          created_at?: string
        }
        Update: {
          id?: string
          username?: string
          created_at?: string
        }
      }
    }
    Views: { [_ in never]: never }
    Functions: {
      handle_updated_at: {
        Args: Record<string, unknown>
        Returns: unknown
      }
    }
    Enums: { [_ in never]: never }
  }
}
