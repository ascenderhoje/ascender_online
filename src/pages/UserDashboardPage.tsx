import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from '../utils/router';
import { supabase } from '../lib/supabase';
import {
  ClipboardList,
  TrendingUp,
  User,
  Calendar,
  Eye,
  Sparkles,
  BookOpen,
  Target,
  ArrowRight,
  Clock
} from 'lucide-react';
import { PDIContent, PDIUserContent, PDIUserAction, PDITag } from '../types';
import { PDIContentCard } from '../components/PDIContentCard';
import { useToast } from '../components/Toast';

interface Avaliacao {
  id: string;
  data_avaliacao: string;
  status: string;
  observacoes: string | null;
  modelo: {
    nome: string;
  } | null;
  psicologa: {
    nome: string;
  } | null;
  mediaGeral: number;
  tags: PDITag[];
}

interface NextActivity {
  type: 'action' | 'content';
  id: string;
  title: string;
  plannedDate: string;
}

export function UserDashboardPage() {
  const { pessoa } = useAuth();
  const { navigate } = useRouter();
  const { showToast } = useToast();
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [ultimaAvaliacao, setUltimaAvaliacao] = useState<Avaliacao | null>(null);
  const [pdiContents, setPdiContents] = useState<PDIUserContent[]>([]);
  const [pdiActions, setPdiActions] = useState<PDIUserAction[]>([]);
  const [recommendedContents, setRecommendedContents] = useState<PDIContent[]>([]);
  const [nextActivity, setNextActivity] = useState<NextActivity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (pessoa) {
      loadDashboardData();
    }
  }, [pessoa]);

  const loadDashboardData = async () => {
    if (!pessoa) return;

    try {
      setLoading(true);
      await Promise.all([
        loadAvaliacoes(),
        loadPDIData(),
        loadRecommendations(),
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAvaliacoes = async () => {
    if (!pessoa) return;

    const { data, error } = await supabase
      .from('avaliacoes')
      .select(`
        id,
        data_avaliacao,
        status,
        observacoes,
        modelos_avaliacao (
          nome
        ),
        psicologa:administradores!psicologa_responsavel_id (
          nome
        )
      `)
      .eq('colaborador_id', pessoa.id)
      .eq('status', 'finalizada')
      .order('data_avaliacao', { ascending: false });

    if (error) throw error;

    const avaliacoesFormatted: Avaliacao[] = [];

    for (const item of (data || [])) {
      const { data: competenciasData } = await supabase
        .from('avaliacoes_competencias')
        .select('pontuacao')
        .eq('avaliacao_id', item.id);

      const pontuacoes = (competenciasData || [])
        .map(p => Number(p.pontuacao))
        .filter(p => !isNaN(p) && p > 0);

      const mediaGeral = pontuacoes.length > 0
        ? pontuacoes.reduce((acc, val) => acc + val, 0) / pontuacoes.length
        : 0;

      const { data: tagsData } = await supabase
        .from('avaliacoes_textos')
        .select('sugestoes_desenvolvimento')
        .eq('avaliacao_id', item.id);

      let tags: PDITag[] = [];
      if (tagsData && tagsData.length > 0) {
        const sugestoes = tagsData[0]?.sugestoes_desenvolvimento;
        if (sugestoes && Array.isArray(sugestoes)) {
          const tagIds = sugestoes.map((s: any) => s.tag_id).filter(Boolean);
          if (tagIds.length > 0) {
            const { data: pdiTags } = await supabase
              .from('pdi_tags')
              .select('*')
              .in('id', tagIds);
            tags = pdiTags || [];
          }
        }
      }

      avaliacoesFormatted.push({
        id: item.id,
        data_avaliacao: item.data_avaliacao,
        status: item.status,
        observacoes: item.observacoes,
        modelo: (item as any).modelos_avaliacao ? { nome: (item as any).modelos_avaliacao.nome } : null,
        psicologa: (item as any).psicologa ? { nome: (item as any).psicologa.nome } : null,
        mediaGeral,
        tags,
      });
    }

    setAvaliacoes(avaliacoesFormatted);
    if (avaliacoesFormatted.length > 0) {
      setUltimaAvaliacao(avaliacoesFormatted[0]);
    }
  };

  const loadPDIData = async () => {
    if (!pessoa) return;

    const [contentsRes, actionsRes] = await Promise.all([
      supabase
        .from('pdi_user_contents')
        .select(`
          *,
          content:pdi_contents(*)
        `)
        .eq('user_id', pessoa.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('pdi_user_actions')
        .select('*')
        .eq('user_id', pessoa.id)
        .order('planned_due_date', { ascending: true }),
    ]);

    if (contentsRes.error) throw contentsRes.error;
    if (actionsRes.error) throw actionsRes.error;

    const contentsWithDetails = await Promise.all(
      (contentsRes.data || []).map(async (uc) => {
        const [tagsRes, mediaTypeRes] = await Promise.all([
          supabase
            .from('pdi_content_tags')
            .select('tag:pdi_tags(*)')
            .eq('content_id', uc.content_id),
          supabase
            .from('pdi_media_types')
            .select('*')
            .eq('id', uc.content?.media_type_id)
            .maybeSingle(),
        ]);

        return {
          ...uc,
          content: {
            ...uc.content,
            tags: tagsRes.data?.map((t: any) => t.tag) || [],
            media_type: mediaTypeRes.data,
          },
        };
      })
    );

    setPdiContents(contentsWithDetails);
    setPdiActions(actionsRes.data || []);

    const pendingActivities: NextActivity[] = [];

    (actionsRes.data || [])
      .filter(a => a.status !== 'concluido' && a.planned_due_date)
      .forEach(action => {
        pendingActivities.push({
          type: 'action',
          id: action.id,
          title: action.description,
          plannedDate: action.planned_due_date,
        });
      });

    contentsWithDetails
      .filter(uc => uc.status !== 'concluido' && uc.planned_due_date)
      .forEach(uc => {
        pendingActivities.push({
          type: 'content',
          id: uc.id,
          title: uc.content?.titulo || 'Conteudo',
          plannedDate: uc.planned_due_date!,
        });
      });

    pendingActivities.sort((a, b) =>
      new Date(a.plannedDate).getTime() - new Date(b.plannedDate).getTime()
    );

    setNextActivity(pendingActivities.length > 0 ? pendingActivities[0] : null);
  };

  const loadRecommendations = async () => {
    if (!pessoa?.id) return;

    try {
      const { data: recommendations, error } = await supabase.rpc(
        'get_user_pdi_tag_recommendations',
        { p_user_id: pessoa.id }
      );

      if (error) throw error;

      if (!recommendations || recommendations.length === 0) {
        setRecommendedContents([]);
        return;
      }

      const contentIds = recommendations.slice(0, 6).map((r: any) => r.content_id);
      const { data: contentsData, error: contentsError } = await supabase
        .from('pdi_contents')
        .select(`
          *,
          media_type:pdi_media_types(*)
        `)
        .in('id', contentIds)
        .eq('is_active', true);

      if (contentsError) throw contentsError;

      const contentsWithRelations = await Promise.all(
        (contentsData || []).map(async (content) => {
          const [tagsRes, competenciesRes, audiencesRes] = await Promise.all([
            supabase
              .from('pdi_content_tags')
              .select('tag:pdi_tags(*)')
              .eq('content_id', content.id),
            supabase
              .from('pdi_content_competencies')
              .select('competency:competencias(*)')
              .eq('content_id', content.id),
            supabase
              .from('pdi_content_audiences')
              .select('audience:pdi_audiences(*)')
              .eq('content_id', content.id),
          ]);

          return {
            ...content,
            tags: tagsRes.data?.map((t: any) => t.tag) || [],
            competencies: competenciesRes.data?.map((c: any) => c.competency) || [],
            audiences: audiencesRes.data?.map((a: any) => a.audience) || [],
          };
        })
      );

      const orderedContents = contentIds
        .map((id: string) => contentsWithRelations.find((c) => c.id === id))
        .filter((c): c is PDIContent => c !== undefined);

      setRecommendedContents(orderedContents);
    } catch (error: any) {
      console.error('Erro ao carregar recomendações:', error);
    }
  };

  const handleAddRecommendedContent = async (content: PDIContent) => {
    if (!pessoa?.id) return;

    try {
      const { error } = await supabase.from('pdi_user_contents').insert({
        user_id: pessoa.id,
        content_id: content.id,
        status: 'em_andamento',
      });

      if (error) {
        if (error.code === '23505') {
          showToast('error', 'Este conteúdo já está no seu PDI');
        } else {
          throw error;
        }
        return;
      }

      showToast('success', 'Conteúdo adicionado ao seu PDI');
      loadPDIData();
      loadRecommendations();
    } catch (error: any) {
      showToast('error', error.message || 'Erro ao adicionar conteúdo');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('pt-BR');
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

  const getMediaBadgeStyle = (media: number): string => {
    if (media >= 4.5) return 'bg-green-100 text-green-800';
    if (media >= 3.5) return 'bg-blue-100 text-blue-800';
    if (media >= 2.5) return 'bg-yellow-100 text-yellow-800';
    if (media >= 1.5) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const getPDIStatus = (): { label: string; color: string } => {
    const emAndamento = pdiContents.filter(c => c.status === 'em_andamento').length;
    const concluidos = pdiContents.filter(c => c.status === 'concluido').length;
    const total = pdiContents.length + pdiActions.length;

    if (total === 0) {
      return { label: 'Não Iniciado', color: 'text-gray-600' };
    }
    if (concluidos > 0 && emAndamento === 0) {
      return { label: 'Concluído', color: 'text-green-600' };
    }
    return { label: 'Em Andamento', color: 'text-blue-600' };
  };

  const firstName = pessoa?.nome?.split(' ')[0] || 'Usuário';
  const pdiStatus = getPDIStatus();
  const progressPercentage = ultimaAvaliacao ? (ultimaAvaliacao.mediaGeral / 5) * 100 : 0;
  const pdiEmAndamento = pdiContents.filter(c => c.status === 'em_andamento').slice(0, 3);
  const acoesEmAndamento = pdiActions.filter(a => a.status !== 'concluido').slice(0, 2);

  if (loading) {
    return (
      <div className="min-h-screen bg-ascender-neutral flex items-center justify-center">
        <p className="text-gray-500 font-nunito">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ascender-neutral">
      <div className="gradient-purple text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-20 w-32 h-32 rounded-full bg-ascender-yellow"></div>
          <div className="absolute bottom-10 left-20 w-24 h-24 rounded-full bg-ascender-purple-light"></div>
        </div>
        <div className="px-4 sm:px-6 lg:px-8 py-12 relative z-10">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg">
              <User className="w-10 h-10 text-ascender-purple" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-poppins font-bold mb-2">Olá, {firstName}!</h1>
              <p className="text-ascender-purple-light font-nunito text-base leading-relaxed max-w-3xl">
                Aqui você acompanha suas avaliações de potencial e constrói seu Plano de Desenvolvimento Individual (PDI).
                A avaliação de potencial é uma ferramenta que identifica suas principais competências, pontos fortes e
                oportunidades de melhoria. Com base nesses dados, você pode acessar conteúdos e organizar seu plano de
                desenvolvimento pessoal dentro do sistema.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-ascender-purple-light/20 rounded-xl flex items-center justify-center">
                <ClipboardList className="w-7 h-7 text-ascender-purple" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-nunito">Avaliações Finalizadas</p>
                <p className="text-3xl font-poppins font-bold text-ascender-purple">{avaliacoes.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-7 h-7 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-nunito">Status do PDI</p>
                <p className={`text-2xl font-poppins font-bold ${pdiStatus.color}`}>
                  {pdiStatus.label}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-ascender-yellow/20 rounded-xl flex items-center justify-center">
                <Calendar className="w-7 h-7 text-ascender-yellow-dark" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-600 font-nunito">Próxima Atividade</p>
                {nextActivity ? (
                  <div>
                    <p className="text-lg font-poppins font-bold text-gray-900 truncate" title={nextActivity.title}>
                      {formatDate(nextActivity.plannedDate)}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{nextActivity.title}</p>
                  </div>
                ) : (
                  <p className="text-lg font-poppins font-medium text-gray-400">Sem agenda</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200">
              <h2 className="text-xl font-poppins font-semibold text-gray-900">Resumo da Última Avaliação</h2>
            </div>

            {ultimaAvaliacao ? (
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-500 font-nunito">Data da avaliação</p>
                    <p className="font-poppins font-medium text-gray-900">{formatDate(ultimaAvaliacao.data_avaliacao)}</p>
                  </div>
                  {ultimaAvaliacao.modelo && (
                    <div className="text-right">
                      <p className="text-sm text-gray-500 font-nunito">Modelo</p>
                      <p className="font-poppins font-medium text-gray-900">{ultimaAvaliacao.modelo.nome}</p>
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm text-gray-600 font-nunito">Média Geral</p>
                    <div className="flex items-center gap-2">
                      <span className={`text-2xl font-poppins font-bold ${getMediaColor(ultimaAvaliacao.mediaGeral)}`}>
                        {ultimaAvaliacao.mediaGeral.toFixed(2)}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMediaBadgeStyle(ultimaAvaliacao.mediaGeral)}`}>
                        {getMediaLabel(ultimaAvaliacao.mediaGeral)}
                      </span>
                    </div>
                  </div>
                  <div className="relative h-6 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="absolute top-0 left-0 h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${progressPercentage}%`,
                        background: 'linear-gradient(90deg, #EF4444 0%, #F97316 20%, #EAB308 40%, #22C55E 60%, #3B82F6 100%)',
                      }}
                    />
                  </div>
                  <div className="flex justify-between mt-1 text-xs text-gray-400">
                    <span>0</span>
                    <span>5</span>
                  </div>
                </div>

                {ultimaAvaliacao.tags && ultimaAvaliacao.tags.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 font-nunito mb-2">Áreas de Desenvolvimento</p>
                    <div className="flex flex-wrap gap-2">
                      {ultimaAvaliacao.tags.map(tag => (
                        <span
                          key={tag.id}
                          className="px-3 py-1 bg-ascender-purple-light/20 text-ascender-purple rounded-full text-sm font-medium"
                        >
                          {tag.nome}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => navigate(`/user-avaliacao/${ultimaAvaliacao.id}`)}
                  className="w-full mt-4 px-4 py-3 bg-ascender-purple text-white rounded-xl hover:bg-ascender-purple-dark transition-colors font-nunito font-medium flex items-center justify-center gap-2"
                >
                  <Eye className="w-5 h-5" />
                  Ver Avaliação Completa
                </button>
              </div>
            ) : (
              <div className="p-12 text-center">
                <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-nunito mb-2">Você ainda não possui avaliações finalizadas</p>
                <p className="text-sm text-gray-400 font-nunito">
                  Quando sua primeira avaliação for concluída, os resultados aparecerão aqui.
                </p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-poppins font-semibold text-gray-900">Acompanhamento do PDI</h2>
              <button
                onClick={() => navigate('/meu-pdi')}
                className="text-sm text-ascender-purple hover:underline font-nunito flex items-center gap-1"
              >
                Ver Completo
                <ArrowRight size={16} />
              </button>
            </div>

            {pdiEmAndamento.length === 0 && acoesEmAndamento.length === 0 ? (
              <div className="p-8 text-center">
                <Target className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-nunito mb-2">Seu PDI ainda está vazio</p>
                <p className="text-sm text-gray-400 font-nunito mb-4">
                  Monte seu plano de desenvolvimento com base na sua avaliação
                </p>
                <button
                  onClick={() => navigate('/pdi/biblioteca')}
                  className="px-4 py-2 bg-ascender-purple text-white rounded-xl hover:bg-ascender-purple-dark transition-colors font-nunito font-medium inline-flex items-center gap-2"
                >
                  <BookOpen size={18} />
                  Explorar Biblioteca
                </button>
              </div>
            ) : (
              <div className="p-6">
                {pdiEmAndamento.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 font-nunito mb-3">Conteúdos em Andamento</p>
                    <div className="space-y-3">
                      {pdiEmAndamento.map(uc => (
                        <div key={uc.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <BookOpen size={18} className="text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {uc.content?.titulo}
                            </p>
                            {uc.planned_due_date && (
                              <p className="text-xs text-gray-500 flex items-center gap-1">
                                <Clock size={12} />
                                {formatDate(uc.planned_due_date)}
                              </p>
                            )}
                          </div>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                            Em andamento
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {acoesEmAndamento.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 font-nunito mb-3">Ações Personalizadas</p>
                    <div className="space-y-3">
                      {acoesEmAndamento.map(action => (
                        <div key={action.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-10 h-10 bg-ascender-yellow/20 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Target size={18} className="text-ascender-yellow-dark" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {action.description}
                            </p>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <Clock size={12} />
                              {formatDate(action.planned_due_date)}
                            </p>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                            action.status === 'concluido'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {action.status === 'concluido' ? 'Concluído' : 'Em andamento'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => navigate('/meu-pdi')}
                  className="w-full mt-4 px-4 py-3 border border-ascender-purple text-ascender-purple rounded-xl hover:bg-ascender-purple-light/10 transition-colors font-nunito font-medium flex items-center justify-center gap-2"
                >
                  Ver PDI Completo
                  <ArrowRight size={18} />
                </button>
              </div>
            )}
          </div>
        </div>

        {recommendedContents.length > 0 && (
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-ascender-yellow" />
                <h2 className="text-xl font-poppins font-semibold text-gray-900">Conteúdos Recomendados</h2>
              </div>
              <button
                onClick={() => navigate('/pdi/biblioteca')}
                className="text-sm text-ascender-purple hover:underline font-nunito flex items-center gap-1"
              >
                Ver mais conteúdos
                <ArrowRight size={16} />
              </button>
            </div>

            <div className="p-6">
              <p className="text-sm text-gray-600 font-nunito mb-6">
                Sugestões baseadas nas áreas de desenvolvimento identificadas na sua avaliação
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {recommendedContents.slice(0, 4).map(content => (
                  <PDIContentCard
                    key={content.id}
                    content={content}
                    isAdded={pdiContents.some(pc => pc.content_id === content.id)}
                    onAdd={handleAddRecommendedContent}
                    showActions={true}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {avaliacoes.length > 1 && (
          <div className="mt-8 bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200">
              <h2 className="text-xl font-poppins font-semibold text-gray-900">Histórico de Avaliações</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-nunito font-semibold text-gray-500 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-nunito font-semibold text-gray-500 uppercase tracking-wider">
                      Modelo
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-nunito font-semibold text-gray-500 uppercase tracking-wider">
                      Média
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-nunito font-semibold text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {avaliacoes.slice(1).map((avaliacao) => (
                    <tr key={avaliacao.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-nunito text-gray-900">
                        {formatDate(avaliacao.data_avaliacao)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-nunito text-gray-600">
                        {avaliacao.modelo?.nome || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`font-poppins font-bold ${getMediaColor(avaliacao.mediaGeral)}`}>
                          {avaliacao.mediaGeral.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <button
                          onClick={() => navigate(`/user-avaliacao/${avaliacao.id}`)}
                          className="inline-flex items-center gap-2 px-4 py-2 text-ascender-purple hover:bg-ascender-purple-light/10 rounded-xl transition-colors font-nunito font-medium"
                        >
                          <Eye className="w-4 h-4" />
                          Visualizar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
