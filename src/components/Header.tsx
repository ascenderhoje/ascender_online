import { User, LogOut, ChevronDown, Settings } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from '../utils/router';

interface HeaderProps {
  title?: string;
  action?: React.ReactNode;
  subtitle?: string;
}

export const Header = ({ title, action, subtitle }: HeaderProps) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { administrador, signOut } = useAuth();
  const { navigate } = useRouter();
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
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="px-6 py-3 flex items-center justify-end gap-6">
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
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate('/perfil');
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                >
                  <Settings size={16} />
                  Meu Perfil
                </button>
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

      {(title || action || subtitle) && (
        <div className="px-6 py-4 flex items-center justify-between border-t border-gray-100">
          <div>
            {title && <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>}
            {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
    </header>
  );
};
