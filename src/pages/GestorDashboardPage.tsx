import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from '../utils/router';
import { supabase } from '../lib/supabase';
import { Users, Sparkles, ClipboardCheck, Briefcase, TrendingUp, FileText, AlertCircle, CheckCircle } from 'lucide-react';

interface DashboardStats {
  totalColaboradores: number;
  mediaGeral: number;
  avaliacoesFinalizadasMes: number;
  avaliacoesPorFuncao: Record<string, number>;
  pdisEmAndamento: number;
  pdisConcluidos: number;
  pdisAtrasados: number;
}

interface ColaboradorResumo {
  id: string;
  nome: string;
  funcao: string | null;
  avatar_url: string | null;
  avaliacoesFinalizadas: number;
  statusPDI: 'em_dia' | 'em_atraso' | 'sem_avaliacao';
  ultimaAvaliacaoData: string | null;
}

export function GestorDashboardPage() {
  const { pessoa } = useAuth();
  const { navigate } = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalColaboradores: 0,
    mediaGeral: 0,
    avaliacoesFinalizadasMes: 0,
    avaliacoesPorFuncao: {},
    pdisEmAndamento: 0,
    pdisConcluidos: 0,
    pdisAtrasados: 0,
  });
  const [colaboradores, setColaboradores] = useState<ColaboradorResumo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (pessoa) {
      loadDashboardData();
    }
  }, [pessoa]);

  const getMonthDateRange = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const formatDate = (date: Date) => {
      return date.toISOString().split('T')[0];
    };

    return {
      start: formatDate(firstDay),
      end: formatDate(lastDay),
    };
  };

  const loadDashboardData = async () => {
    if (!pessoa) return;

    try {
      setLoading(true);

      const { data: gruposGestorData, error: gruposError } = await supabase
        .from('grupos_gestores')
        .select('grupo_id')
        .eq('pessoa_id', pessoa.id);

      if (gruposError) throw gruposError;

      const gruposIds = (gruposGestorData || []).map(g => g.grupo_id);

      if (gruposIds.length === 0) {
        setStats({
          totalColaboradores: 0,
          mediaGeral: 0,
          avaliacoesFinalizadasMes: 0,
          avaliacoesPorFuncao: {},
          pdisEmAndamento: 0,
          pdisConcluidos: 0,
          pdisAtrasados: 0,
        });
        setColaboradores([]);
        setLoading(false);
        return;
      }

      const { data: pessoasGruposData, error: pessoasGruposError } = await supabase
        .from('pessoas_grupos')
        .select(`
          pessoa_id,
          pessoas (
            id,
            nome,
            email,
            funcao,
            avatar_url
          )
        `)
        .in('grupo_id', gruposIds);

      if (pessoasGruposError) throw pessoasGruposError;

      const colaboradoresMap = new Map<string, { id: string; nome: string; funcao: string | null; avatar_url: string | null }>();
      (pessoasGruposData || []).forEach((item: any) => {
        if (item.pessoas && !colaboradoresMap.has(item.pessoas.id)) {
          colaboradoresMap.set(item.pessoas.id, {
            id: item.pessoas.id,
            nome: item.pessoas.nome,
            funcao: item.pessoas.funcao,
            avatar_url: item.pessoas.avatar_url,
          });
        }
      });

      const colaboradoresList = Array.from(colaboradoresMap.values());
      const colaboradoresIds = colaboradoresList.map(c => c.id);
      const totalColaboradores = colaboradoresList.length;

      if (colaboradoresIds.length === 0) {
        setStats({
          totalColaboradores: 0,
          mediaGeral: 0,
          avaliacoesFinalizadasMes: 0,
          avaliacoesPorFuncao: {},
          pdisEmAndamento: 0,
          pdisConcluidos: 0,
          pdisAtrasados: 0,
        });
        setColaboradores([]);
        setLoading(false);
        return;
      }

      const { data: avaliacoesData, error: avaliacoesError } = await supabase
        .from('avaliacoes')
        .select('id, colaborador_id, data_avaliacao')
        .in('colaborador_id', colaboradoresIds)
        .eq('status', 'finalizada')
        .order('data_avaliacao', { ascending: false });

      if (avaliacoesError) throw avaliacoesError;

      const avaliacoesList = avaliacoesData || [];
      const avaliacoesIds = avaliacoesList.map(a => a.id);

      const { start: mesInicio, end: mesFim } = getMonthDateRange();
      const avaliacoesMes = avaliacoesList.filter(a => {
        const dataAv = a.data_avaliacao;
        return dataAv >= mesInicio && dataAv <= mesFim;
      });

      let mediaGeral = 0;
      if (avaliacoesIds.length > 0) {
        const { data: pontuacoesData, error: pontuacoesError } = await supabase
          .from('avaliacoes_competencias')
          .select('pontuacao')
          .in('avaliacao_id', avaliacoesIds);

        if (pontuacoesError) throw pontuacoesError;

        const pontuacoes = (pontuacoesData || [])
          .map(p => Number(p.pontuacao))
          .filter(p => !isNaN(p) && p > 0);

        if (pontuacoes.length > 0) {
          mediaGeral = pontuacoes.reduce((acc, val) => acc + val, 0) / pontuacoes.length;
        }
      }

      const avaliacoesPorFuncao: Record<string, number> = {};
      avaliacoesMes.forEach(av => {
        const colab = colaboradoresMap.get(av.colaborador_id);
        if (colab) {
          const funcao = colab.funcao || 'Sem Função';
          avaliacoesPorFuncao[funcao] = (avaliacoesPorFuncao[funcao] || 0) + 1;
        }
      });

      const colaboradoresComAvaliacaoFinalizada = new Set<string>();
      avaliacoesList.forEach(av => {
        colaboradoresComAvaliacaoFinalizada.add(av.colaborador_id);
      });

      const { data: pdiContentsData, error: pdiError } = await supabase
        .from('pdi_user_contents')
        .select('user_id, status')
        .in('user_id', colaboradoresIds);

      if (pdiError) throw pdiError;

      const colaboradoresComPDI = new Set<string>();
      let pdisEmAndamento = 0;
      let pdisConcluidos = 0;

      (pdiContentsData || []).forEach((pdi: any) => {
        colaboradoresComPDI.add(pdi.user_id);
        if (pdi.status === 'concluido') {
          pdisConcluidos++;
        } else if (pdi.status === 'em_andamento') {
          pdisEmAndamento++;
        }
      });

      let pdisAtrasados = 0;
      colaboradoresComAvaliacaoFinalizada.forEach(colabId => {
        if (!colaboradoresComPDI.has(colabId)) {
          pdisAtrasados++;
        }
      });

      setStats({
        totalColaboradores,
        mediaGeral,
        avaliacoesFinalizadasMes: avaliacoesMes.length,
        avaliacoesPorFuncao,
        pdisEmAndamento,
        pdisConcluidos,
        pdisAtrasados,
      });

      const ultimaAvaliacaoMap = new Map<string, string>();
      const avaliacoesCountMap = new Map<string, number>();

      avaliacoesList.forEach(av => {
        avaliacoesCountMap.set(av.colaborador_id, (avaliacoesCountMap.get(av.colaborador_id) || 0) + 1);
        if (!ultimaAvaliacaoMap.has(av.colaborador_id)) {
          ultimaAvaliacaoMap.set(av.colaborador_id, av.data_avaliacao);
        }
      });

      const colaboradoresResumo: ColaboradorResumo[] = colaboradoresList.map(colab => {
        const temAvaliacaoFinalizada = colaboradoresComAvaliacaoFinalizada.has(colab.id);
        const temPDI = colaboradoresComPDI.has(colab.id);

        let statusPDI: 'em_dia' | 'em_atraso' | 'sem_avaliacao';
        if (!temAvaliacaoFinalizada) {
          statusPDI = 'sem_avaliacao';
        } else if (temPDI) {
          statusPDI = 'em_dia';
        } else {
          statusPDI = 'em_atraso';
        }

        return {
          id: colab.id,
          nome: colab.nome,
          funcao: colab.funcao,
          avatar_url: colab.avatar_url,
          avaliacoesFinalizadas: avaliacoesCountMap.get(colab.id) || 0,
          statusPDI,
          ultimaAvaliacaoData: ultimaAvaliacaoMap.get(colab.id) || null,
        };
      });

      colaboradoresResumo.sort((a, b) => {
        if (!a.ultimaAvaliacaoData && !b.ultimaAvaliacaoData) return 0;
        if (!a.ultimaAvaliacaoData) return 1;
        if (!b.ultimaAvaliacaoData) return -1;
        return b.ultimaAvaliacaoData.localeCompare(a.ultimaAvaliacaoData);
      });

      setColaboradores(colaboradoresResumo.slice(0, 10));

    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMediaLabel = (media: number): string => {
    if (media >= 4.5) return 'Excelente';
    if (media >= 3.5) return 'Bom';
    if (media >= 2.5) return 'Regular';
    if (media >= 1.5) return 'Baixo';
    return 'Muito Baixo';
  };

  const getMediaColor = (media: number): string => {
    if (media >= 4.5) return 'text-green-600';
    if (media >= 3.5) return 'text-blue-600';
    if (media >= 2.5) return 'text-yellow-600';
    if (media >= 1.5) return 'text-orange-600';
    return 'text-red-600';
  };

  const getInitials = (nome: string) => {
    const names = nome.split(' ');
    if (names.length >= 2) {
      return `${names[0].charAt(0)}${names[1].charAt(0)}`.toUpperCase();
    }
    return nome.charAt(0).toUpperCase();
  };

  const getStatusPDIBadge = (status: 'em_dia' | 'em_atraso' | 'sem_avaliacao') => {
    switch (status) {
      case 'em_dia':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle size={12} />
            Em dia
          </span>
        );
      case 'em_atraso':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <AlertCircle size={12} />
            Em atraso
          </span>
        );
      case 'sem_avaliacao':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
            Sem avaliacao
          </span>
        );
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('pt-BR');
  };

  const getCurrentMonthName = () => {
    const months = [
      'Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return months[new Date().getMonth()];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-ascender-neutral flex items-center justify-center">
        <p className="text-gray-500 font-nunito">Carregando...</p>
      </div>
    );
  }

  const progressPercentage = stats.mediaGeral > 0 ? (stats.mediaGeral / 5) * 100 : 0;
  const funcoesList = Object.entries(stats.avaliacoesPorFuncao).sort((a, b) => b[1] - a[1]);

  return (
    <div className="min-h-screen bg-ascender-neutral">
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="gradient-purple text-white rounded-3xl p-8 mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-20">
            <div className="relative">
              <Sparkles className="absolute top-4 right-12 w-12 h-12" />
              <Sparkles className="absolute top-12 right-24 w-8 h-8" />
              <div className="w-48 h-48 rounded-full bg-white/10 blur-3xl"></div>
            </div>
          </div>
          <div className="relative z-10">
            <h1 className="text-4xl font-poppins font-bold mb-4">
              Ola, {pessoa?.nome?.split(' ')[0]} :)
            </h1>
            <p className="text-lg font-nunito mb-2">
              Aqui voce tera acesso ao desenvolvimento de cada colaborador que faz parte da sua equipe, alem de acompanhar, gerenciar e dar muito feedback!
            </p>
            <p className="text-base font-nunito mt-4 font-semibold">
              Um sistema mais completo para voce e sua equipe!
            </p>
            <p className="text-base font-nunito mt-2">
              Voce esta pronto para essa jornada?
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-ascender-purple-light/30 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-ascender-purple" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-nunito">Total de Colaboradores</p>
                <p className="text-3xl font-poppins font-bold text-ascender-purple">
                  {stats.totalColaboradores}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <ClipboardCheck className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-nunito">Avaliacoes em {getCurrentMonthName()}</p>
                <p className="text-3xl font-poppins font-bold text-blue-600">
                  {stats.avaliacoesFinalizadasMes}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 md:col-span-2">
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm text-gray-600 font-nunito">Media geral do time</p>
                <span className={`text-2xl font-poppins font-bold ${getMediaColor(stats.mediaGeral)}`}>
                  {stats.mediaGeral.toFixed(2)}
                </span>
              </div>
              <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${progressPercentage}%`,
                    background: 'linear-gradient(90deg, #EF4444 0%, #F97316 20%, #EAB308 40%, #22C55E 60%, #3B82F6 100%)',
                  }}
                />
              </div>
              <div className="flex justify-end mt-2">
                <span className={`text-sm font-nunito font-semibold ${getMediaColor(stats.mediaGeral)}`}>
                  ({getMediaLabel(stats.mediaGeral)})
                </span>
              </div>
            </div>
          </div>
        </div>

        {funcoesList.length > 0 && (
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-gray-600" />
              </div>
              <h3 className="text-lg font-poppins font-semibold text-gray-900">
                Avaliacoes por Funcao ({getCurrentMonthName()})
              </h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {funcoesList.map(([funcao, count]) => (
                <div key={funcao} className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-poppins font-bold text-gray-900">{count}</p>
                  <p className="text-xs font-nunito text-gray-600 truncate" title={funcao}>{funcao}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-6 h-6" />
              <h3 className="text-lg font-poppins font-semibold">PDIs Em Andamento</h3>
            </div>
            <p className="text-5xl font-poppins font-bold">{stats.pdisEmAndamento}</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-6 h-6" />
              <h3 className="text-lg font-poppins font-semibold">PDIs Concluidos</h3>
            </div>
            <p className="text-5xl font-poppins font-bold">{stats.pdisConcluidos}</p>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center gap-3 mb-2">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-lg font-poppins font-semibold">PDIs Em Atraso</h3>
            </div>
            <p className="text-5xl font-poppins font-bold">{stats.pdisAtrasados}</p>
            <p className="text-xs mt-1 opacity-80 font-nunito">Sem conteudo adicionado</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-poppins font-semibold text-gray-900">
              Colaboradores Recentes
            </h3>
            <p className="text-sm text-gray-600 font-nunito">
              Ordenados pela data da ultima avaliacao finalizada
            </p>
          </div>

          {colaboradores.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500 font-nunito">Nenhum colaborador encontrado nos grupos que voce gerencia.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-poppins font-semibold text-gray-500 uppercase tracking-wider">
                      Colaborador
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-poppins font-semibold text-gray-500 uppercase tracking-wider">
                      Funcao
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-poppins font-semibold text-gray-500 uppercase tracking-wider">
                      Avaliacoes
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-poppins font-semibold text-gray-500 uppercase tracking-wider">
                      Ultima Avaliacao
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-poppins font-semibold text-gray-500 uppercase tracking-wider">
                      Status PDI
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-poppins font-semibold text-gray-500 uppercase tracking-wider">
                      Acoes
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {colaboradores.map((colab, index) => (
                    <tr key={colab.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {colab.avatar_url ? (
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={colab.avatar_url}
                              alt={colab.nome}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-ascender-yellow to-yellow-500 flex items-center justify-center shadow-sm">
                              <span className="text-white font-poppins font-bold text-sm">
                                {getInitials(colab.nome)}
                              </span>
                            </div>
                          )}
                          <span className="text-sm font-poppins font-medium text-gray-900">
                            {colab.nome}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-nunito text-gray-600">
                        {colab.funcao || '-'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {colab.avaliacoesFinalizadas}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-sm font-nunito text-gray-600">
                        {formatDate(colab.ultimaAvaliacaoData)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {getStatusPDIBadge(colab.statusPDI)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => navigate(`/gestor-pessoa/${colab.id}`)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-nunito text-ascender-purple hover:bg-ascender-purple-light/10 rounded-lg transition-colors"
                          >
                            <FileText size={14} />
                            Relatorio
                          </button>
                          <button
                            onClick={() => navigate(`/gestor-pessoa/${colab.id}?tab=pdi`)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-nunito text-ascender-purple hover:bg-ascender-purple-light/10 rounded-lg transition-colors"
                          >
                            <TrendingUp size={14} />
                            PDI
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {colaboradores.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => navigate('/gestor-pessoas')}
                className="text-sm font-nunito text-ascender-purple hover:underline"
              >
                Ver todos os colaboradores
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
