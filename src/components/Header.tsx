import { Search, User, LogOut, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  title?: string;
  action?: React.ReactNode;
}

export const Header = ({ title, action }: HeaderProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { administrador, signOut } = useAuth();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/login';
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="px-6 py-3 flex items-center justify-between gap-6">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Pesquisar"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
            >
              {administrador?.avatar_url ? (
                <img
                  src={administrador.avatar_url}
                  alt={administrador.nome}
                  className="w-6 h-6 rounded-full object-cover"
                />
              ) : (
                <User size={16} />
              )}
              <span>{administrador?.nome || 'Usuário'}</span>
              <ChevronDown size={14} />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{administrador?.nome}</p>
                  <p className="text-xs text-gray-500">{administrador?.email}</p>
                  {administrador?.e_psicologa && (
                    <span className="inline-block mt-1 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                      Psicóloga
                    </span>
                  )}
                  {administrador?.e_administrador && (
                    <span className="inline-block mt-1 ml-1 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                      Administrador
                    </span>
                  )}
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                >
                  <LogOut size={16} />
                  Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {(title || action) && (
        <div className="px-6 py-4 flex items-center justify-between border-t border-gray-100">
          {title && <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>}
          {action && <div>{action}</div>}
        </div>
      )}
    </header>
  );
};
