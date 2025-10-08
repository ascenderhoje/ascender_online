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

  const extractParams = useCallback((path: string) => {
    const pathParts = path.split('/').filter(Boolean);
    const newParams: Record<string, string> = {};

    // Extract ID from paths like /competencias/:id/edit or /competencias/:id
    if (pathParts.length >= 2) {
      const id = pathParts[1];
      if (id !== 'new' && id !== 'edit') {
        newParams.id = id;
      }
    }

    return newParams;
  }, []);

  const navigate = useCallback((path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    setParams(extractParams(path));
  }, [extractParams]);

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
