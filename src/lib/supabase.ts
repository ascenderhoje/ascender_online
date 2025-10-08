import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Database {
  public: {
    Tables: {
      empresas: {
        Row: {
          id: string;
          nome: string;
          cidade: string | null;
          regua: number;
          valido_ate: string | null;
          avatar_url: string | null;
          ativo: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nome: string;
          cidade?: string | null;
          regua?: number;
          valido_ate?: string | null;
          avatar_url?: string | null;
          ativo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nome?: string;
          cidade?: string | null;
          regua?: number;
          valido_ate?: string | null;
          avatar_url?: string | null;
          ativo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      pessoas: {
        Row: {
          id: string;
          idioma: string;
          nome: string;
          email: string;
          genero: string | null;
          empresa_id: string | null;
          funcao: string | null;
          avatar_url: string | null;
          tipo_acesso: 'admin' | 'gestor' | 'colaborador';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          idioma?: string;
          nome: string;
          email: string;
          genero?: string | null;
          empresa_id?: string | null;
          funcao?: string | null;
          avatar_url?: string | null;
          tipo_acesso: 'admin' | 'gestor' | 'colaborador';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          idioma?: string;
          nome?: string;
          email?: string;
          genero?: string | null;
          empresa_id?: string | null;
          funcao?: string | null;
          avatar_url?: string | null;
          tipo_acesso?: 'admin' | 'gestor' | 'colaborador';
          created_at?: string;
          updated_at?: string;
        };
      };
      grupos: {
        Row: {
          id: string;
          nome: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nome: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nome?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
