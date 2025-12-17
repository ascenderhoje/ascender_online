import { LayoutDashboard, Building2, Users, UsersRound, Shield, Award, FileText, ClipboardList, TrendingUp, Settings, LogOut, Tag, BookOpen, BarChart3, ChevronLeft } from 'lucide-react';
import { useRouter } from '../utils/router';
import { useAuth } from '../contexts/AuthContext';
import { ModuleName } from '../types';
import { useSidebar } from '../contexts/SidebarContext';

interface NavItem {
  id: ModuleName | 'dashboard';
  label: string;
  icon: any;
  path: string;
}

const dashboardItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
];

const navItems: NavItem[] = [
  { id: 'empresas', label: 'Empresas', icon: Building2, path: '/empresas' },
  { id: 'pessoas', label: 'Pessoas', icon: Users, path: '/pessoas' },
  { id: 'grupos', label: 'Grupos', icon: UsersRound, path: '/grupos' },
];

const secondaryItems: NavItem[] = [
  { id: 'competencias', label: 'Competências', icon: Award, path: '/competencias' },
  { id: 'modelos', label: 'Modelos', icon: FileText, path: '/modelos' },
];

const tertiaryItems: NavItem[] = [
  { id: 'avaliacoes', label: 'Avaliações', icon: ClipboardList, path: '/avaliacoes' },
  { id: 'comparativo', label: 'Comparativo', icon: BarChart3, path: '/avaliacoes/comparativo' },
];

const pdiItems = [
  { id: 'pdi-conteudos', label: 'Conteúdos PDI', icon: BookOpen, path: '/pdi/conteudos' },
  { id: 'pdi-tags', label: 'Tags PDI', icon: Tag, path: '/pdi/tags' },
];

const adminItems: NavItem[] = [
  { id: 'administradores', label: 'Administradores', icon: Settings, path: '/administradores' },
  { id: 'perfis', label: 'Perfis', icon: Shield, path: '/perfis' },
];

export const Sidebar = () => {
  const { currentPath, navigate } = useRouter();
  const { signOut, administrador } = useAuth();
  const { isCollapsed, toggleSidebar } = useSidebar();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return currentPath === '/dashboard';
    }
    if (path === '/avaliacoes/comparativo') {
      return currentPath === '/avaliacoes/comparativo';
    }
    if (path === '/avaliacoes') {
      return currentPath === '/avaliacoes' || (currentPath.startsWith('/avaliacoes/') && !currentPath.startsWith('/avaliacoes/comparativo'));
    }
    return currentPath.startsWith(path);
  };

  const NavSection = ({ items, title }: { items: NavItem[], title?: string }) => (
    <div className="mb-4">
      {title && !isCollapsed && <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{title}</p>}
      <ul className="space-y-0.5">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <li key={item.id}>
              <button
                onClick={() => navigate(item.path)}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center transition-colors ${
                  isCollapsed ? 'justify-center px-4 py-2.5' : 'gap-3 px-4 py-2.5'
                } text-sm ${
                  active
                    ? 'bg-indigo-50 text-indigo-700 font-medium border-r-2 border-indigo-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon size={18} className={active ? 'text-indigo-700' : 'text-gray-500'} />
                {!isCollapsed && <span>{item.label}</span>}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );

  return (
    <div className="relative">
      <aside className={`bg-white border-r border-gray-200 min-h-screen fixed left-0 top-0 flex flex-col transition-all duration-300 ease-in-out z-50 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}>
        <div className={`${isCollapsed ? 'p-3' : 'p-6'} border-b border-gray-200 transition-all duration-300`}>
          <button
            onClick={() => navigate('/')}
            className="hover:opacity-80 transition-opacity w-full flex items-center justify-center"
          >
            <img
              src="/Aplicação 1 copy.png"
              alt="Ascender Hoje"
              className={`${isCollapsed ? 'h-10 max-w-[3.5rem]' : 'h-12 max-w-full'} object-contain object-left transition-all duration-300`}
            />
          </button>
        </div>

        <nav className="flex-1 py-4 overflow-y-auto pb-20">
          <NavSection items={dashboardItems} />
          {!isCollapsed && <div className="border-t border-gray-200 my-2"></div>}
          <NavSection items={navItems} />
          {!isCollapsed && <div className="border-t border-gray-200 my-2"></div>}
          <NavSection items={secondaryItems} />
          {!isCollapsed && <div className="border-t border-gray-200 my-2"></div>}
          <NavSection items={tertiaryItems} />
          {!isCollapsed && <div className="border-t border-gray-200 my-2"></div>}
          <NavSection items={pdiItems} title="PDI" />
          {!isCollapsed && <div className="border-t border-gray-200 my-2"></div>}
          <NavSection items={adminItems} title="Administração" />
        </nav>

        <div className={`${isCollapsed ? 'p-2' : 'p-4'} border-t border-gray-200 transition-all duration-300`}>
          {!isCollapsed && administrador && (
            <div className="mb-3 px-2">
              <p className="text-xs text-gray-500">Conectado como</p>
              <p className="text-sm font-medium text-gray-900 truncate">{administrador.nome}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            title={isCollapsed ? 'Sair' : undefined}
            className={`w-full flex items-center transition-colors ${
              isCollapsed ? 'justify-center px-4 py-2.5' : 'gap-3 px-4 py-2.5'
            } text-sm text-gray-700 hover:bg-gray-50 rounded-lg`}
          >
            <LogOut size={18} className="text-gray-500" />
            {!isCollapsed && <span>Sair</span>}
          </button>
        </div>
      </aside>

      <button
        onClick={toggleSidebar}
        className={`fixed top-0 h-screen w-1 hover:w-1.5 bg-gradient-to-r from-gray-200 to-gray-100 hover:from-gray-300 hover:to-gray-200 transition-all duration-300 cursor-col-resize z-50 ${
          isCollapsed ? 'left-20' : 'left-64'
        }`}
        title={isCollapsed ? 'Expandir menu' : 'Recolher menu'}
        aria-label={isCollapsed ? 'Expandir menu' : 'Recolher menu'}
      />
    </div>
  );
};
