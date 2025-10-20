import { ReactNode } from 'react';
import { UserSidebar } from './UserSidebar';

interface UserLayoutProps {
  children: ReactNode;
}

export function UserLayout({ children }: UserLayoutProps) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <UserSidebar />
      <main className="flex-1 ml-64">
        {children}
      </main>
    </div>
  );
}
