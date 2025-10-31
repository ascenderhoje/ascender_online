import { ReactNode, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from '../utils/router';

interface GestorRouteProps {
  children: ReactNode;
}

export const GestorRoute = ({ children }: GestorRouteProps) => {
  const { pessoa, loading, user } = useAuth();
  const { navigate, currentPath } = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        sessionStorage.setItem('redirectAfterLogin', currentPath);
        navigate('/login');
      } else if (!pessoa) {
        navigate('/login');
      } else if (pessoa.tipo_acesso !== 'gestor') {
        navigate('/user-dashboard');
      }
    }
  }, [user, pessoa, loading, navigate, currentPath]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ascender-neutral">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-ascender-purple"></div>
          <p className="mt-4 text-gray-600 font-nunito">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!pessoa || pessoa.tipo_acesso !== 'gestor') {
    return null;
  }

  return <>{children}</>;
};
