import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface Administrador {
  id: string;
  nome: string;
  email: string;
  e_administrador: boolean;
  e_psicologa: boolean;
  ativo: boolean;
  telefone?: string;
  avatar_url?: string;
  empresa_padrao_id?: string;
}

interface AuthContextType {
  user: User | null;
  administrador: Administrador | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [administrador, setAdministrador] = useState<Administrador | null>({
    id: 'admin-default',
    nome: 'Administrador',
    email: 'admin@sistema.com',
    e_administrador: true,
    e_psicologa: false,
    ativo: true,
  });
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (window.location.pathname === '/' || window.location.pathname === '/login') {
      window.history.pushState({}, '', '/dashboard');
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    return { error: null };
  };

  const signOut = async () => {
    // No-op
  };

  const resetPassword = async (email: string) => {
    return { error: null };
  };

  const value = {
    user,
    administrador,
    session,
    loading,
    signIn,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
