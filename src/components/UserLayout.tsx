import { ReactNode } from 'react';
import { UserSidebar } from './UserSidebar';
import { useSidebarState } from '../hooks/useSidebarState';

interface UserLayoutProps {
  children: ReactNode;
}

export function UserLayout({ children }: UserLayoutProps) {
  const { isCollapsed } = useSidebarState();

  return (
    <div className="min-h-screen bg-ascender-neutral">
      <UserSidebar />
      <main className={`transition-all duration-300 ${isCollapsed ? 'ml-20' : 'ml-64'}`}>
        {children}
      </main>
    </div>
  );
}
