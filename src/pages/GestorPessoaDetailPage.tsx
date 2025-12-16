import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from '../utils/router';
import { supabase } from '../lib/supabase';
import { ArrowLeft, User, ClipboardList, Eye, Calendar, TrendingUp, ListChecks } from 'lucide-react';
import { Button } from '../components/Button';
import { PDIContentCard } from '../components/PDIContentCard';
import { PDIRatingStars } from '../components/PDIRatingStars';
import { PDIContent, PDIUserContent, PDIUserAction } from '../types';

interface Pessoa {
  id: string;
  nome: string;
  email: string;
  funcao: string | null;
  avatar_url: string | null;
}

interface Avaliacao {
  id: string;
  data_avaliacao: string;
  status: string;
  psicologa: {
    nome: string;
  } | null;
  modelo: {
    nome: string;
  } | null;
}

export function GestorPessoaDetailPage() {
  const { params, navigate, currentPath } = useRouter();
  const { pessoa: gestorPessoa } = useAuth();
  const [pessoa, setPessoa] = useState<Pessoa | null>(null);
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [userContents, setUserContents] = useState<PDIUserContent[]>([]);
  const [userActions, setUserActions] = useState<PDIUserAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'avaliacoes' | 'pdi' | 'acoes'>('avaliacoes');

  useEffect(() => {
    if (params.id) {
      checkAccessAndLoadData(params.id);
    }
  }, [params.id, gestorPessoa]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');
    if (tab === 'pdi' || tab === 'acoes') {
      setActiveTab(tab);
    }
  }, [currentPath]);

  const checkAccessAndLoadData = async (pessoaId: string) => {
    if (!gestorPessoa) return;

    try {
      setLoading(true);

      const { data: gruposGestorData, error: gruposError } = await supabase
        .from('grupos_gestores')
        .select('grupo_id')
        .eq('pessoa_id', gestorPessoa.id);

      if (gruposError) throw gruposError;

      const gruposIds = (gruposGestorData || []).map(g => g.grupo_id);

      if (gruposIds.length === 0) {
        setHasAccess(false);
        return;
      }

      const { data: pessoaGrupoData, error: pessoaGrupoError } = await supabase
        .from('pessoas_grupos')
        .select('pessoa_id')
        .eq('pessoa_id', pessoaId)
        .in('grupo_id', gruposIds)
        .maybeSingle();

      if (pessoaGrupoError) throw pessoaGrupoError;

      if (!pessoaGrupoData) {
        setHasAccess(false);
        return;
      }

      setHasAccess(true);

      const { data: pessoaData, error: pessoaError } = await supabase
        .from('pessoas')
        .select('id, nome, email, funcao, avatar_url')
        .eq('id', pessoaId)
        .maybeSingle();

      if (pessoaError) throw pessoaError;

      if (!pessoaData) {
        navigate('/gestor-pessoas');
        return;
      }

      setPessoa(pessoaData);

      const { data: avaliacoesData, error: avaliacoesError } = await supabase
        .from('avaliacoes')
        .select(`
          id,
          data_avaliacao,
          status,
          psicologa:administradores!psicologa_responsavel_id (
            nome
          ),
          modelo:modelos_avaliacao (
            nome
          )
        `)
        .eq('colaborador_id', pessoaId)
        .eq('status', 'finalizada')
        .order('data_avaliacao', { ascending: false });

      if (avaliacoesError) throw avaliacoesError;

      const formattedAvaliacoes = (avaliacoesData || []).map((item: any) => ({
        id: item.id,
        data_avaliacao: item.data_avaliacao,
        status: item.status,
        psicologa: item.psicologa ? { nome: item.psicologa.nome } : null,
        modelo: item.modelo ? { nome: item.modelo.nome } : null,
      }));

      setAvaliacoes(formattedAvaliacoes);

      const [contentsRes, actionsRes] = await Promise.all([
        supabase
          .from('pdi_user_contents')
          .select(`
            *,
            content:pdi_contents(*)
          `)
          .eq('user_id', pessoaId)
          .order('created_at', { ascending: false }),
        supabase
          .from('pdi_user_actions')
          .select('*')
          .eq('user_id', pessoaId)
          .order('planned_due_date', { ascending: true }),
      ]);

      if (contentsRes.data) {
        const contentsWithDetails = await Promise.all(
          contentsRes.data.map(async (uc) => {
            const [tagsRes, mediaTypeRes] = await Promise.all([
              supabase
                .from('pdi_content_tags')
                .select('tag:pdi_tags(*)')
                .eq('content_id', uc.content_id),
              supabase
                .from('pdi_media_types')
                .select('*')
                .eq('id', uc.content.media_type_id)
                .single(),
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

        setUserContents(contentsWithDetails);
      }

      if (actionsRes.data) {
        setUserActions(actionsRes.data);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'concluida':
        return 'Concluída';
      case 'finalizada':
        return 'Finalizada';
      case 'em_andamento':
        return 'Em Andamento';
      case 'pendente':
        return 'Pendente';
      case 'rascunho':
        return 'Rascunho';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'concluida':
      case 'finalizada':
        return 'bg-green-100 text-green-700';
      case 'em_andamento':
        return 'bg-blue-100 text-blue-700';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-700';
      case 'rascunho':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Carregando...</p>
      </div>
    );
  }

  if (!hasAccess || !pessoa) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Você não tem acesso a esta pessoa.</p>
          <Button onClick={() => navigate('/gestor-pessoas')}>
            Voltar para Pessoas
          </Button>
        </div>
      </div>
    );
  }

  const upcomingContents = userContents.filter((uc) => uc.status === 'em_andamento');
  const completedContents = userContents.filter((uc) => uc.status === 'concluido');

  return (
    <div className="min-h-screen bg-ascender-neutral">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          variant="secondary"
          onClick={() => navigate('/gestor-pessoas')}
          className="mb-4 bg-white hover:bg-gray-50 text-ascender-purple border-gray-300"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 h-16 w-16">
              {pessoa.avatar_url ? (
                <img
                  className="h-16 w-16 rounded-full object-cover"
                  src={pessoa.avatar_url}
                  alt={pessoa.nome}
                />
              ) : (
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-ascender-purple to-ascender-purple-dark flex items-center justify-center shadow-md">
                  <User className="w-8 h-8 text-white" />
                </div>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-poppins font-bold text-ascender-purple">{pessoa.nome}</h1>
              <p className="text-gray-600 font-nunito mt-1">{pessoa.email}</p>
              {pessoa.funcao && (
                <p className="text-sm text-gray-500 font-nunito mt-1">{pessoa.funcao}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2 border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('avaliacoes')}
            className={`px-4 py-3 text-sm font-nunito font-medium transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === 'avaliacoes'
                ? 'border-ascender-purple text-ascender-purple'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <ClipboardList size={18} />
            Avaliações
          </button>
          <button
            onClick={() => setActiveTab('pdi')}
            className={`px-4 py-3 text-sm font-nunito font-medium transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === 'pdi'
                ? 'border-ascender-purple text-ascender-purple'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <TrendingUp size={18} />
            PDI
            {userContents.length > 0 && (
              <span className="bg-ascender-purple text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                {userContents.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('acoes')}
            className={`px-4 py-3 text-sm font-nunito font-medium transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === 'acoes'
                ? 'border-ascender-purple text-ascender-purple'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <ListChecks size={18} />
            Ações
            {userActions.length > 0 && (
              <span className="bg-ascender-purple text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                {userActions.length}
              </span>
            )}
          </button>
        </div>

        {activeTab === 'avaliacoes' && (
          <div className="bg-white rounded-2xl shadow-md border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-poppins font-semibold text-ascender-purple">Avaliações</h2>
            </div>

            {avaliacoes.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <ClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 font-nunito">Nenhuma avaliação registrada para esta pessoa.</p>
              </div>
            ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Modelo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Psicóloga
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {avaliacoes.map((avaliacao) => (
                    <tr key={avaliacao.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          {formatDate(avaliacao.data_avaliacao)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {avaliacao.modelo?.nome || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {avaliacao.psicologa?.nome || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(avaliacao.status)}`}>
                          {getStatusLabel(avaliacao.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <button
                          onClick={() => navigate(`/user-avaliacao/${avaliacao.id}`)}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-ascender-purple text-white rounded-lg hover:bg-ascender-purple-dark transition-colors font-nunito"
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
            )}
          </div>
        )}

        {activeTab === 'pdi' && (
          <div>
            {userContents.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-12 text-center">
                <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 font-nunito">Nenhum conteúdo PDI registrado para esta pessoa.</p>
              </div>
            ) : (
              <>
                {upcomingContents.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-lg font-poppins font-semibold text-ascender-purple mb-4">
                      Em Andamento ({upcomingContents.length})
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {upcomingContents.map((uc) => (
                        <PDIContentCard
                          key={uc.id}
                          content={uc.content as PDIContent}
                          plannedDate={uc.planned_due_date}
                          status={uc.status}
                          showActions={false}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {completedContents.length > 0 && (
                  <div>
                    <h2 className="text-lg font-poppins font-semibold text-ascender-purple mb-4">
                      Concluídos ({completedContents.length})
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {completedContents.map((uc) => (
                        <div key={uc.id}>
                          <PDIContentCard
                            content={uc.content as PDIContent}
                            status={uc.status}
                            showActions={false}
                          />
                          {uc.rating_stars && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs text-gray-600 font-nunito">Avaliação:</span>
                                <PDIRatingStars rating={uc.rating_stars} size={14} />
                              </div>
                              {uc.rating_comment && (
                                <p className="text-xs text-gray-600 font-nunito mt-1">{uc.rating_comment}</p>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === 'acoes' && (
          <div className="bg-white rounded-2xl shadow-md border border-gray-200">
            {userActions.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <ListChecks className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 font-nunito">Nenhuma ação registrada para esta pessoa.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {userActions.map((action) => (
                  <div key={action.id} className="p-4 flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-nunito font-medium text-gray-900">{action.description}</p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-500 font-nunito">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(action.planned_due_date).toLocaleDateString('pt-BR')}
                        </span>
                        {action.investment_cents && (
                          <span>
                            R$ {(action.investment_cents / 100).toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-nunito font-medium rounded ${
                        action.status === 'concluido'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {action.status === 'concluido' ? 'Concluído' : 'Em Andamento'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
