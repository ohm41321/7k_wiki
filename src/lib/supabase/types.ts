export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
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
          imageUrls: string[] | null
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
          imageUrls?: string[] | null
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
          imageUrls?: string[] | null
        }
      }
    }
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: { [_ in never]: never }
  }
}