import { useState, useEffect } from 'react';
import { Building2, Users, UsersRound, TrendingUp, ArrowRight, ClipboardList, CheckCircle2, Calendar } from 'lucide-react';
import { Header } from '../components/Header';
import { useRouter } from '../utils/router';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface AvaliacaoRascunho {
  id: string;
  data_avaliacao: string;
  colaborador_nome: string;
  empresa_nome: string;
  updated_at: string;
}

interface PsicologaStats {
  avaliacoesRascunho: number;
  avaliacoesFinalizadas: number;
  empresasAtendidas: number;
  colaboradoresAvaliados: number;
}

export const HomePage = () => {
  const { navigate } = useRouter();
  const { administrador } = useAuth();
  const [avaliacoesRecentes, setAvaliacoesRecentes] = useState<AvaliacaoRascunho[]>([]);
  const [psicologaStats, setPsicologaStats] = useState<PsicologaStats>({
    avaliacoesRascunho: 0,
    avaliacoesFinalizadas: 0,
    empresasAtendidas: 0,
    colaboradoresAvaliados: 0,
  });
  const [loading, setLoading] = useState(true);

  const isPsicologa = administrador?.e_psicologa || false;

  useEffect(() => {
    if (isPsicologa && administrador) {
      loadPsicologaData();
    } else {
      setLoading(false);
    }
  }, [isPsicologa, administrador]);

  const loadPsicologaData = async () => {
    if (!administrador) return;

    try {
      setLoading(true);

      // Buscar avaliações em rascunho
      const { data: rascunhoData, error: rascunhoError } = await supabase
        .from('avaliacoes')
        .select(`
          id,
          data_avaliacao,
          updated_at,
          empresa:empresas(nome),
          colaborador:pessoas!colaborador_id(nome)
        `)
        .eq('psicologa_responsavel_id', administrador.id)
        .eq('status', 'rascunho')
        .order('updated_at', { ascending: false })
        .limit(10);

      if (rascunhoError) throw rascunhoError;

      const avaliacoes = (rascunhoData || []).map((a: any) => ({
        id: a.id,
        data_avaliacao: a.data_avaliacao,
        colaborador_nome: a.colaborador?.nome || 'N/A',
        empresa_nome: a.empresa?.nome || 'N/A',
        updated_at: a.updated_at,
      }));

      setAvaliacoesRecentes(avaliacoes);

      // Buscar estatísticas
      const { count: rascunhoCount } = await supabase
        .from('avaliacoes')
        .select('id', { count: 'exact', head: true })
        .eq('psicologa_responsavel_id', administrador.id)
        .eq('status', 'rascunho');

      const { count: finalizadaCount } = await supabase
        .from('avaliacoes')
        .select('id', { count: 'exact', head: true })
        .eq('psicologa_responsavel_id', administrador.id)
        .eq('status', 'finalizada');

      const { data: empresasData } = await supabase
        .from('avaliacoes')
        .select('empresa_id')
        .eq('psicologa_responsavel_id', administrador.id);

      const empresasUnicas = new Set(empresasData?.map(a => a.empresa_id) || []).size;

      const { data: colaboradoresData } = await supabase
        .from('avaliacoes')
        .select('colaborador_id')
        .eq('psicologa_responsavel_id', administrador.id);

      const colaboradoresUnicos = new Set(colaboradoresData?.map(a => a.colaborador_id) || []).size;

      setPsicologaStats({
        avaliacoesRascunho: rascunhoCount || 0,
        avaliacoesFinalizadas: finalizadaCount || 0,
        empresasAtendidas: empresasUnicas,
        colaboradoresAvaliados: colaboradoresUnicos,
      });
    } catch (error: any) {
      console.error('Erro ao carregar dados da psicóloga:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const psicologaStatsCards = [
    {
      label: 'Avaliações em Rascunho',
      value: psicologaStats.avaliacoesRascunho.toString(),
      icon: ClipboardList,
      color: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-100',
      textColor: 'text-amber-600',
      path: '/avaliacoes',
    },
    {
      label: 'Avaliações Finalizadas',
      value: psicologaStats.avaliacoesFinalizadas.toString(),
      icon: CheckCircle2,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
      path: '/avaliacoes',
    },
    {
      label: 'Empresas Atendidas',
      value: psicologaStats.empresasAtendidas.toString(),
      icon: Building2,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600',
      path: '/empresas',
    },
    {
      label: 'Colaboradores Avaliados',
      value: psicologaStats.colaboradoresAvaliados.toString(),
      icon: Users,
      color: 'from-violet-500 to-purple-500',
      bgColor: 'bg-violet-100',
      textColor: 'text-violet-600',
      path: '/pessoas',
    },
  ];

  const recentActivity = [
    { type: 'empresa', message: 'Nova empresa cadastrada: Tech Solutions Brasil', time: '2 horas atrás' },
    { type: 'pessoa', message: 'Maria Silva adicionada ao grupo Liderança', time: '5 horas atrás' },
    { type: 'avaliacao', message: 'Avaliação de desempenho Q1 2024 iniciada', time: '1 dia atrás' },
    { type: 'grupo', message: 'Grupo Equipe de Desenvolvimento criado', time: '2 dias atrás' },
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatRelativeTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Hoje';
    if (diffInDays === 1) return 'Ontem';
    if (diffInDays < 7) return `${diffInDays} dias atrás`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} semanas atrás`;
    return formatDate(dateString);
  };

  if (isPsicologa) {
    return (
      <>
        <Header title="Dashboard" />

        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">Bem-vindo, {administrador?.nome}</h1>
            <p className="text-slate-600 mt-2">Aqui está um resumo das suas avaliações</p>
          </div>

          {loading ? (
            <div className="bg-white p-12 rounded-lg border border-slate-200 text-center">
              <p className="text-slate-500">Carregando suas informações...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-4 gap-6 mb-8">
                {psicologaStatsCards.map((stat) => {
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

              <div className="grid grid-cols-1 gap-6">
                <div className="bg-white rounded-lg border border-slate-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-900">Avaliações em Rascunho</h3>
                    <button
                      onClick={() => navigate('/avaliacoes')}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                    >
                      Ver todas
                      <ArrowRight size={16} />
                    </button>
                  </div>
                  {avaliacoesRecentes.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      <ClipboardList size={48} className="mx-auto mb-3 text-slate-300" />
                      <p>Você não tem avaliações em rascunho no momento</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {avaliacoesRecentes.map((avaliacao) => (
                        <button
                          key={avaliacao.id}
                          onClick={() => navigate(`/avaliacoes/${avaliacao.id}/edit`)}
                          className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors group text-left"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium text-slate-900">{avaliacao.colaborador_nome}</p>
                              <span className="text-slate-400">•</span>
                              <p className="text-sm text-slate-600">{avaliacao.empresa_nome}</p>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-slate-500">
                              <span className="flex items-center gap-1">
                                <Calendar size={12} />
                                Avaliação: {formatDate(avaliacao.data_avaliacao)}
                              </span>
                              <span>Última edição: {formatRelativeTime(avaliacao.updated_at)}</span>
                            </div>
                          </div>
                          <ArrowRight size={20} className="text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg p-8 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Iniciar nova avaliação?</h3>
                    <p className="text-blue-50">Crie uma nova avaliação e acompanhe o desenvolvimento dos colaboradores</p>
                  </div>
                  <button
                    onClick={() => navigate('/avaliacoes/new')}
                    className="px-6 py-3 bg-white text-blue-600 rounded-lg font-medium hover:shadow-lg transition-all"
                  >
                    Nova Avaliação
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </>
    );
  }

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
