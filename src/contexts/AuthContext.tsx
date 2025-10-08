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
      console.log('[loadAdministrador] Starting for userId:', userId);

      const { data, error } = await supabase
        .from('administradores')
        .select('id, nome, email, e_administrador, e_psicologa, ativo, telefone, avatar_url, empresa_padrao_id')
        .eq('auth_user_id', userId)
        .maybeSingle();

      console.log('[loadAdministrador] Query result:', { data, error });

      if (error) {
        console.error('[loadAdministrador] Query error:', error);
        throw error;
      }

      if (!data) {
        console.error('[loadAdministrador] Administrador not found for user:', userId);
        return null;
      }

      if (!data.ativo) {
        console.error('[loadAdministrador] Administrador is not active');
        return null;
      }

      if (!data.e_administrador && !data.e_psicologa) {
        console.error('[loadAdministrador] User does not have admin or psychologist permissions');
        return null;
      }

      console.log('[loadAdministrador] Updating last login...');
      const { error: rpcError } = await supabase.rpc('update_last_login', { user_id: userId });
      if (rpcError) {
        console.error('[loadAdministrador] Failed to update last login:', rpcError);
      }

      console.log('[loadAdministrador] Success!');
      return data as Administrador;
    } catch (error) {
      console.error('[loadAdministrador] Exception:', error);
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
      async (event, session) => {
        console.log('[onAuthStateChange] Event:', event, 'Session:', !!session);

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          console.log('[onAuthStateChange] Loading admin for user:', session.user.id);
          const admin = await loadAdministrador(session.user.id);

          if (!admin && event === 'SIGNED_IN') {
            console.error('[onAuthStateChange] Admin not found, signing out');
            await supabase.auth.signOut();
            setLoading(false);
            return;
          }

          setAdministrador(admin);

          if (admin && (window.location.pathname === '/' || window.location.pathname === '/login' || window.location.pathname === '/register')) {
            console.log('[onAuthStateChange] Redirecting to dashboard');
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
      console.log('[signIn] Starting sign in for:', email);

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('[signIn] Auth response:', { error });

      if (error) {
        console.error('[signIn] Auth error:', error);
        return { error };
      }

      console.log('[signIn] Sign in complete - onAuthStateChange will handle the rest');
      return { error: null };
    } catch (error) {
      console.error('[signIn] Exception:', error);
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
