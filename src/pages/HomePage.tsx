import { Building2, Users, UsersRound, TrendingUp, ArrowRight } from 'lucide-react';
import { Header } from '../components/Header';
import { useRouter } from '../utils/router';

export const HomePage = () => {
  const { navigate } = useRouter();

  const stats = [
    {
      label: 'Empresas Cadastradas',
      value: '3',
      icon: Building2,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600',
      path: '/empresas',
    },
    {
      label: 'Pessoas Ativas',
      value: '47',
      icon: Users,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600',
      path: '/pessoas',
    },
    {
      label: 'Grupos Ativos',
      value: '12',
      icon: UsersRound,
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-600',
      path: '/grupos',
    },
    {
      label: 'Avaliações em Andamento',
      value: '8',
      icon: TrendingUp,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
      path: '/avaliacoes',
    },
  ];

  const recentActivity = [
    { type: 'empresa', message: 'Nova empresa cadastrada: Tech Solutions Brasil', time: '2 horas atrás' },
    { type: 'pessoa', message: 'Maria Silva adicionada ao grupo Liderança', time: '5 horas atrás' },
    { type: 'avaliacao', message: 'Avaliação de desempenho Q1 2024 iniciada', time: '1 dia atrás' },
    { type: 'grupo', message: 'Grupo Equipe de Desenvolvimento criado', time: '2 dias atrás' },
  ];

  return (
    <>
      <Header title="Dashboard" />

      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Bem-vindo ao Ascender</h1>
          <p className="text-slate-600 mt-2">Gerencie suas empresas, pessoas e grupos de forma eficiente</p>
        </div>

        <div className="grid grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <button
                key={stat.label}
                onClick={() => navigate(stat.path)}
                className="bg-white p-6 rounded-lg border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all text-left group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                    <Icon size={24} className={stat.textColor} />
                  </div>
                  <ArrowRight size={20} className="text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </div>
                <p className="text-sm font-medium text-slate-600 mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Atividades Recentes</h3>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-900">{activity.message}</p>
                    <p className="text-xs text-slate-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Ações Rápidas</h3>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/empresas')}
                className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-lg text-left transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-900">Adicionar Nova Empresa</span>
                  <ArrowRight size={16} className="text-slate-400 group-hover:text-slate-900 group-hover:translate-x-1 transition-all" />
                </div>
              </button>
              <button
                onClick={() => navigate('/pessoas')}
                className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-lg text-left transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-900">Cadastrar Pessoa</span>
                  <ArrowRight size={16} className="text-slate-400 group-hover:text-slate-900 group-hover:translate-x-1 transition-all" />
                </div>
              </button>
              <button
                onClick={() => navigate('/grupos')}
                className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-lg text-left transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-900">Criar Novo Grupo</span>
                  <ArrowRight size={16} className="text-slate-400 group-hover:text-slate-900 group-hover:translate-x-1 transition-all" />
                </div>
              </button>
              <button
                onClick={() => navigate('/avaliacoes')}
                className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-lg text-left transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-900">Iniciar Avaliação</span>
                  <ArrowRight size={16} className="text-slate-400 group-hover:text-slate-900 group-hover:translate-x-1 transition-all" />
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-2">Pronto para começar?</h3>
              <p className="text-blue-50">Configure suas empresas e comece a gerenciar suas equipes</p>
            </div>
            <button
              onClick={() => navigate('/empresas')}
              className="px-6 py-3 bg-white text-blue-600 rounded-lg font-medium hover:shadow-lg transition-all"
            >
              Começar Agora
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
