import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { useRouter } from '../utils/router';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { currentPath } = useRouter();

  const publicPaths = ['/', '/login', '/forgot-password'];
  const isPublicPath = publicPaths.includes(currentPath);

  if (isPublicPath) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 ml-64">
        {children}
      </main>
    </div>
  );
};
