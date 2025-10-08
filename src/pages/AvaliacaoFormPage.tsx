import { useState, useEffect, FormEvent } from 'react';
import { ArrowLeft, Mail, Copy, AlertTriangle } from 'lucide-react';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { RichTextEditor } from '../components/RichTextEditor';
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

interface AvaliacaoTexto {
  idioma: string;
  oportunidades_melhoria: string;
  pontos_fortes: string;
  highlights_psicologa: string;
  idioma_padrao: boolean;
}

type Idioma = 'pt-BR' | 'en-US' | 'es-ES';

const IDIOMAS: { value: Idioma; label: string }[] = [
  { value: 'pt-BR', label: 'Português [Default]' },
  { value: 'en-US', label: 'Inglês' },
  { value: 'es-ES', label: 'Espanhol' },
];

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

  const [textosPorIdioma, setTextosPorIdioma] = useState<Record<Idioma, AvaliacaoTexto>>({
    'pt-BR': { idioma: 'pt-BR', oportunidades_melhoria: '', pontos_fortes: '', highlights_psicologa: '', idioma_padrao: true },
    'en-US': { idioma: 'en-US', oportunidades_melhoria: '', pontos_fortes: '', highlights_psicologa: '', idioma_padrao: false },
    'es-ES': { idioma: 'es-ES', oportunidades_melhoria: '', pontos_fortes: '', highlights_psicologa: '', idioma_padrao: false },
  });
  const [idiomaAtivo, setIdiomaAtivo] = useState<Idioma>('pt-BR');

  const [isLocked, setIsLocked] = useState(false);
  const [lockedBy, setLockedBy] = useState<string>('');
  const [showLockWarning, setShowLockWarning] = useState(false);
  const [currentUser, setCurrentUser] = useState<Pessoa | null>(null);

  const isEditMode = !!avaliacaoId;

  useEffect(() => {
    loadEmpresas();
    loadModelos();
    loadPsicologas();
    selectCurrentUser();
    if (avaliacaoId) {
      checkEditingLock();
    }
  }, [avaliacaoId]);

  useEffect(() => {
    return () => {
      if (avaliacaoId && currentUser && !isLocked) {
        releaseLock();
      }
    };
  }, [avaliacaoId, currentUser, isLocked]);

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

  const selectCurrentUser = async () => {
    try {
      const { data, error } = await supabase
        .from('pessoas')
        .select('id, nome, email')
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setCurrentUser(data);
      }
    } catch (error: any) {
      console.error('Error selecting current user:', error);
    }
  };

  const checkEditingLock = async () => {
    if (!avaliacaoId) return;

    try {
      const { data, error } = await supabase
        .from('avaliacoes')
        .select('editing_user_id, editing_user_name, editing_started_at')
        .eq('id', avaliacaoId)
        .maybeSingle();

      if (error) throw error;

      if (data?.editing_user_id && data?.editing_user_name) {
        const timeSinceEdit = data.editing_started_at
          ? Date.now() - new Date(data.editing_started_at).getTime()
          : 0;

        const LOCK_TIMEOUT = 30 * 60 * 1000;

        if (timeSinceEdit < LOCK_TIMEOUT) {
          setIsLocked(true);
          setLockedBy(data.editing_user_name);
          setShowLockWarning(true);
        } else {
          await acquireLock();
          loadAvaliacao();
        }
      } else {
        await acquireLock();
        loadAvaliacao();
      }
    } catch (error: any) {
      console.error('Error checking editing lock:', error);
      showToast('Erro ao verificar bloqueio de edição', 'error');
    }
  };

  const acquireLock = async () => {
    if (!avaliacaoId || !currentUser) return;

    try {
      const { error } = await supabase
        .from('avaliacoes')
        .update({
          editing_user_id: currentUser.id,
          editing_user_name: currentUser.nome,
          editing_started_at: new Date().toISOString(),
        })
        .eq('id', avaliacaoId);

      if (error) throw error;
    } catch (error: any) {
      console.error('Error acquiring lock:', error);
    }
  };

  const releaseLock = async () => {
    if (!avaliacaoId) return;

    try {
      await supabase
        .from('avaliacoes')
        .update({
          editing_user_id: null,
          editing_user_name: null,
          editing_started_at: null,
        })
        .eq('id', avaliacaoId);
    } catch (error: any) {
      console.error('Error releasing lock:', error);
    }
  };

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

      await loadTextos();
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

  const loadTextos = async () => {
    if (!avaliacaoId) return;

    try {
      const { data: textosData, error } = await supabase
        .from('avaliacoes_textos')
        .select('*')
        .eq('avaliacao_id', avaliacaoId);

      if (error) throw error;

      if (textosData && textosData.length > 0) {
        const textosMap: Record<Idioma, AvaliacaoTexto> = { ...textosPorIdioma };
        textosData.forEach((texto: any) => {
          textosMap[texto.idioma as Idioma] = {
            idioma: texto.idioma,
            oportunidades_melhoria: texto.oportunidades_melhoria || '',
            pontos_fortes: texto.pontos_fortes || '',
            highlights_psicologa: texto.highlights_psicologa || '',
            idioma_padrao: texto.idioma_padrao,
          };
        });
        setTextosPorIdioma(textosMap);
      }
    } catch (error: any) {
      console.error('Erro ao carregar textos da avaliação:', error);
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

      await saveTextos(savedAvaliacaoId);

      if (modeloId && savedAvaliacaoId) {
        await saveRespostas(savedAvaliacaoId);
        await saveRatings(savedAvaliacaoId);
      }

      if (isEditMode) {
        await releaseLock();
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

  const saveTextos = async (avaliacaoIdToSave: string) => {
    if (isEditMode) {
      await supabase
        .from('avaliacoes_textos')
        .delete()
        .eq('avaliacao_id', avaliacaoIdToSave);
    }

    const textosToSave = Object.values(textosPorIdioma).map((texto) => ({
      avaliacao_id: avaliacaoIdToSave,
      idioma: texto.idioma,
      oportunidades_melhoria: texto.oportunidades_melhoria,
      pontos_fortes: texto.pontos_fortes,
      highlights_psicologa: texto.highlights_psicologa,
      idioma_padrao: texto.idioma === 'pt-BR',
    }));

    if (textosToSave.length > 0) {
      const { error } = await supabase.from('avaliacoes_textos').insert(textosToSave);
      if (error) throw error;
    }
  };

  const updateTexto = (idioma: Idioma, field: keyof Omit<AvaliacaoTexto, 'idioma' | 'idioma_padrao'>, value: string) => {
    setTextosPorIdioma((prev) => ({
      ...prev,
      [idioma]: {
        ...prev[idioma],
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
          {isLocked && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
              <AlertTriangle size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-900">
                  Esta avaliação está sendo editada por {lockedBy}
                </p>
                <p className="text-sm text-yellow-700 mt-1">
                  O formulário está bloqueado para evitar conflitos de edição.
                </p>
              </div>
            </div>
          )}
          <fieldset disabled={isLocked} className="space-y-6">
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

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Dados Básicos da Avaliação</h2>

            <div className="flex gap-2 mb-4 border-b border-gray-200">
              {IDIOMAS.map((idioma) => (
                <button
                  key={idioma.value}
                  type="button"
                  onClick={() => setIdiomaAtivo(idioma.value)}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    idiomaAtivo === idioma.value
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {idioma.label}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Oportunidades de Melhoria
                </label>
                <RichTextEditor
                  value={textosPorIdioma[idiomaAtivo].oportunidades_melhoria}
                  onChange={(value) => updateTexto(idiomaAtivo, 'oportunidades_melhoria', value)}
                  placeholder="Digite as oportunidades de melhoria..."
                  rows={6}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pontos Fortes
                </label>
                <RichTextEditor
                  value={textosPorIdioma[idiomaAtivo].pontos_fortes}
                  onChange={(value) => updateTexto(idiomaAtivo, 'pontos_fortes', value)}
                  placeholder="Digite os pontos fortes..."
                  rows={6}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Highlights da Psicóloga
                </label>
                <RichTextEditor
                  value={textosPorIdioma[idiomaAtivo].highlights_psicologa}
                  onChange={(value) => updateTexto(idiomaAtivo, 'highlights_psicologa', value)}
                  placeholder="Digite os highlights da psicóloga..."
                  rows={6}
                />
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
                        <RichTextEditor
                          value={resposta.resposta_texto || ''}
                          onChange={(value) => updateResposta(pergunta.id, 'resposta_texto', value)}
                          placeholder="Digite sua resposta..."
                          rows={4}
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
                              <div className="mb-3">
                                <p className="text-sm font-medium text-gray-900">{textoPtBr?.nome}</p>
                                {textoPtBr?.descricao && (
                                  <p className="text-xs text-gray-500 mt-1">{textoPtBr.descricao}</p>
                                )}
                              </div>
                              <div className="space-y-3">
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
                                  <label className="block text-xs font-medium text-gray-700 mb-2">
                                    Observações
                                  </label>
                                  <RichTextEditor
                                    value={rating.observacoes || ''}
                                    onChange={(value) => updateRating(criterio.id, 'observacoes', value)}
                                    placeholder="Notas adicionais..."
                                    rows={4}
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
          </fieldset>
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

      <Modal
        isOpen={showLockWarning}
        onClose={() => {
          setShowLockWarning(false);
          navigate('/avaliacoes');
        }}
        title="Avaliação em Edição"
        size="md"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <AlertTriangle size={24} className="text-yellow-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Esta avaliação já está sendo editada
              </h3>
              <p className="text-gray-600">
                O usuário <strong>{lockedBy}</strong> está editando esta avaliação no momento.
              </p>
              <p className="text-gray-600 mt-2">
                Por favor, aguarde até que a edição seja concluída ou entre em contato com este usuário.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
            <Button
              variant="primary"
              onClick={() => {
                setShowLockWarning(false);
                navigate('/avaliacoes');
              }}
            >
              Voltar para Avaliações
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
