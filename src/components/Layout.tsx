import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { useRouter } from '../utils/router';
import { useSidebarState } from '../hooks/useSidebarState';

interface LayoutProps {
  children: ReactNode;
}

const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];

export const Layout = ({ children }: LayoutProps) => {
  const { currentPath } = useRouter();
  const { isCollapsed } = useSidebarState();
  const isPublicRoute = publicRoutes.includes(currentPath);

  if (isPublicRoute) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <main
        className={`transition-all duration-300 max-w-full overflow-x-hidden ${
          isCollapsed ? 'ml-20 w-[calc(100vw-5rem)]' : 'ml-64 w-[calc(100vw-16rem)]'
        }`}
      >
        {children}
      </main>
    </div>
  );
};
