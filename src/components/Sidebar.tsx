import { LayoutDashboard, Building2, Users, UsersRound, Shield, Award, FileText, ClipboardList, TrendingUp, Settings, LogOut, Tag, BookOpen, BarChart3 } from 'lucide-react';
import { useRouter } from '../utils/router';
import { useAuth } from '../contexts/AuthContext';
import { ModuleName } from '../types';

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
  { id: 'perfis', label: 'Perfis', icon: Shield, path: '/perfis' },
];

const secondaryItems: NavItem[] = [
  { id: 'competencias', label: 'Competências', icon: Award, path: '/competencias' },
  { id: 'modelos', label: 'Modelos', icon: FileText, path: '/modelos' },
];

const tertiaryItems: NavItem[] = [
  { id: 'avaliacoes', label: 'Avaliações', icon: ClipboardList, path: '/avaliacoes' },
  { id: 'avaliacoes', label: 'Comparativo', icon: BarChart3, path: '/avaliacoes/comparativo' },
];

const pdiItems = [
  { id: 'pdi-conteudos', label: 'Conteúdos PDI', icon: BookOpen, path: '/pdi/conteudos' },
  { id: 'pdi-tags', label: 'Tags PDI', icon: Tag, path: '/pdi/tags' },
];

const adminItems: NavItem[] = [
  { id: 'administradores', label: 'Administradores', icon: Settings, path: '/administradores' },
];

export const Sidebar = () => {
  const { currentPath, navigate } = useRouter();
  const { signOut, administrador } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return currentPath === '/dashboard';
    }
    return currentPath.startsWith(path);
  };

  const NavSection = ({ items, title }: { items: NavItem[], title?: string }) => (
    <div className="mb-4">
      {title && <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{title}</p>}
      <ul className="space-y-0.5">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <li key={item.id}>
              <button
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                  active
                    ? 'bg-indigo-50 text-indigo-700 font-medium border-r-2 border-indigo-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon size={18} className={active ? 'text-indigo-700' : 'text-gray-500'} />
                <span>{item.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen fixed left-0 top-0 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <button
          onClick={() => navigate('/')}
          className="hover:opacity-80 transition-opacity w-full"
        >
          <img
            src="/Aplicação 1 copy.png"
            alt="Ascender Hoje"
            className="h-12 w-auto mx-auto"
          />
        </button>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto">
        <NavSection items={dashboardItems} />
        <div className="border-t border-gray-200 my-2"></div>
        <NavSection items={navItems} />
        <div className="border-t border-gray-200 my-2"></div>
        <NavSection items={secondaryItems} />
        <div className="border-t border-gray-200 my-2"></div>
        <NavSection items={tertiaryItems} />
        <div className="border-t border-gray-200 my-2"></div>
        <NavSection items={pdiItems} title="PDI" />
        <div className="border-t border-gray-200 my-2"></div>
        <NavSection items={adminItems} />
      </nav>

      <div className="p-4 border-t border-gray-200">
        {administrador && (
          <div className="mb-3 px-2">
            <p className="text-xs text-gray-500">Conectado como</p>
            <p className="text-sm font-medium text-gray-900 truncate">{administrador.nome}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <LogOut size={18} className="text-gray-500" />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
};
