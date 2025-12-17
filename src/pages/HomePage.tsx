import { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  ClipboardList,
  CheckCircle2,
  Calendar,
  ArrowRight,
  AlertTriangle,
  TrendingUp,
  Clock,
  UserPlus,
  FileText,
  Search,
  ArrowUp,
  ArrowDown,
  Plus,
  Eye,
  Edit3,
  BookOpen
} from 'lucide-react';
import { Header } from '../components/Header';
import { useRouter } from '../utils/router';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface AvaliacaoTabela {
  id: string;
  data_avaliacao: string;
  colaborador_nome: string;
  empresa_nome: string;
  status: string;
  updated_at: string;
  created_at: string;
}

interface AvaliacaoAtrasada {
  id: string;
  colaborador_nome: string;
  dias_atraso: number;
}

interface PsicologaStats {
  avaliacoesAtribuidas: number;
  avaliacoesRascunho: number;
  avaliacoesFinalizadas: number;
  avaliacoesFinalizadasMes: number;
}

interface AdminDashboardStats {
  avaliacoesRascunho: number;
  avaliacoesEsteMes: number;
  percentualPDI: number;
}

interface PsicologaPendente {
  id: string;
  nome: string;
  avaliacoesPendentes: number;
}

interface EmpresaInfo {
  id: string;
  nome: string;
  totalUsuarios: number;
  avaliacoesAtivas: number;
}

interface EngagementData {
  mes: string;
  avaliacoesCriadas: number;
  avaliacoesRealizadas: number;
  pdisRegistrados: number;
}

interface ActivityLog {
  id: string;
  action_type: string;
  description: string;
  entity_type: string;
  admin_name: string;
  created_at: string;
}

const formatRelativeTime = (dateString: string) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) return 'Agora mesmo';
  if (diffInMinutes < 60) return `${diffInMinutes} min atrás`;
  if (diffInHours < 24) return `${diffInHours}h atrás`;
  if (diffInDays === 1) return 'Ontem';
  if (diffInDays < 7) return `${diffInDays} dias atrás`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} semanas atrás`;
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
};

const getActivityIcon = (entityType: string) => {
  switch (entityType) {
    case 'empresa':
      return Building2;
    case 'pessoa':
      return UserPlus;
    case 'grupo':
      return Users;
    case 'modelo':
    case 'avaliacao':
      return FileText;
    default:
      return ClipboardList;
  }
};

const getActivityColor = (entityType: string) => {
  switch (entityType) {
    case 'empresa':
      return 'bg-blue-100 text-blue-600';
    case 'pessoa':
      return 'bg-green-100 text-green-600';
    case 'grupo':
      return 'bg-amber-100 text-amber-600';
    case 'modelo':
      return 'bg-cyan-100 text-cyan-600';
    case 'avaliacao':
      return 'bg-teal-100 text-teal-600';
    default:
      return 'bg-slate-100 text-slate-600';
  }
};

export const HomePage = () => {
  const { navigate } = useRouter();
  const { administrador } = useAuth();
  const [todasAvaliacoes, setTodasAvaliacoes] = useState<AvaliacaoTabela[]>([]);
  const [avaliacoesAtrasadas, setAvaliacoesAtrasadas] = useState<AvaliacaoAtrasada[]>([]);
  const [psicologaStats, setPsicologaStats] = useState<PsicologaStats>({
    avaliacoesAtribuidas: 0,
    avaliacoesRascunho: 0,
    avaliacoesFinalizadas: 0,
    avaliacoesFinalizadasMes: 0,
  });
  const [psicologaSearchTerm, setPsicologaSearchTerm] = useState('');
  const [psicologaSortBy, setPsicologaSortBy] = useState<'colaborador' | 'empresa' | 'status' | 'data'>('data');
  const [psicologaSortOrder, setPsicologaSortOrder] = useState<'asc' | 'desc'>('desc');
  const [loading, setLoading] = useState(true);

  const [adminStats, setAdminStats] = useState<AdminDashboardStats>({
    avaliacoesRascunho: 0,
    avaliacoesEsteMes: 0,
    percentualPDI: 0,
  });
  const [psicologasPendentes, setPsicologasPendentes] = useState<PsicologaPendente[]>([]);
  const [empresas, setEmpresas] = useState<EmpresaInfo[]>([]);
  const [engagementData, setEngagementData] = useState<EngagementData[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  const isPsicologa = administrador?.e_psicologa || false;
  const isAdmin = administrador?.e_administrador || false;

  useEffect(() => {
    if (isPsicologa && administrador) {
      loadPsicologaData();
    } else if (isAdmin && administrador) {
      loadAdminDashboardData();
    } else {
      setLoading(false);
    }
  }, [isPsicologa, isAdmin, administrador]);

  const loadPsicologaData = async () => {
    if (!administrador) return;

    try {
      setLoading(true);

      const { data: todasData, error: todasError } = await supabase
        .from('avaliacoes')
        .select(`
          id,
          data_avaliacao,
          status,
          updated_at,
          created_at,
          empresa:empresas(nome),
          colaborador:pessoas!colaborador_id(nome)
        `)
        .eq('psicologa_responsavel_id', administrador.id)
        .order('updated_at', { ascending: false });

      if (todasError) throw todasError;

      const avaliacoes = (todasData || []).map((a: any) => ({
        id: a.id,
        data_avaliacao: a.data_avaliacao,
        colaborador_nome: a.colaborador?.nome || 'N/A',
        empresa_nome: a.empresa?.nome || 'N/A',
        status: a.status,
        updated_at: a.updated_at,
        created_at: a.created_at,
      }));

      setTodasAvaliacoes(avaliacoes);

      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const atrasadas = avaliacoes
        .filter((a: AvaliacaoTabela) => {
          if (a.status !== 'rascunho') return false;
          const createdAt = new Date(a.created_at);
          return createdAt < sevenDaysAgo;
        })
        .map((a: AvaliacaoTabela) => {
          const createdAt = new Date(a.created_at);
          const diffTime = now.getTime() - createdAt.getTime();
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          return {
            id: a.id,
            colaborador_nome: a.colaborador_nome,
            dias_atraso: diffDays,
          };
        });

      setAvaliacoesAtrasadas(atrasadas);

      const { count: totalCount } = await supabase
        .from('avaliacoes')
        .select('id', { count: 'exact', head: true })
        .eq('psicologa_responsavel_id', administrador.id);

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

      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

      const { count: finalizadasMesCount } = await supabase
        .from('avaliacoes')
        .select('id', { count: 'exact', head: true })
        .eq('psicologa_responsavel_id', administrador.id)
        .eq('status', 'finalizada')
        .gte('updated_at', firstDayOfMonth)
        .lte('updated_at', lastDayOfMonth);

      setPsicologaStats({
        avaliacoesAtribuidas: totalCount || 0,
        avaliacoesRascunho: rascunhoCount || 0,
        avaliacoesFinalizadas: finalizadaCount || 0,
        avaliacoesFinalizadasMes: finalizadasMesCount || 0,
      });
    } catch (error: any) {
      console.error('Erro ao carregar dados da psicologa:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAdminDashboardData = async () => {
    try {
      setLoading(true);

      const { count: rascunhoCount } = await supabase
        .from('avaliacoes')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'rascunho');

      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

      const { count: avaliacoesEsteMesCount } = await supabase
        .from('avaliacoes')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'finalizada')
        .gte('updated_at', firstDayOfMonth)
        .lte('updated_at', lastDayOfMonth);

      const { count: totalPessoas } = await supabase
        .from('pessoas')
        .select('id', { count: 'exact', head: true })
        .eq('ativo', true);

      const { data: pessoasComPDI } = await supabase
        .from('pdi_user_contents')
        .select('user_id');

      const { data: pessoasComAcoes } = await supabase
        .from('pdi_user_actions')
        .select('user_id');

      const pessoasComPDISet = new Set([
        ...(pessoasComPDI || []).map(p => p.user_id),
        ...(pessoasComAcoes || []).map(p => p.user_id)
      ]);

      const percentualPDI = totalPessoas && totalPessoas > 0
        ? Math.round((pessoasComPDISet.size / totalPessoas) * 100)
        : 0;

      setAdminStats({
        avaliacoesRascunho: rascunhoCount || 0,
        avaliacoesEsteMes: avaliacoesEsteMesCount || 0,
        percentualPDI,
      });

      const { data: psicologasData } = await supabase
        .from('administradores')
        .select('id, nome')
        .eq('e_psicologa', true)
        .eq('ativo', true);

      if (psicologasData && psicologasData.length > 0) {
        const pendentesPromises = psicologasData.map(async (psi) => {
          const { count } = await supabase
            .from('avaliacoes')
            .select('id', { count: 'exact', head: true })
            .eq('psicologa_responsavel_id', psi.id)
            .eq('status', 'rascunho');

          return {
            id: psi.id,
            nome: psi.nome,
            avaliacoesPendentes: count || 0,
          };
        });

        const pendentes = await Promise.all(pendentesPromises);
        const pendentesOrdenados = pendentes
          .filter(p => p.avaliacoesPendentes > 0)
          .sort((a, b) => b.avaliacoesPendentes - a.avaliacoesPendentes);

        setPsicologasPendentes(pendentesOrdenados);
      }

      const { data: empresasData } = await supabase
        .from('empresas')
        .select('id, nome')
        .eq('ativo', true)
        .order('nome');

      if (empresasData && empresasData.length > 0) {
        const empresasPromises = empresasData.map(async (emp) => {
          const { count: usuariosCount } = await supabase
            .from('pessoas')
            .select('id', { count: 'exact', head: true })
            .eq('empresa_id', emp.id)
            .eq('ativo', true);

          const { count: avaliacoesCount } = await supabase
            .from('avaliacoes')
            .select('id', { count: 'exact', head: true })
            .eq('empresa_id', emp.id)
            .neq('status', 'finalizada');

          return {
            id: emp.id,
            nome: emp.nome,
            totalUsuarios: usuariosCount || 0,
            avaliacoesAtivas: avaliacoesCount || 0,
          };
        });

        const empresasInfo = await Promise.all(empresasPromises);
        setEmpresas(empresasInfo);
      }

      await loadEngagementData();
      await loadActivityLogs();
    } catch (error: any) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEngagementData = async () => {
    const meses: EngagementData[] = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

      const mesNome = date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');

      const { count: criadasCount } = await supabase
        .from('avaliacoes')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', date.toISOString())
        .lt('created_at', nextMonth.toISOString());

      const { count: realizadasCount } = await supabase
        .from('avaliacoes')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'finalizada')
        .gte('updated_at', date.toISOString())
        .lt('updated_at', nextMonth.toISOString());

      const { count: pdisCount } = await supabase
        .from('pdi_user_contents')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', date.toISOString())
        .lt('created_at', nextMonth.toISOString());

      const { count: acoesCount } = await supabase
        .from('pdi_user_actions')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', date.toISOString())
        .lt('created_at', nextMonth.toISOString());

      meses.push({
        mes: mesNome.charAt(0).toUpperCase() + mesNome.slice(1),
        avaliacoesCriadas: criadasCount || 0,
        avaliacoesRealizadas: realizadasCount || 0,
        pdisRegistrados: (pdisCount || 0) + (acoesCount || 0),
      });
    }

    setEngagementData(meses);
  };

  const loadActivityLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Erro ao carregar logs:', error);
        return;
      }

      setActivityLogs(data || []);
    } catch (error) {
      console.error('Erro ao carregar activity logs:', error);
    }
  };

  const handlePsicologaSort = (column: 'colaborador' | 'empresa' | 'status' | 'data') => {
    if (psicologaSortBy === column) {
      setPsicologaSortOrder(psicologaSortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setPsicologaSortBy(column);
      setPsicologaSortOrder('asc');
    }
  };

  const filteredPsicologaAvaliacoes = todasAvaliacoes
    .filter((a) => {
      const search = psicologaSearchTerm.toLowerCase();
      return (
        a.colaborador_nome.toLowerCase().includes(search) ||
        a.empresa_nome.toLowerCase().includes(search)
      );
    })
    .sort((a, b) => {
      let compareValue = 0;
      if (psicologaSortBy === 'colaborador') {
        compareValue = a.colaborador_nome.localeCompare(b.colaborador_nome);
      } else if (psicologaSortBy === 'empresa') {
        compareValue = a.empresa_nome.localeCompare(b.empresa_nome);
      } else if (psicologaSortBy === 'status') {
        compareValue = a.status.localeCompare(b.status);
      } else if (psicologaSortBy === 'data') {
        compareValue = new Date(a.data_avaliacao).getTime() - new Date(b.data_avaliacao).getTime();
      }
      return psicologaSortOrder === 'asc' ? compareValue : -compareValue;
    });

  const psicologaStatsCards = [
    {
      label: 'Avaliacoes Atribuidas a Mim',
      value: psicologaStats.avaliacoesAtribuidas.toString(),
      icon: ClipboardList,
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600',
    },
    {
      label: 'Avaliacoes em Rascunho',
      value: psicologaStats.avaliacoesRascunho.toString(),
      icon: Clock,
      bgColor: 'bg-amber-100',
      textColor: 'text-amber-600',
    },
    {
      label: 'Avaliacoes Finalizadas',
      value: psicologaStats.avaliacoesFinalizadas.toString(),
      icon: CheckCircle2,
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
    },
    {
      label: 'Finalizadas no Mes',
      value: psicologaStats.avaliacoesFinalizadasMes.toString(),
      icon: Calendar,
      bgColor: 'bg-teal-100',
      textColor: 'text-teal-600',
    },
  ];

  if (isPsicologa) {
    return (
      <>
        <Header title="Dashboard" />

        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">Dashboard da Psicologa</h1>
            <p className="text-slate-600 mt-1">Acompanhe suas avaliacoes em andamento e organize sua rotina.</p>
            <p className="text-slate-500 text-sm mt-1">{administrador?.nome}</p>
          </div>

          {loading ? (
            <div className="bg-white p-12 rounded-lg border border-slate-200 text-center">
              <p className="text-slate-500">Carregando suas informacoes...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {psicologaStatsCards.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={stat.label}
                      className="bg-white p-6 rounded-xl border border-slate-200 hover:shadow-md transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                          <Icon size={24} className={stat.textColor} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-600">{stat.label}</p>
                          <p className={`text-2xl font-bold ${stat.textColor}`}>{stat.value}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {avaliacoesAtrasadas.length > 0 && (
                <div className="mb-8">
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <AlertTriangle size={20} className="text-amber-600" />
                      <h3 className="text-lg font-semibold text-amber-800">Atencao: Avaliacoes Pendentes</h3>
                    </div>
                    <div className="space-y-3">
                      {avaliacoesAtrasadas.map((avaliacao) => (
                        <div
                          key={avaliacao.id}
                          className="flex items-center justify-between bg-white p-4 rounded-lg border border-amber-100"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                              <Clock size={20} className="text-amber-600" />
                            </div>
                            <p className="text-sm text-slate-700">
                              A avaliacao de <span className="font-semibold text-slate-900">{avaliacao.colaborador_nome}</span> foi criada ha mais de {avaliacao.dias_atraso} dias e ainda nao foi finalizada.
                            </p>
                          </div>
                          <button
                            onClick={() => navigate(`/avaliacoes/${avaliacao.id}/edit`)}
                            className="px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors flex items-center gap-2"
                          >
                            <Edit3 size={16} />
                            Continuar Avaliacao
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-900">Minhas Avaliacoes Atribuidas</h3>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      type="text"
                      value={psicologaSearchTerm}
                      onChange={(e) => setPsicologaSearchTerm(e.target.value)}
                      placeholder="Buscar por nome ou empresa..."
                      className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                    />
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-3 px-4">
                          <button
                            onClick={() => handlePsicologaSort('colaborador')}
                            className={`flex items-center text-xs font-semibold uppercase tracking-wider ${
                              psicologaSortBy === 'colaborador' ? 'text-blue-600' : 'text-slate-600 hover:text-slate-800'
                            }`}
                          >
                            Nome do Colaborador
                            {psicologaSortBy === 'colaborador' && (
                              psicologaSortOrder === 'asc' ? <ArrowUp className="w-3 h-3 ml-1" /> : <ArrowDown className="w-3 h-3 ml-1" />
                            )}
                          </button>
                        </th>
                        <th className="text-left py-3 px-4">
                          <button
                            onClick={() => handlePsicologaSort('empresa')}
                            className={`flex items-center text-xs font-semibold uppercase tracking-wider ${
                              psicologaSortBy === 'empresa' ? 'text-blue-600' : 'text-slate-600 hover:text-slate-800'
                            }`}
                          >
                            Empresa
                            {psicologaSortBy === 'empresa' && (
                              psicologaSortOrder === 'asc' ? <ArrowUp className="w-3 h-3 ml-1" /> : <ArrowDown className="w-3 h-3 ml-1" />
                            )}
                          </button>
                        </th>
                        <th className="text-left py-3 px-4">
                          <button
                            onClick={() => handlePsicologaSort('status')}
                            className={`flex items-center text-xs font-semibold uppercase tracking-wider ${
                              psicologaSortBy === 'status' ? 'text-blue-600' : 'text-slate-600 hover:text-slate-800'
                            }`}
                          >
                            Status
                            {psicologaSortBy === 'status' && (
                              psicologaSortOrder === 'asc' ? <ArrowUp className="w-3 h-3 ml-1" /> : <ArrowDown className="w-3 h-3 ml-1" />
                            )}
                          </button>
                        </th>
                        <th className="text-right py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-600">
                          Acoes
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPsicologaAvaliacoes.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-slate-500">
                            {psicologaSearchTerm ? 'Nenhuma avaliacao encontrada com esse filtro' : 'Nenhuma avaliacao atribuida'}
                          </td>
                        </tr>
                      ) : (
                        filteredPsicologaAvaliacoes.map((avaliacao) => (
                          <tr key={avaliacao.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                            <td className="py-3 px-4">
                              <span className="font-medium text-slate-900">{avaliacao.colaborador_nome}</span>
                            </td>
                            <td className="py-3 px-4 text-slate-600">{avaliacao.empresa_nome}</td>
                            <td className="py-3 px-4">
                              {avaliacao.status === 'finalizada' ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Finalizada
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                  Rascunho
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-right">
                              {avaliacao.status === 'finalizada' ? (
                                <button
                                  onClick={() => navigate(`/avaliacoes/${avaliacao.id}/view`)}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                                >
                                  <Eye size={16} />
                                  Visualizar
                                </button>
                              ) : (
                                <button
                                  onClick={() => navigate(`/avaliacoes/${avaliacao.id}/edit`)}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                                >
                                  <Edit3 size={16} />
                                  Continuar Avaliacao
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 text-sm text-slate-500">
                  Mostrando {filteredPsicologaAvaliacoes.length} de {todasAvaliacoes.length} avaliacoes
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => navigate('/avaliacoes/new')}
                  className="flex items-center gap-4 p-5 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors group"
                >
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Plus size={24} className="text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-slate-900">Nova Avaliacao</p>
                    <p className="text-sm text-slate-600">Criar uma nova avaliacao</p>
                  </div>
                  <ArrowRight size={20} className="ml-auto text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </button>

                <button
                  onClick={() => navigate('/avaliacoes?filter=minhas-finalizadas')}
                  className="flex items-center gap-4 p-5 bg-green-50 border border-green-200 rounded-xl hover:bg-green-100 transition-colors group"
                >
                  <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                    <CheckCircle2 size={24} className="text-green-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-slate-900">Minhas Avaliacoes Finalizadas</p>
                    <p className="text-sm text-slate-600">Ver avaliacoes concluidas</p>
                  </div>
                  <ArrowRight size={20} className="ml-auto text-slate-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
                </button>

                <button
                  onClick={() => navigate('/modelos')}
                  className="flex items-center gap-4 p-5 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors group"
                >
                  <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center">
                    <BookOpen size={24} className="text-slate-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-slate-900">Modelos de Avaliacao</p>
                    <p className="text-sm text-slate-600">Gerenciar modelos</p>
                  </div>
                  <ArrowRight size={20} className="ml-auto text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all" />
                </button>
              </div>
            </>
          )}
        </div>
      </>
    );
  }

  const adminKPICards = [
    {
      label: 'Avaliações em Rascunho',
      value: adminStats.avaliacoesRascunho,
      icon: ClipboardList,
      bgColor: 'bg-amber-50',
      iconBg: 'bg-amber-100',
      textColor: 'text-amber-600',
      borderColor: 'border-amber-200',
    },
    {
      label: 'Avaliações Realizadas (Mês)',
      value: adminStats.avaliacoesEsteMes,
      icon: CheckCircle2,
      bgColor: 'bg-green-50',
      iconBg: 'bg-green-100',
      textColor: 'text-green-600',
      borderColor: 'border-green-200',
    },
    {
      label: 'Colaboradores com PDI',
      value: `${adminStats.percentualPDI}%`,
      icon: TrendingUp,
      bgColor: 'bg-blue-50',
      iconBg: 'bg-blue-100',
      textColor: 'text-blue-600',
      borderColor: 'border-blue-200',
    },
  ];

  return (
    <>
      <Header title="Dashboard" />

      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Bem vindo(a) ao Ascender Online
          </h1>
          <p className="text-slate-500 mt-1">
            {administrador?.nome}
          </p>
        </div>

        {loading ? (
          <div className="bg-white p-12 rounded-lg border border-slate-200 text-center">
            <p className="text-slate-500">Carregando informações do dashboard...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {adminKPICards.map((card) => {
                const Icon = card.icon;
                return (
                  <div
                    key={card.label}
                    className={`${card.bgColor} p-6 rounded-xl border ${card.borderColor} transition-all hover:shadow-md`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-xl ${card.iconBg} flex items-center justify-center`}>
                        <Icon size={28} className={card.textColor} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-600">{card.label}</p>
                        <p className={`text-3xl font-bold ${card.textColor}`}>
                          {typeof card.value === 'number' ? card.value.toLocaleString('pt-BR') : card.value}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle size={20} className="text-amber-500" />
                  <h3 className="text-lg font-semibold text-slate-900">Alertas & Pendências</h3>
                </div>
                {psicologasPendentes.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <CheckCircle2 size={48} className="mx-auto mb-3 text-green-300" />
                    <p>Nenhuma pendência encontrada</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {psicologasPendentes.map((psi) => (
                      <div
                        key={psi.id}
                        className="flex items-center justify-between p-4 bg-amber-50 border border-amber-100 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                            <Clock size={20} className="text-amber-600" />
                          </div>
                          <div>
                            <p className="text-sm text-slate-900">
                              <span className="font-medium">{psi.nome}</span> tem{' '}
                              <span className="font-bold text-amber-600">{psi.avaliacoesPendentes}</span>{' '}
                              {psi.avaliacoesPendentes === 1 ? 'avaliação pendente' : 'avaliações pendentes'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp size={20} className="text-blue-500" />
                  <h3 className="text-lg font-semibold text-slate-900">Engajamento da Plataforma</h3>
                </div>
                {engagementData.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <p>Carregando dados...</p>
                  </div>
                ) : (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={engagementData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis
                          dataKey="mes"
                          tick={{ fill: '#64748b', fontSize: 12 }}
                          axisLine={{ stroke: '#e2e8f0' }}
                        />
                        <YAxis
                          tick={{ fill: '#64748b', fontSize: 12 }}
                          axisLine={{ stroke: '#e2e8f0' }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#fff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                          }}
                        />
                        <Legend
                          wrapperStyle={{ paddingTop: '16px' }}
                          iconType="circle"
                        />
                        <Line
                          type="monotone"
                          dataKey="avaliacoesCriadas"
                          name="Avaliações Criadas"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          dot={{ fill: '#3b82f6', strokeWidth: 2 }}
                          activeDot={{ r: 6 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="avaliacoesRealizadas"
                          name="Avaliações Realizadas"
                          stroke="#10b981"
                          strokeWidth={2}
                          dot={{ fill: '#10b981', strokeWidth: 2 }}
                          activeDot={{ r: 6 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="pdisRegistrados"
                          name="PDIs Registrados"
                          stroke="#f59e0b"
                          strokeWidth={2}
                          dot={{ fill: '#f59e0b', strokeWidth: 2 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Building2 size={20} className="text-blue-500" />
                    <h3 className="text-lg font-semibold text-slate-900">Empresas Cadastradas</h3>
                  </div>
                  <button
                    onClick={() => navigate('/empresas')}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                  >
                    Ver todas
                    <ArrowRight size={16} />
                  </button>
                </div>
                {empresas.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <Building2 size={48} className="mx-auto mb-3 text-slate-300" />
                    <p>Nenhuma empresa cadastrada</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Empresa</th>
                          <th className="text-center py-3 px-4 text-sm font-semibold text-slate-600">Usuários</th>
                          <th className="text-center py-3 px-4 text-sm font-semibold text-slate-600">Avaliações Ativas</th>
                        </tr>
                      </thead>
                      <tbody>
                        {empresas.slice(0, 5).map((empresa) => (
                          <tr key={empresa.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                            <td className="py-3 px-4">
                              <span className="font-medium text-slate-900">{empresa.nome}</span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="inline-flex items-center justify-center min-w-[32px] h-7 px-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                {empresa.totalUsuarios}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="inline-flex items-center justify-center min-w-[32px] h-7 px-2 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                {empresa.avaliacoesAtivas}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Clock size={20} className="text-slate-500" />
                  <h3 className="text-lg font-semibold text-slate-900">Atividades Recentes</h3>
                </div>
                {activityLogs.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <Clock size={48} className="mx-auto mb-3 text-slate-300" />
                    <p>Nenhuma atividade registrada</p>
                    <p className="text-xs mt-2 text-slate-400">
                      As atividades serão exibidas conforme ações forem realizadas
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {activityLogs.map((log) => {
                      const Icon = getActivityIcon(log.entity_type);
                      const colorClass = getActivityColor(log.entity_type);
                      return (
                        <div
                          key={log.id}
                          className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                          <div className={`w-9 h-9 rounded-lg ${colorClass} flex items-center justify-center flex-shrink-0`}>
                            <Icon size={18} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-slate-900 leading-snug">{log.description}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-slate-500">{log.admin_name}</span>
                              <span className="text-xs text-slate-300">-</span>
                              <span className="text-xs text-slate-400">{formatRelativeTime(log.created_at)}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};
