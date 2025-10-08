import { useState, useEffect, FormEvent } from 'react';
import { ArrowLeft, Mail, Copy } from 'lucide-react';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { useToast } from '../components/Toast';
import { supabase } from '../lib/supabase';
import { useRouter } from '../utils/router';

interface AvaliacaoFormPageProps {
  avaliacaoId?: string;
}

interface Empresa {
  id: string;
  nome: string;
}

interface Pessoa {
  id: string;
  nome: string;
  email: string;
}

interface Modelo {
  id: string;
  nome: string;
}

interface Psicologa {
  id: string;
  nome: string;
}

interface PerguntaTexto {
  idioma: string;
  titulo: string;
  descricao: string;
  idioma_padrao: boolean;
}

interface Pergunta {
  id: string;
  modelo_id: string;
  visibilidade: string;
  obrigatorio: boolean;
  ordem: number;
  opcoes: any[];
  textos: PerguntaTexto[];
}

interface CriterioTexto {
  idioma: string;
  nome: string;
  descricao: string;
  idioma_padrao: boolean;
}

interface Criterio {
  id: string;
  competencia_id: string;
  visibilidade: string;
  ordem: number;
  textos: CriterioTexto[];
}

interface Competencia {
  id: string;
  nome: string;
  criterios: Criterio[];
}

interface Resposta {
  pergunta_id: string;
  resposta_texto?: string;
  resposta_numero?: number;
  resposta_opcoes?: any[];
}

interface CompetenciaRating {
  criterio_id: string;
  pontuacao?: number;
  observacoes?: string;
}

export const AvaliacaoFormPage = ({ avaliacaoId }: AvaliacaoFormPageProps) => {
  const { showToast } = useToast();
  const { navigate } = useRouter();
  const [loading, setLoading] = useState(false);
  const [dataAvaliacao, setDataAvaliacao] = useState('');
  const [empresaId, setEmpresaId] = useState('');
  const [colaboradorId, setColaboradorId] = useState('');
  const [modeloId, setModeloId] = useState('');
  const [psicologaId, setPsicologaId] = useState('');

  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [colaboradores, setColaboradores] = useState<Pessoa[]>([]);
  const [modelos, setModelos] = useState<Modelo[]>([]);
  const [psicologas, setPsicologas] = useState<Psicologa[]>([]);

  const [perguntas, setPerguntas] = useState<Pergunta[]>([]);
  const [competencias, setCompetencias] = useState<Competencia[]>([]);
  const [respostas, setRespostas] = useState<Record<string, Resposta>>({});
  const [ratings, setRatings] = useState<Record<string, CompetenciaRating>>({});
  const [loadingModelo, setLoadingModelo] = useState(false);

  const isEditMode = !!avaliacaoId;

  useEffect(() => {
    loadEmpresas();
    loadModelos();
    loadPsicologas();
    if (avaliacaoId) {
      loadAvaliacao();
    }
  }, [avaliacaoId]);

  useEffect(() => {
    if (empresaId) {
      loadColaboradores(empresaId);
    } else {
      setColaboradores([]);
      setColaboradorId('');
    }
  }, [empresaId]);

  useEffect(() => {
    if (modeloId) {
      loadModeloDetails();
    } else {
      setPerguntas([]);
      setCompetencias([]);
    }
  }, [modeloId]);

  const loadEmpresas = async () => {
    try {
      const { data, error } = await supabase
        .from('empresas')
        .select('id, nome')
        .eq('ativo', true)
        .order('nome');

      if (error) throw error;
      setEmpresas(data || []);
    } catch (error: any) {
      console.error('Error loading empresas:', error);
    }
  };

  const loadColaboradores = async (empresaIdParam: string) => {
    try {
      const { data, error } = await supabase
        .from('pessoas')
        .select('id, nome, email')
        .eq('empresa_id', empresaIdParam)
        .order('nome');

      if (error) throw error;
      setColaboradores(data || []);
    } catch (error: any) {
      console.error('Error loading colaboradores:', error);
    }
  };

  const loadModelos = async () => {
    try {
      const { data, error } = await supabase
        .from('modelos_avaliacao')
        .select('id, nome')
        .order('nome');

      if (error) throw error;
      setModelos(data || []);
    } catch (error: any) {
      console.error('Error loading modelos:', error);
    }
  };

  const loadPsicologas = async () => {
    try {
      const { data, error } = await supabase
        .from('administradores')
        .select('id, nome')
        .eq('e_psicologa', true)
        .eq('ativo', true)
        .order('nome');

      if (error) throw error;
      setPsicologas(data || []);
    } catch (error: any) {
      console.error('Error loading psicologas:', error);
    }
  };

  const loadAvaliacao = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('avaliacoes')
        .select('*')
        .eq('id', avaliacaoId)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        showToast('error', 'Avaliação não encontrada');
        return;
      }

      console.log('Avaliação carregada:', data);

      setDataAvaliacao(data.data_avaliacao);
      setEmpresaId(data.empresa_id);
      setColaboradorId(data.colaborador_id);
      setModeloId(data.modelo_id || '');
      setPsicologaId(data.psicologa_responsavel_id || '');

      await loadColaboradores(data.empresa_id);

      if (data.modelo_id) {
        await loadModeloDetails();
        await loadExistingResponses();
      }
    } catch (error: any) {
      showToast('error', error.message || 'Erro ao carregar avaliação');
    } finally {
      setLoading(false);
    }
  };

  const loadModeloDetails = async () => {
    if (!modeloId) return;

    try {
      setLoadingModelo(true);

      const { data: perguntasData, error: pergError } = await supabase
        .from('perguntas_personalizadas')
        .select('*, perguntas_personalizadas_textos(*)')
        .eq('modelo_id', modeloId)
        .order('ordem');

      if (pergError) throw pergError;

      const perguntasFormatted = (perguntasData || []).map((p: any) => ({
        id: p.id,
        modelo_id: p.modelo_id,
        visibilidade: p.visibilidade || 'todos',
        obrigatorio: p.obrigatorio,
        ordem: p.ordem,
        opcoes: p.opcoes || [],
        textos: p.perguntas_personalizadas_textos || [],
      }));

      setPerguntas(perguntasFormatted);

      const { data: modeloComps, error: compsError } = await supabase
        .from('modelos_competencias')
        .select('competencia_id')
        .eq('modelo_id', modeloId)
        .order('ordem');

      if (compsError) throw compsError;

      const competenciaIds = (modeloComps || []).map((mc: any) => mc.competencia_id);

      if (competenciaIds.length > 0) {
        const { data: competenciasData, error: compDataError } = await supabase
          .from('competencias')
          .select('*, criterios(*, criterios_textos(*))')
          .in('id', competenciaIds);

        if (compDataError) throw compDataError;

        const competenciasFormatted = (competenciasData || []).map((comp: any) => ({
          id: comp.id,
          nome: comp.nome,
          criterios: (comp.criterios || []).map((crit: any) => ({
            id: crit.id,
            competencia_id: crit.competencia_id,
            visibilidade: crit.visibilidade,
            ordem: crit.ordem,
            textos: crit.criterios_textos || [],
          })),
        }));

        setCompetencias(competenciasFormatted);
      }
    } catch (error: any) {
      console.error('Erro ao carregar detalhes do modelo:', error);
      showToast('error', 'Erro ao carregar detalhes do modelo');
    } finally {
      setLoadingModelo(false);
    }
  };

  const loadExistingResponses = async () => {
    if (!avaliacaoId) return;

    try {
      const { data: respostasData, error: respError } = await supabase
        .from('avaliacoes_respostas')
        .select('*')
        .eq('avaliacao_id', avaliacaoId);

      if (respError) throw respError;

      const respostasMap: Record<string, Resposta> = {};
      (respostasData || []).forEach((r: any) => {
        respostasMap[r.pergunta_id] = {
          pergunta_id: r.pergunta_id,
          resposta_texto: r.resposta_texto,
          resposta_numero: r.resposta_numero,
          resposta_opcoes: r.resposta_opcoes,
        };
      });
      setRespostas(respostasMap);

      const { data: ratingsData, error: ratError } = await supabase
        .from('avaliacoes_competencias')
        .select('*')
        .eq('avaliacao_id', avaliacaoId);

      if (ratError) throw ratError;

      const ratingsMap: Record<string, CompetenciaRating> = {};
      (ratingsData || []).forEach((r: any) => {
        ratingsMap[r.criterio_id] = {
          criterio_id: r.criterio_id,
          pontuacao: r.pontuacao,
          observacoes: r.observacoes,
        };
      });
      setRatings(ratingsMap);
    } catch (error: any) {
      console.error('Erro ao carregar respostas existentes:', error);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!dataAvaliacao || !empresaId || !colaboradorId) {
      showToast('error', 'Data, Empresa e Colaborador são obrigatórios');
      return;
    }

    try {
      setLoading(true);

      const colaboradorSelecionado = colaboradores.find((c) => c.id === colaboradorId);

      const data = {
        data_avaliacao: dataAvaliacao,
        empresa_id: empresaId,
        colaborador_id: colaboradorId,
        modelo_id: modeloId || null,
        psicologa_responsavel_id: psicologaId || null,
        colaborador_email: colaboradorSelecionado?.email || '',
        status: 'rascunho',
      };

      let savedAvaliacaoId = avaliacaoId;

      if (isEditMode) {
        const { error } = await supabase.from('avaliacoes').update(data).eq('id', avaliacaoId);
        if (error) throw error;
      } else {
        const { data: newAvaliacao, error } = await supabase
          .from('avaliacoes')
          .insert(data)
          .select()
          .single();
        if (error) throw error;
        savedAvaliacaoId = newAvaliacao.id;
      }

      if (modeloId && savedAvaliacaoId) {
        await saveRespostas(savedAvaliacaoId);
        await saveRatings(savedAvaliacaoId);
      }

      showToast('success', `Avaliação ${isEditMode ? 'atualizada' : 'criada'} com sucesso`);

      navigate('/avaliacoes');
    } catch (error: any) {
      showToast('error', error.message || 'Erro ao salvar avaliação');
    } finally {
      setLoading(false);
    }
  };

  const saveRespostas = async (avaliacaoIdToSave: string) => {
    if (isEditMode) {
      await supabase
        .from('avaliacoes_respostas')
        .delete()
        .eq('avaliacao_id', avaliacaoIdToSave);
    }

    const respostasToSave = Object.values(respostas).map((resp) => ({
      avaliacao_id: avaliacaoIdToSave,
      pergunta_id: resp.pergunta_id,
      resposta_texto: resp.resposta_texto || null,
      resposta_numero: resp.resposta_numero || null,
      resposta_opcoes: resp.resposta_opcoes || [],
    }));

    if (respostasToSave.length > 0) {
      const { error } = await supabase
        .from('avaliacoes_respostas')
        .insert(respostasToSave);
      if (error) throw error;
    }
  };

  const saveRatings = async (avaliacaoIdToSave: string) => {
    if (isEditMode) {
      await supabase
        .from('avaliacoes_competencias')
        .delete()
        .eq('avaliacao_id', avaliacaoIdToSave);
    }

    const ratingsToSave = Object.entries(ratings)
      .filter(([_, rating]) => rating.pontuacao !== undefined || rating.observacoes)
      .map(([criterioId, rating]) => {
        const criterio = competencias
          .flatMap((c) => c.criterios)
          .find((crit) => crit.id === criterioId);

        return {
          avaliacao_id: avaliacaoIdToSave,
          competencia_id: criterio?.competencia_id || '',
          criterio_id: criterioId,
          pontuacao: rating.pontuacao || null,
          observacoes: rating.observacoes || null,
        };
      });

    if (ratingsToSave.length > 0) {
      const { error } = await supabase
        .from('avaliacoes_competencias')
        .insert(ratingsToSave);
      if (error) throw error;
    }
  };

  const updateResposta = (perguntaId: string, field: string, value: any) => {
    setRespostas((prev) => ({
      ...prev,
      [perguntaId]: {
        ...(prev[perguntaId] || { pergunta_id: perguntaId }),
        [field]: value,
      },
    }));
  };

  const updateRating = (criterioId: string, field: string, value: any) => {
    setRatings((prev) => ({
      ...prev,
      [criterioId]: {
        ...(prev[criterioId] || { criterio_id: criterioId }),
        [field]: value,
      },
    }));
  };

  return (
    <>
      <Header
        title={isEditMode ? 'Editar Avaliação' : 'Adicionar Avaliação'}
        action={
          <div className="flex gap-2">
            <Button variant="secondary" icon={Mail}>
              E-Mail Devolutiva
            </Button>
            <Button variant="secondary" icon={Copy}>
              Copiar
            </Button>
            <Button variant="ghost" icon={ArrowLeft} onClick={() => navigate('/avaliacoes')}>
              Voltar
            </Button>
          </div>
        }
      />

      <div className="p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Dados da Avaliação</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data da Avaliação <span className="text-red-600">*</span>
                </label>
                <input
                  type="date"
                  value={dataAvaliacao}
                  onChange={(e) => setDataAvaliacao(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Psicóloga responsável
                </label>
                <select
                  value={psicologaId}
                  onChange={(e) => setPsicologaId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Nenhum</option>
                  {psicologas.map((psi) => (
                    <option key={psi.id} value={psi.id}>
                      {psi.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Empresa <span className="text-red-600">*</span>
                </label>
                <select
                  value={empresaId}
                  onChange={(e) => setEmpresaId(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Cocriar</option>
                  {empresas.map((empresa) => (
                    <option key={empresa.id} value={empresa.id}>
                      {empresa.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Colaborador <span className="text-red-600">*</span>
                </label>
                <select
                  value={colaboradorId}
                  onChange={(e) => setColaboradorId(e.target.value)}
                  required
                  disabled={!empresaId}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">Selecione...</option>
                  {colaboradores.map((colab) => (
                    <option key={colab.id} value={colab.id}>
                      {colab.nome}
                    </option>
                  ))}
                </select>
                {!empresaId && (
                  <p className="mt-1 text-xs text-gray-500">
                    Selecione uma empresa primeiro
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Modelo de Avaliação
                </label>
                <select
                  value={modeloId}
                  onChange={(e) => setModeloId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Nenhum</option>
                  {modelos.map((modelo) => (
                    <option key={modelo.id} value={modelo.id}>
                      {modelo.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {modeloId && perguntas.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Perguntas Personalizadas</h2>
              {loadingModelo ? (
                <div className="text-center py-8 text-gray-500">Carregando perguntas...</div>
              ) : (
                <div className="space-y-4">
                  {perguntas.map((pergunta) => {
                    const textoPtBr = pergunta.textos.find((t) => t.idioma === 'pt-BR') || pergunta.textos[0];
                    const resposta = respostas[pergunta.id] || {};

                    return (
                      <div key={pergunta.id} className="border-b border-gray-200 pb-4 last:border-0">
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          {textoPtBr?.titulo}
                          {pergunta.obrigatorio && <span className="text-red-600 ml-1">*</span>}
                        </label>
                        {textoPtBr?.descricao && (
                          <p className="text-sm text-gray-500 mb-2">{textoPtBr.descricao}</p>
                        )}
                        <textarea
                          value={resposta.resposta_texto || ''}
                          onChange={(e) => updateResposta(pergunta.id, 'resposta_texto', e.target.value)}
                          rows={3}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Digite sua resposta..."
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {modeloId && competencias.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Competências</h2>
              {loadingModelo ? (
                <div className="text-center py-8 text-gray-500">Carregando competências...</div>
              ) : (
                <div className="space-y-6">
                  {competencias.map((competencia) => (
                    <div key={competencia.id} className="border border-gray-200 rounded-lg p-4">
                      <h3 className="text-md font-semibold text-gray-800 mb-3">{competencia.nome}</h3>
                      <div className="space-y-3">
                        {competencia.criterios.map((criterio) => {
                          const textoPtBr = criterio.textos.find((t) => t.idioma === 'pt-BR') || criterio.textos[0];
                          const rating = ratings[criterio.id] || {};

                          return (
                            <div key={criterio.id} className="bg-gray-50 p-3 rounded">
                              <div className="mb-2">
                                <p className="text-sm font-medium text-gray-900">{textoPtBr?.nome}</p>
                                {textoPtBr?.descricao && (
                                  <p className="text-xs text-gray-500 mt-1">{textoPtBr.descricao}</p>
                                )}
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Pontuação (1-5)
                                  </label>
                                  <input
                                    type="number"
                                    min="1"
                                    max="5"
                                    step="0.5"
                                    value={rating.pontuacao || ''}
                                    onChange={(e) => updateRating(criterio.id, 'pontuacao', parseFloat(e.target.value) || undefined)}
                                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="1-5"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Observações
                                  </label>
                                  <input
                                    type="text"
                                    value={rating.observacoes || ''}
                                    onChange={(e) => updateRating(criterio.id, 'observacoes', e.target.value)}
                                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Notas adicionais..."
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {modeloId && perguntas.length === 0 && competencias.length === 0 && !loadingModelo && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="text-center py-8 text-gray-500">
                Este modelo não possui perguntas personalizadas ou competências cadastradas.
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>

        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Comparativo</h2>
          <div className="flex gap-2 mb-4">
            <button className="px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded hover:bg-orange-600">
              Limpar
            </button>
            <button className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded hover:bg-indigo-700">
              Atualizar
            </button>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <div className="text-center text-gray-500">
              Não existe avaliações adicionadas para comparar. Selecione as avaliações e click no
              botão <strong>[Adicionar Comparativo]</strong>.
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
