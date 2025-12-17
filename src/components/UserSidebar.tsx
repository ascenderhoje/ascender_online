import { useMemo } from 'react';
import { LayoutDashboard, ClipboardList, LogOut, Users, TrendingUp, BookOpen, ListChecks, BarChart3 } from 'lucide-react';
import { useRouter } from '../utils/router';
import { useAuth } from '../contexts/AuthContext';
import { useSidebar } from '../contexts/SidebarContext';

interface NavItem {
  id: string;
  label: string;
  icon: any;
  path: string;
}

const getGestorNavItems = (hasAvaliacoes: boolean, hasComparativo: boolean): NavItem[] => {
  const items: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/gestor-dashboard' },
  ];

  if (hasAvaliacoes) {
    items.push({ id: 'avaliacoes', label: 'Minhas Avaliações', icon: ClipboardList, path: '/gestor-avaliacoes' });
  }

  items.push({ id: 'pessoas', label: 'Pessoas', icon: Users, path: '/gestor-pessoas' });

  if (hasComparativo) {
    items.push({ id: 'comparativo', label: 'Comparativo', icon: BarChart3, path: '/gestor-comparativo' });
  }

  items.push({ id: 'meu-pdi', label: 'Meu PDI', icon: TrendingUp, path: '/pdi/meu-pdi' });
  items.push({ id: 'acoes', label: 'Ações para meu PDI', icon: ListChecks, path: '/pdi/acoes' });
  items.push({ id: 'biblioteca', label: 'Conteúdos para meu PDI', icon: BookOpen, path: '/pdi/biblioteca' });

  return items;
};

const colaboradorNavItems: NavItem[] = [
  { id: 'avaliacoes', label: 'Minhas Avaliações', icon: ClipboardList, path: '/user-dashboard' },
  { id: 'meu-pdi', label: 'Meu PDI', icon: TrendingUp, path: '/pdi/meu-pdi' },
  { id: 'biblioteca', label: 'Biblioteca', icon: BookOpen, path: '/pdi/biblioteca' },
  { id: 'acoes', label: 'Minhas Ações', icon: ListChecks, path: '/pdi/acoes' },
];

export const UserSidebar = () => {
  const { currentPath, navigate } = useRouter();
  const { signOut, pessoa, hasAvaliacoes, hasComparativo } = useAuth();
  const { isCollapsed, toggleSidebar } = useSidebar();

  const isGestor = pessoa?.tipo_acesso === 'gestor';

  const navItems = useMemo(() => {
    return isGestor ? getGestorNavItems(hasAvaliacoes, hasComparativo) : colaboradorNavItems;
  }, [isGestor, hasAvaliacoes, hasComparativo]);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const isActive = (path: string) => {
    if (path === '/user-dashboard') {
      return currentPath === '/user-dashboard' || currentPath.startsWith('/user-avaliacao');
    }
    if (path === '/gestor-dashboard') {
      return currentPath === '/gestor-dashboard';
    }
    if (path === '/gestor-pessoas') {
      return currentPath === '/gestor-pessoas' || currentPath.startsWith('/gestor-pessoa/');
    }
    if (path === '/gestor-avaliacoes') {
      return currentPath === '/gestor-avaliacoes' || currentPath.startsWith('/user-avaliacao');
    }
    if (path === '/gestor-comparativo') {
      return currentPath === '/gestor-comparativo';
    }
    if (path.startsWith('/pdi/')) {
      return currentPath.startsWith(path) || currentPath === path;
    }
    return currentPath.startsWith(path);
  };

  const NavSection = ({ items }: { items: NavItem[] }) => (
    <div className="mb-4">
      <ul className="space-y-0.5">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <li key={item.id}>
              <button
                onClick={() => navigate(item.path)}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center transition-all font-nunito text-sm ${
                  isCollapsed ? 'justify-center px-4 py-2.5' : 'gap-3 px-4 py-2.5'
                } ${
                  active
                    ? 'bg-white/60 text-ascender-purple-dark font-semibold border-r-4 border-ascender-yellow'
                    : 'text-ascender-purple-dark hover:bg-white/40'
                }`}
              >
                <Icon size={18} className={active ? 'text-ascender-yellow' : 'text-ascender-purple'} />
                {!isCollapsed && <span>{item.label}</span>}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );

  const handleLogoClick = () => {
    if (isGestor) {
      navigate('/gestor-dashboard');
    } else {
      navigate('/user-dashboard');
    }
  };

  return (
    <div className="relative">
      <aside className={`bg-ascender-purple-light border-r border-ascender-purple/20 min-h-screen fixed left-0 top-0 flex flex-col shadow-lg transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}>
        <div className={`${isCollapsed ? 'p-3' : 'p-6'} border-b border-ascender-purple/20 transition-all duration-300`}>
          <button
            onClick={handleLogoClick}
            className="hover:opacity-80 transition-opacity w-full"
          >
            <img
              src="/Aplicação 1 copy.png"
              alt="Ascender Hoje"
              className={`${isCollapsed ? 'h-8' : 'h-14'} w-auto mx-auto transition-all duration-300`}
            />
          </button>
        </div>

        <nav className="flex-1 py-4 overflow-y-auto">
          <NavSection items={navItems} />
        </nav>

        <div className={`${isCollapsed ? 'p-2' : 'p-4'} border-t border-ascender-purple/20 transition-all duration-300`}>
          {!isCollapsed && pessoa && (
            <div className="mb-3 px-2">
              <p className="text-xs text-ascender-purple-dark/70 font-nunito">Conectado como</p>
              <p className="text-sm font-nunito font-medium text-ascender-purple-dark truncate">{pessoa.nome}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            title={isCollapsed ? 'Sair' : undefined}
            className={`w-full flex items-center transition-colors font-nunito text-sm text-ascender-purple-dark hover:bg-white/50 rounded-xl ${
              isCollapsed ? 'justify-center px-4 py-2.5' : 'gap-3 px-4 py-2.5'
            }`}
          >
            <LogOut size={18} className="text-ascender-purple" />
            {!isCollapsed && <span>Sair</span>}
          </button>
        </div>
      </aside>

      <button
        onClick={toggleSidebar}
        className={`fixed top-0 h-screen w-1 hover:w-1.5 bg-gradient-to-r from-ascender-purple/20 to-ascender-purple/10 hover:from-ascender-purple/30 hover:to-ascender-purple/20 transition-all duration-300 cursor-col-resize ${
          isCollapsed ? 'left-20' : 'left-64'
        }`}
        title={isCollapsed ? 'Expandir menu' : 'Recolher menu'}
        aria-label={isCollapsed ? 'Expandir menu' : 'Recolher menu'}
      />
    </div>
  );
};
