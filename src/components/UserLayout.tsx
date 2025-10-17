import { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from '../utils/router';
import { LogOut, User, ClipboardList } from 'lucide-react';

interface UserLayoutProps {
  children: ReactNode;
}

export function UserLayout({ children }: UserLayoutProps) {
  const { pessoa, signOut } = useAuth();
  const { navigate } = useRouter();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-6 h-6 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">Ascender Online</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700">
                <User className="w-4 h-4" />
                <span>{pessoa?.nome}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main>{children}</main>
    </div>
  );
}
