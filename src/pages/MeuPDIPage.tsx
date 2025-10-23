import { useState, useEffect } from 'react';
import { Calendar, CheckCircle, Trash2, Plus, Sparkles } from 'lucide-react';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useToast } from '../components/Toast';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { PDIUserContent, PDIUserAction, PDIContent } from '../types';
import { PDIContentCard } from '../components/PDIContentCard';
import { PDIRatingStars } from '../components/PDIRatingStars';
import { useRouter } from '../utils/router';

export const MeuPDIPage = () => {
  const { showToast } = useToast();
  const { navigate } = useRouter();
  const { pessoa } = useAuth();
  const [activeTab, setActiveTab] = useState<'meu-pdi' | 'sugestoes'>('meu-pdi');
  const [userContents, setUserContents] = useState<PDIUserContent[]>([]);
  const [userActions, setUserActions] = useState<PDIUserAction[]>([]);
  const [recommendedContents, setRecommendedContents] = useState<PDIContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; id: string | null }>({ show: false, id: null });
  const [selectedUserContent, setSelectedUserContent] = useState<PDIUserContent | null>(null);

  const [completionForm, setCompletionForm] = useState({
    rating_stars: 0,
    rating_comment: '',
  });

  const [dateForm, setDateForm] = useState({
    planned_due_date: '',
  });

  useEffect(() => {
    if (pessoa?.id) {
      loadUserPDI();
      loadRecommendations();
    }
  }, [pessoa]);

  const loadUserPDI = async () => {
    if (!pessoa?.id) return;

    try {
      setLoading(true);
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
      setUserActions(actionsRes.data || []);
    } catch (error: any) {
      showToast('error', error.message || 'Erro ao carregar seu PDI');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveContent = async () => {
    if (!deleteConfirm.id) return;

    try {
      const { error } = await supabase.from('pdi_user_contents').delete().eq('id', deleteConfirm.id);
      if (error) throw error;
      showToast('success', 'Conteúdo removido do seu PDI');
      loadUserPDI();
    } catch (error: any) {
      showToast('error', error.message || 'Erro ao remover conteúdo');
    }
  };

  const handleOpenCompletionModal = (userContent: PDIUserContent) => {
    setSelectedUserContent(userContent);
    setCompletionForm({
      rating_stars: userContent.rating_stars || 0,
      rating_comment: userContent.rating_comment || '',
    });
    setShowCompletionModal(true);
  };

  const handleCompleteContent = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedUserContent) return;
    if (completionForm.rating_stars === 0) {
      showToast('error', 'Por favor, selecione uma avaliação em estrelas');
      return;
    }

    try {
      const { error } = await supabase
        .from('pdi_user_contents')
        .update({
          status: 'concluido',
          rating_stars: completionForm.rating_stars,
          rating_comment: completionForm.rating_comment.trim() || null,
        })
        .eq('id', selectedUserContent.id);

      if (error) throw error;
      showToast('success', 'Conteúdo marcado como concluído');
      setShowCompletionModal(false);
      loadUserPDI();
    } catch (error: any) {
      showToast('error', error.message || 'Erro ao concluir conteúdo');
    }
  };

  const handleOpenDateModal = (userContent: PDIUserContent) => {
    setSelectedUserContent(userContent);
    setDateForm({
      planned_due_date: userContent.planned_due_date || '',
    });
    setShowDateModal(true);
  };

  const handleUpdateDate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedUserContent) return;

    try {
      const { error } = await supabase
        .from('pdi_user_contents')
        .update({
          planned_due_date: dateForm.planned_due_date || null,
        })
        .eq('id', selectedUserContent.id);

      if (error) throw error;
      showToast('success', 'Data atualizada com sucesso');
      setShowDateModal(false);
      loadUserPDI();
    } catch (error: any) {
      showToast('error', error.message || 'Erro ao atualizar data');
    }
  };

  const loadRecommendations = async () => {
    if (!pessoa?.id) return;

    try {
      setLoadingRecommendations(true);
      const { data: recommendations, error } = await supabase.rpc(
        'get_user_pdi_tag_recommendations',
        { p_user_id: pessoa.id }
      );

      if (error) throw error;

      if (!recommendations || recommendations.length === 0) {
        setRecommendedContents([]);
        return;
      }

      const contentIds = recommendations.map((r: any) => r.content_id);
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
        .map((id: string) => contentsWithRelations.find((c: PDIContent) => c.id === id))
        .filter((c): c is PDIContent => c !== undefined);

      setRecommendedContents(orderedContents);
    } catch (error: any) {
      console.error('Erro ao carregar recomendações:', error);
    } finally {
      setLoadingRecommendations(false);
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
      loadUserPDI();
      loadRecommendations();
    } catch (error: any) {
      showToast('error', error.message || 'Erro ao adicionar conteúdo');
    }
  };

  const upcomingContents = userContents.filter((uc) => uc.status === 'em_andamento');
  const completedContents = userContents.filter((uc) => uc.status === 'concluido');

  return (
    <>
      <Header title="Meu PDI" />

      <div className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex gap-2 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('meu-pdi')}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                activeTab === 'meu-pdi'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Meu PDI
            </button>
            <button
              onClick={() => setActiveTab('sugestoes')}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${
                activeTab === 'sugestoes'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Sparkles size={16} />
              Sugestões para Você
              {recommendedContents.length > 0 && (
                <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                  {recommendedContents.length}
                </span>
              )}
            </button>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => navigate('/pdi/biblioteca')}>
              <Plus size={18} />
              Explorar Conteúdos
            </Button>
            <Button variant="secondary" onClick={() => navigate('/pdi/acoes')}>
              <Plus size={18} />
              Criar Ação
            </Button>
          </div>
        </div>

        {activeTab === 'meu-pdi' ? (
          loading ? (
            <div className="text-center py-12 text-gray-500">Carregando...</div>
          ) : (
            <>
              {upcomingContents.length === 0 && completedContents.length === 0 && userActions.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">Você ainda não adicionou conteúdos ao seu PDI</p>
                  <Button onClick={() => navigate('/pdi/biblioteca')}>
                    <Plus size={18} />
                    Explorar Conteúdos
                  </Button>
                </div>
              ) : (
              <>
                {upcomingContents.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                      Em Andamento ({upcomingContents.length})
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {upcomingContents.map((uc) => (
                        <div key={uc.id} className="relative">
                          <PDIContentCard
                            content={uc.content as PDIContent}
                            plannedDate={uc.planned_due_date}
                            status={uc.status}
                            showActions={false}
                          />
                          <div className="mt-3 flex gap-2">
                            <button
                              onClick={() => handleOpenDateModal(uc)}
                              className="flex-1 text-sm px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-1"
                            >
                              <Calendar size={14} />
                              Data
                            </button>
                            <button
                              onClick={() => handleOpenCompletionModal(uc)}
                              className="flex-1 text-sm px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-1"
                            >
                              <CheckCircle size={14} />
                              Concluir
                            </button>
                            <button
                              onClick={() => setDeleteConfirm({ show: true, id: uc.id })}
                              className="text-sm px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {userActions.length > 0 && (
                  <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-semibold text-gray-900">
                        Minhas Ações ({userActions.length})
                      </h2>
                      <Button variant="secondary" onClick={() => navigate('/pdi/acoes')}>
                        Gerenciar Ações
                      </Button>
                    </div>
                    <div className="bg-white rounded-lg border border-gray-200 divide-y">
                      {userActions.slice(0, 5).map((action) => (
                        <div key={action.id} className="p-4 flex items-center justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{action.description}</p>
                            <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
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
                            className={`px-2 py-1 text-xs font-medium rounded ${
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
                  </div>
                )}

                {completedContents.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
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
                                <span className="text-xs text-gray-600">Sua avaliação:</span>
                                <PDIRatingStars rating={uc.rating_stars} size={14} />
                              </div>
                              {uc.rating_comment && (
                                <p className="text-xs text-gray-600 mt-1">{uc.rating_comment}</p>
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
            </>
          )
        ) : (
          loadingRecommendations ? (
            <div className="text-center py-12 text-gray-500">Carregando sugestões...</div>
          ) : recommendedContents.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <Sparkles className="text-gray-400" size={32} />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma sugestão disponível
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                As sugestões são baseadas nas tags marcadas em suas avaliações.
                Quando você tiver uma avaliação finalizada com tags, os conteúdos recomendados aparecerão aqui.
              </p>
            </div>
          ) : (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Sparkles className="text-blue-600 mt-0.5" size={20} />
                  <div>
                    <h3 className="text-sm font-semibold text-blue-900 mb-1">
                      Conteúdos Personalizados para Você
                    </h3>
                    <p className="text-sm text-blue-800">
                      Estas sugestões foram selecionadas com base nas tags identificadas em sua última avaliação.
                      Explore os conteúdos abaixo para continuar seu desenvolvimento.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-4 text-sm text-gray-600">
                {recommendedContents.length} conteúdo{recommendedContents.length !== 1 ? 's' : ''} sugerido{recommendedContents.length !== 1 ? 's' : ''}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendedContents.map((content) => (
                  <PDIContentCard
                    key={content.id}
                    content={content}
                    showActions={true}
                    isAdded={false}
                    onAdd={handleAddRecommendedContent}
                  />
                ))}
              </div>
            </>
          )
        )}
      </div>

      <Modal
        isOpen={showCompletionModal}
        onClose={() => setShowCompletionModal(false)}
        title="Marcar como Concluído"
      >
        <form onSubmit={handleCompleteContent} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Avaliação <span className="text-red-500">*</span>
            </label>
            <div className="flex justify-center py-2">
              <PDIRatingStars
                rating={completionForm.rating_stars}
                interactive
                onChange={(rating) => setCompletionForm({ ...completionForm, rating_stars: rating })}
                size={32}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Comentário (opcional)
            </label>
            <textarea
              value={completionForm.rating_comment}
              onChange={(e) => setCompletionForm({ ...completionForm, rating_comment: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Compartilhe sua experiência com este conteúdo..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowCompletionModal(false)}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <Button type="submit">Confirmar</Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={showDateModal}
        onClose={() => setShowDateModal(false)}
        title="Alterar Data Prevista"
      >
        <form onSubmit={handleUpdateDate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data Prevista
            </label>
            <input
              type="date"
              value={dateForm.planned_due_date}
              onChange={(e) => setDateForm({ planned_due_date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowDateModal(false)}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <Button type="submit">Salvar</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={deleteConfirm.show}
        onClose={() => setDeleteConfirm({ show: false, id: null })}
        onConfirm={handleRemoveContent}
        title="Remover Conteúdo"
        message="Tem certeza que deseja remover este conteúdo do seu PDI?"
        confirmText="Remover"
        cancelText="Cancelar"
        variant="warning"
      />
    </>
  );
};
