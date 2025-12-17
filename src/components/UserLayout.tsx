import { ReactNode } from 'react';
import { UserSidebar } from './UserSidebar';
import { useSidebar } from '../contexts/SidebarContext';

interface UserLayoutProps {
  children: ReactNode;
}

export function UserLayout({ children }: UserLayoutProps) {
  const { isCollapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-ascender-neutral">
      <UserSidebar />
      <main
        className={`transition-all duration-300 max-w-full overflow-x-hidden ${
          isCollapsed ? 'ml-20 w-[calc(100vw-5rem)]' : 'ml-64 w-[calc(100vw-16rem)]'
        }`}
      >
        {children}
      </main>
    </div>
  );
}
