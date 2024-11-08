export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'Studente' | 'Docente'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string
          first_name: string
          last_name: string
          role: UserRole
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          first_name: string
          last_name: string
          role: UserRole
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          first_name?: string
          last_name?: string
          role?: UserRole
          created_at?: string
          updated_at?: string
        }
      }
      assignments: {
        Row: {
          id: string
          subject: string
          due_date: string
          teacher_id: string
          questions: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          subject: string
          due_date: string
          teacher_id: string
          questions: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          subject?: string
          due_date?: string
          teacher_id?: string
          questions?: Json
          created_at?: string
          updated_at?: string
        }
      }
      quiz_scores: {
        Row: {
          id: string
          user_id: string
          assignment_id: string
          score: number
          correct_answers: number
          total_questions: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          assignment_id: string
          score: number
          correct_answers: number
          total_questions: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          assignment_id?: string
          score?: number
          correct_answers?: number
          total_questions?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}