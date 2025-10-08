import { ReactNode, createContext, useContext, useState, useCallback } from 'react';

interface RouteContextType {
  currentPath: string;
  navigate: (path: string) => void;
  params: Record<string, string>;
}

const RouteContext = createContext<RouteContextType | null>(null);

export const useRouter = () => {
  const context = useContext(RouteContext);
  if (!context) throw new Error('useRouter must be used within RouterProvider');
  return context;
};

export const RouterProvider = ({ children }: { children: ReactNode }) => {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [params, setParams] = useState<Record<string, string>>({});

  const navigate = useCallback((path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);

    const pathParts = path.split('/').filter(Boolean);
    const newParams: Record<string, string> = {};

    if (pathParts.length > 1 && pathParts[1] !== 'new' && pathParts[1] !== 'edit') {
      newParams.id = pathParts[1];
    }

    setParams(newParams);
  }, []);

  return (
    <RouteContext.Provider value={{ currentPath, navigate, params }}>
      {children}
    </RouteContext.Provider>
  );
};

interface RouteProps {
  path: string;
  children: ReactNode;
}

export const Route = ({ path, children }: RouteProps) => {
  const { currentPath } = useRouter();

  const pathPattern = path.replace(/:[^/]+/g, '[^/]+');
  const regex = new RegExp(`^${pathPattern}$`);

  if (regex.test(currentPath) || (path === '/' && currentPath === '/')) {
    return <>{children}</>;
  }

  return null;
};
