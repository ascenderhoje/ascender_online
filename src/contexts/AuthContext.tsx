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
  const [administrador, setAdministrador] = useState<Administrador | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const loadAdministrador = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('administradores')
        .select('id, nome, email, e_administrador, e_psicologa, ativo, telefone, avatar_url, empresa_padrao_id')
        .eq('auth_user_id', userId)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        console.error('Administrador not found for user:', userId);
        return null;
      }

      if (!data.ativo) {
        console.error('Administrador is not active');
        return null;
      }

      if (!data.e_administrador && !data.e_psicologa) {
        console.error('User does not have admin or psychologist permissions');
        return null;
      }

      await supabase.rpc('update_last_login', { user_id: userId });

      return data as Administrador;
    } catch (error) {
      console.error('Error loading administrador:', error);
      return null;
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        loadAdministrador(session.user.id).then((admin) => {
          setAdministrador(admin);
          setLoading(false);

          if (admin && (window.location.pathname === '/' || window.location.pathname === '/login')) {
            window.history.pushState({}, '', '/dashboard');
          }
        });
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          const admin = await loadAdministrador(session.user.id);
          setAdministrador(admin);

          if (admin && (window.location.pathname === '/' || window.location.pathname === '/login')) {
            window.history.pushState({}, '', '/dashboard');
          }
        } else {
          setAdministrador(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) return { error };

      if (data.user) {
        const admin = await loadAdministrador(data.user.id);
        if (!admin) {
          await supabase.auth.signOut();
          return { error: new Error('Usuário não autorizado ou inativo') };
        }
        setAdministrador(admin);
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setAdministrador(null);
    setSession(null);
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      return { error };
    } catch (error) {
      return { error: error as Error };
    }
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
