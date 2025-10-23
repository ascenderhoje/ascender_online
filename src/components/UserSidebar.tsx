import { LayoutDashboard, ClipboardList, LogOut, Users, TrendingUp, BookOpen, ListChecks } from 'lucide-react';
import { useRouter } from '../utils/router';
import { useAuth } from '../contexts/AuthContext';

interface NavItem {
  id: string;
  label: string;
  icon: any;
  path: string;
}

const gestorNavItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/gestor-dashboard' },
  { id: 'pessoas', label: 'Pessoas', icon: Users, path: '/gestor-pessoas' },
  { id: 'avaliacoes', label: 'Minhas Avaliações', icon: ClipboardList, path: '/gestor-avaliacoes' },
  { id: 'meu-pdi', label: 'Meu PDI', icon: TrendingUp, path: '/pdi/meu-pdi' },
  { id: 'biblioteca', label: 'Biblioteca', icon: BookOpen, path: '/pdi/biblioteca' },
  { id: 'acoes', label: 'Minhas Ações', icon: ListChecks, path: '/pdi/acoes' },
];

const colaboradorNavItems: NavItem[] = [
  { id: 'avaliacoes', label: 'Minhas Avaliações', icon: ClipboardList, path: '/user-dashboard' },
  { id: 'meu-pdi', label: 'Meu PDI', icon: TrendingUp, path: '/pdi/meu-pdi' },
  { id: 'biblioteca', label: 'Biblioteca', icon: BookOpen, path: '/pdi/biblioteca' },
  { id: 'acoes', label: 'Minhas Ações', icon: ListChecks, path: '/pdi/acoes' },
];

export const UserSidebar = () => {
  const { currentPath, navigate } = useRouter();
  const { signOut, pessoa } = useAuth();

  const isGestor = pessoa?.tipo_acesso === 'gestor';
  const navItems = isGestor ? gestorNavItems : colaboradorNavItems;

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
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                  active
                    ? 'bg-blue-50 text-blue-700 font-medium border-r-2 border-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon size={18} className={active ? 'text-blue-700' : 'text-gray-500'} />
                <span>{item.label}</span>
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
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen fixed left-0 top-0 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <button
          onClick={handleLogoClick}
          className="text-base font-semibold text-gray-900 hover:text-blue-600 transition-colors"
        >
          Ascender RH
        </button>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto">
        <NavSection items={navItems} />
      </nav>

      <div className="p-4 border-t border-gray-200">
        {pessoa && (
          <div className="mb-3 px-2">
            <p className="text-xs text-gray-500">Conectado como</p>
            <p className="text-sm font-medium text-gray-900 truncate">{pessoa.nome}</p>
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
