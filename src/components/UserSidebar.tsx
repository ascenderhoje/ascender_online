import { useState, useEffect, useRef } from 'react';
import { LayoutDashboard, ClipboardList, LogOut, Users, TrendingUp, BookOpen, ListChecks } from 'lucide-react';
import { useRouter } from '../utils/router';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface NavItem {
  id: string;
  label: string;
  icon: any;
  path: string;
}

const getGestorNavItems = (hasAvaliacoes: boolean): NavItem[] => {
  const items: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/gestor-dashboard' },
  ];

  if (hasAvaliacoes) {
    items.push({ id: 'avaliacoes', label: 'Minhas Avaliações', icon: ClipboardList, path: '/gestor-avaliacoes' });
  }

  items.push({ id: 'pessoas', label: 'Pessoas', icon: Users, path: '/gestor-pessoas' });
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
  const { signOut, pessoa } = useAuth();
  const [hasAvaliacoes, setHasAvaliacoes] = useState(false);
  const [loading, setLoading] = useState(true);
  const hasCheckedRef = useRef(false);

  const isGestor = pessoa?.tipo_acesso === 'gestor';

  useEffect(() => {
    if (isGestor && pessoa?.id && !hasCheckedRef.current) {
      hasCheckedRef.current = true;
      checkGestorData();
    } else if (!isGestor) {
      setLoading(false);
    }
  }, [isGestor, pessoa?.id]);

  const checkGestorData = async () => {
    if (!pessoa?.id) return;

    try {
      const avaliacoesRes = await supabase
        .from('avaliacoes')
        .select('id')
        .eq('colaborador_id', pessoa.id)
        .eq('status', 'finalizada')
        .limit(1);

      setHasAvaliacoes((avaliacoesRes.data?.length || 0) > 0);
    } catch (error) {
      console.error('Erro ao verificar dados do gestor:', error);
    } finally {
      setLoading(false);
    }
  };

  const navItems = isGestor ? getGestorNavItems(hasAvaliacoes) : colaboradorNavItems;

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
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-nunito transition-all ${
                  active
                    ? 'bg-white/60 text-ascender-purple-dark font-semibold border-r-4 border-ascender-yellow'
                    : 'text-ascender-purple-dark hover:bg-white/40'
                }`}
              >
                <Icon size={18} className={active ? 'text-ascender-yellow' : 'text-ascender-purple'} />
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
    <aside className="w-64 bg-ascender-purple-light border-r border-ascender-purple/20 min-h-screen fixed left-0 top-0 flex flex-col shadow-lg">
      <div className="p-6 border-b border-ascender-purple/20">
        <button
          onClick={handleLogoClick}
          className="hover:opacity-80 transition-opacity w-full"
        >
          <img
            src="/Aplicação 1 copy.png"
            alt="Ascender Hoje"
            className="h-14 w-auto mx-auto"
          />
        </button>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto">
        <NavSection items={navItems} />
      </nav>

      <div className="p-4 border-t border-ascender-purple/20">
        {pessoa && (
          <div className="mb-3 px-2">
            <p className="text-xs text-ascender-purple-dark/70 font-nunito">Conectado como</p>
            <p className="text-sm font-nunito font-medium text-ascender-purple-dark truncate">{pessoa.nome}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-nunito text-ascender-purple-dark hover:bg-white/50 rounded-xl transition-colors"
        >
          <LogOut size={18} className="text-ascender-purple" />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
};
