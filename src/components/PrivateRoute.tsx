import { ReactNode, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from '../utils/router';

interface PrivateRouteProps {
  children: ReactNode;
}

export const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const { administrador, loading } = useAuth();
  const { navigate, currentPath } = useRouter();

  useEffect(() => {
    if (!loading && !administrador) {
      sessionStorage.setItem('redirectAfterLogin', currentPath);
      navigate('/login');
    }
  }, [administrador, loading, navigate, currentPath]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!administrador) {
    return null;
  }

  return <>{children}</>;
};
