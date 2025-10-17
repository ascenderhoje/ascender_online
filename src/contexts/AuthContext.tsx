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

interface Pessoa {
  id: string;
  nome: string;
  email: string;
  tipo_acesso: 'gestor' | 'colaborador';
  ativo: boolean;
  empresa_id?: string;
}

type UserType = 'admin' | 'pessoa' | null;

interface AuthContextType {
  user: User | null;
  administrador: Administrador | null;
  pessoa: Pessoa | null;
  userType: UserType;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null; userType?: UserType }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [administrador, setAdministrador] = useState<Administrador | null>(null);
  const [pessoa, setPessoa] = useState<Pessoa | null>(null);
  const [userType, setUserType] = useState<UserType>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const loadAdministrador = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('administradores')
        .select('*')
        .eq('auth_user_id', userId)
        .eq('ativo', true)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        return null;
      }

      if (!data.e_administrador && !data.e_psicologa) {
        return null;
      }

      await supabase
        .from('administradores')
        .update({ ultimo_login: new Date().toISOString() })
        .eq('id', data.id);

      return data;
    } catch (error) {
      console.error('Erro ao carregar administrador:', error);
      return null;
    }
  };

  const loadPessoa = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('pessoas')
        .select('*')
        .eq('auth_user_id', userId)
        .eq('ativo', true)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        return null;
      }

      await supabase
        .from('pessoas')
        .update({ ultimo_login: new Date().toISOString() })
        .eq('id', data.id);

      return data;
    } catch (error) {
      console.error('Erro ao carregar pessoa:', error);
      return null;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          setUser(session.user);
          setSession(session);

          const adminData = await loadAdministrador(session.user.id);
          if (adminData) {
            setAdministrador(adminData);
            setPessoa(null);
            setUserType('admin');
          } else {
            const pessoaData = await loadPessoa(session.user.id);
            if (pessoaData) {
              setPessoa(pessoaData);
              setAdministrador(null);
              setUserType('pessoa');
            } else {
              await supabase.auth.signOut();
            }
          }
        }
      } catch (error) {
        console.error('Erro ao inicializar autenticação:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        (async () => {
          console.log('Auth state changed:', event);
          setSession(session);
          setUser(session?.user ?? null);

          if (session?.user) {
            const adminData = await loadAdministrador(session.user.id);
            if (adminData) {
              setAdministrador(adminData);
              setPessoa(null);
              setUserType('admin');
            } else {
              const pessoaData = await loadPessoa(session.user.id);
              if (pessoaData) {
                setPessoa(pessoaData);
                setAdministrador(null);
                setUserType('pessoa');
              } else {
                setAdministrador(null);
                setPessoa(null);
                setUserType(null);
              }
            }
          } else {
            setAdministrador(null);
            setPessoa(null);
            setUserType(null);
          }

          setLoading(false);
        })();
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) throw error;

      if (data.user) {
        const adminData = await loadAdministrador(data.user.id);
        if (adminData) {
          setAdministrador(adminData);
          setPessoa(null);
          setUserType('admin');
          return { error: null, userType: 'admin' as UserType };
        }

        const pessoaData = await loadPessoa(data.user.id);
        if (pessoaData) {
          setPessoa(pessoaData);
          setAdministrador(null);
          setUserType('pessoa');
          return { error: null, userType: 'pessoa' as UserType };
        }

        await supabase.auth.signOut();
        throw new Error('Acesso negado. Usuário não encontrado ou inativo.');
      }

      return { error: null };
    } catch (error: any) {
      console.error('Erro no login:', error);
      return { error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setAdministrador(null);
    setPessoa(null);
    setUserType(null);
    setSession(null);
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      console.error('Erro ao resetar senha:', error);
      return { error };
    }
  };

  const value = {
    user,
    administrador,
    pessoa,
    userType,
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
