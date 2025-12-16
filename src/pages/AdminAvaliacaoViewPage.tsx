import { useState, useEffect } from 'react';
import { useRouter } from '../utils/router';
import { supabase } from '../lib/supabase';
import { ArrowLeft, User, Calendar, FileText, Download } from 'lucide-react';
import { Button } from '../components/Button';
import { AvaliacaoPDFDocument } from '../components/AvaliacaoPDFDocument';
import { generatePDFFromReactElement, formatDateForFilename, sanitizeFilename } from '../utils/pdfGenerator';

interface Criterio {
  id: string;
  nome: string;
  descricao: string;
  peso: number;
}

interface Competencia {
  id: string;
  nome: string;
  descricao: string;
  criterios: Criterio[];
  pontuacoes: Record<string, number>;
  observacoes: Record<string, string>;
}

interface PerguntaPersonalizada {
  id: string;
  titulo: string;
  descricao: string;
  tipo_resposta: string;
  obrigatoria: boolean;
  resposta: any;
}

interface PDITag {
  id: string;
  nome: string;
}

interface Avaliacao {
  id: string;
  data_avaliacao: string;
  status: string;
  observacoes: string | null;
  pdi_tags: string[];
  colaborador: {
    nome: string;
    email: string;
    avatar_url: string | null;
  } | null;
  psicologa: {
    nome: string;
  } | null;
  modelo: {
    nome: string;
  } | null;
  competencias: Competencia[];
  perguntas: PerguntaPersonalizada[];
  textos: Array<{
    titulo: string;
    conteudo: string;
  }>;
  pdiTagsDetails: PDITag[];
}

export function AdminAvaliacaoViewPage() {
  const { params, navigate } = useRouter();
  const [avaliacao, setAvaliacao] = useState<Avaliacao | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [pdfProgress, setPdfProgress] = useState(0);

  useEffect(() => {
    console.log('[AdminAvaliacaoViewPage] Params:', params);
    if (params.id) {
      console.log('[AdminAvaliacaoViewPage] Loading avaliacao with ID:', params.id);
      loadAvaliacao(params.id);
    } else {
      console.warn('[AdminAvaliacaoViewPage] No ID in params');
    }
  }, [params.id]);

  const loadAvaliacao = async (id: string) => {
    try {
      setLoading(true);

      const { data: avaliacaoData, error: avaliacaoError } = await supabase
        .from('avaliacoes')
        .select(`
          id,
          data_avaliacao,
          status,
          observacoes,
          modelo_id,
          pdi_tags,
          colaborador:pessoas!colaborador_id (
            nome,
            email,
            avatar_url
          ),
          psicologa:administradores!psicologa_responsavel_id (
            nome
          ),
          modelo:modelos_avaliacao (
            nome
          )
        `)
        .eq('id', id)
        .maybeSingle();

      if (avaliacaoError) {
        console.error('Erro ao buscar avaliação:', avaliacaoError);
        throw avaliacaoError;
      }

      if (!avaliacaoData) {
        navigate('/avaliacoes');
        return;
      }

      const { data: modeloData, error: modeloError } = await supabase
        .from('modelos_avaliacao')
        .select('id')
        .eq('id', (avaliacaoData as any).modelo_id)
        .maybeSingle();

      if (modeloError) throw modeloError;

      const modeloId = modeloData?.id;

      const { data: competenciasData, error: competenciasError } = await supabase
        .from('modelos_competencias')
        .select(`
          competencia_id,
          competencias (
            id,
            nome
          )
        `)
        .eq('modelo_id', modeloId);

      if (competenciasError) throw competenciasError;

      const competenciaIds = (competenciasData || []).map((item: any) => item.competencias.id);

      const { data: criteriosData } = await supabase
        .from('criterios')
        .select(`
          id,
          competencia_id,
          criterios_textos!inner (
            nome,
            descricao,
            idioma_padrao
          )
        `)
        .in('competencia_id', competenciaIds)
        .eq('criterios_textos.idioma_padrao', true)
        .order('ordem', { ascending: true });

      const criteriosByCompetencia: Record<string, any[]> = {};
      (criteriosData || []).forEach((criterio: any) => {
        const compId = criterio.competencia_id;
        if (!criteriosByCompetencia[compId]) {
          criteriosByCompetencia[compId] = [];
        }
        criteriosByCompetencia[compId].push({
          id: criterio.id,
          nome: criterio.criterios_textos[0]?.nome || '',
          descricao: criterio.criterios_textos[0]?.descricao || '',
          peso: 1,
        });
      });

      const { data: pontuacoesData } = await supabase
        .from('avaliacoes_competencias')
        .select('criterio_id, pontuacao, observacoes')
        .eq('avaliacao_id', id);

      const pontuacoesMap: Record<string, { pontuacao: number; observacoes: string }> = {};
      (pontuacoesData || []).forEach((item: any) => {
        pontuacoesMap[item.criterio_id] = {
          pontuacao: item.pontuacao,
          observacoes: item.observacoes || '',
        };
      });

      const competencias: Competencia[] = (competenciasData || []).map((item: any) => {
        const compId = item.competencias.id;
        const criterios = criteriosByCompetencia[compId] || [];
        return {
          id: compId,
          nome: item.competencias.nome,
          descricao: '',
          criterios: criterios,
          pontuacoes: criterios.reduce((acc: any, crit: any) => {
            acc[crit.id] = pontuacoesMap[crit.id]?.pontuacao || 0;
            return acc;
          }, {}),
          observacoes: criterios.reduce((acc: any, crit: any) => {
            acc[crit.id] = pontuacoesMap[crit.id]?.observacoes || '';
            return acc;
          }, {}),
        };
      });

      const { data: perguntasData, error: perguntasError } = await supabase
        .from('perguntas_personalizadas')
        .select('*')
        .eq('modelo_id', modeloId)
        .order('ordem', { ascending: true });

      if (perguntasError) throw perguntasError;

      const { data: respostasData } = await supabase
        .from('avaliacoes_respostas')
        .select('pergunta_id, resposta_texto, resposta_opcoes, resposta_numero, resposta_data')
        .eq('avaliacao_id', id);

      const respostasMap: Record<string, any> = {};
      (respostasData || []).forEach((item: any) => {
        respostasMap[item.pergunta_id] = {
          texto: item.resposta_texto,
          opcoes: item.resposta_opcoes,
          numero: item.resposta_numero,
          data: item.resposta_data,
        };
      });

      const perguntas: PerguntaPersonalizada[] = (perguntasData || []).map((item: any) => ({
        id: item.id,
        titulo: item.titulo,
        descricao: item.descricao,
        tipo_resposta: item.tipo_resposta,
        obrigatoria: item.obrigatoria,
        resposta: respostasMap[item.id] || null,
      }));

      const { data: textosData } = await supabase
        .from('avaliacoes_textos')
        .select('pontos_fortes, oportunidades_melhoria, highlights_psicologa, sugestoes_desenvolvimento')
        .eq('avaliacao_id', id)
        .eq('idioma_padrao', true)
        .maybeSingle();

      const textos = [];
      if (textosData) {
        if (textosData.pontos_fortes) {
          textos.push({
            titulo: 'Pontos Fortes',
            conteudo: textosData.pontos_fortes,
          });
        }
        if (textosData.oportunidades_melhoria) {
          textos.push({
            titulo: 'Oportunidades de Melhoria',
            conteudo: textosData.oportunidades_melhoria,
          });
        }
        if (textosData.highlights_psicologa) {
          textos.push({
            titulo: 'Análise da Psicóloga',
            conteudo: textosData.highlights_psicologa,
          });
        }
        if (textosData.sugestoes_desenvolvimento) {
          textos.push({
            titulo: 'Sugestões de Desenvolvimento',
            conteudo: textosData.sugestoes_desenvolvimento,
          });
        }
      }

      let pdiTagsDetails: PDITag[] = [];
      if (avaliacaoData.pdi_tags && Array.isArray(avaliacaoData.pdi_tags) && avaliacaoData.pdi_tags.length > 0) {
        const { data: tagsData } = await supabase
          .from('pdi_tags')
          .select('id, nome')
          .in('id', avaliacaoData.pdi_tags);

        if (tagsData) {
          pdiTagsDetails = tagsData;
        }
      }

      setAvaliacao({
        ...avaliacaoData,
        competencias,
        perguntas,
        textos,
        pdiTagsDetails,
      } as Avaliacao);
    } catch (error: any) {
      console.error('Erro ao carregar avaliação:', error);
      navigate('/avaliacoes');
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
        return 'bg-green-100 text-green-800 border-green-200';
      case 'em_andamento':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rascunho':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const calculateMedia = (pontuacoes: Record<string, number>) => {
    const valores = Object.values(pontuacoes).filter(v => v > 0);
    if (valores.length === 0) return 0;
    return valores.reduce((acc, val) => acc + val, 0) / valores.length;
  };

  const handleExportPDF = async () => {
    if (!avaliacao) return;

    try {
      setIsGeneratingPDF(true);
      setPdfProgress(0);

      const colaboradorNome = sanitizeFilename(avaliacao.colaborador?.nome || 'Colaborador');
      const dataFormatada = formatDateForFilename(avaliacao.data_avaliacao);
      const filename = `Avaliacao-${colaboradorNome}-${dataFormatada}.pdf`;

      await generatePDFFromReactElement(<AvaliacaoPDFDocument avaliacao={avaliacao} />, {
        filename,
        onProgress: setPdfProgress,
      });
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar PDF. Tente novamente.');
    } finally {
      setIsGeneratingPDF(false);
      setPdfProgress(0);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">Carregando avaliação...</p>
      </div>
    );
  }

  if (!avaliacao) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">Avaliação não encontrada</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Button
              variant="secondary"
              onClick={() => navigate('/avaliacoes')}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para Avaliações
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Visualizar Avaliação</h1>
          </div>
          <Button
            onClick={handleExportPDF}
            disabled={isGeneratingPDF}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            {isGeneratingPDF ? `Gerando PDF... ${pdfProgress}%` : 'Exportar PDF'}
          </Button>
        </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="flex items-start gap-6 mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
            {avaliacao.colaborador?.avatar_url ? (
              <img
                src={avaliacao.colaborador.avatar_url}
                alt={avaliacao.colaborador.nome}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User className="w-10 h-10 text-white" />
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              {avaliacao.colaborador?.nome}
            </h2>
            <p className="text-gray-600 mb-4">{avaliacao.modelo?.nome}</p>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Data: {formatDate(avaliacao.data_avaliacao)}</span>
              </div>
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${getStatusColor(avaliacao.status)}`}>
                <FileText className="w-4 h-4" />
                <span className="font-medium">{getStatusLabel(avaliacao.status)}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {calculateMedia(
                    avaliacao.competencias.reduce((acc, comp) => {
                      return { ...acc, ...comp.pontuacoes };
                    }, {})
                  ).toFixed(1)}
                </div>
                <div className="text-xs text-white opacity-90">Média</div>
              </div>
            </div>
          </div>
        </div>

        {avaliacao.psicologa && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Psicóloga Responsável:</span> {avaliacao.psicologa.nome}
            </p>
          </div>
        )}
      </div>

      {avaliacao.competencias.map((competencia, index) => (
        <div
          key={competencia.id}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-8"
        >
          <div className="mb-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold text-lg">
                {index + 1}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {competencia.nome}
                </h3>
                {competencia.descricao && (
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    {competencia.descricao}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {competencia.criterios.map((criterio) => {
              const pontuacao = competencia.pontuacoes[criterio.id] || 0;
              const observacoes = competencia.observacoes[criterio.id];
              const percentage = (pontuacao / 5) * 100;

              return (
                <div key={criterio.id} className="border-l-4 border-gray-200 pl-6">
                  <div className="mb-3">
                    <h4 className="font-semibold text-gray-900 mb-1">{criterio.nome}</h4>
                    {criterio.descricao && (
                      <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                        {criterio.descricao}
                      </p>
                    )}
                  </div>

                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Resultado</span>
                      <span className="text-lg font-bold text-gray-900">
                        {pontuacao.toFixed(1)}
                      </span>
                    </div>
                    <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-500 via-yellow-500 via-green-400 to-blue-500 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                      <div
                        className="absolute top-0 h-full w-1 bg-gray-800"
                        style={{ left: `${percentage}%` }}
                      />
                    </div>
                  </div>

                  {observacoes && (
                    <div className="mt-3 bg-gray-50 border border-gray-200 rounded-lg p-3">
                      <p className="text-sm text-gray-700 leading-relaxed">{observacoes}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {avaliacao.perguntas.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Análise Observativa</h3>
          <div className="space-y-6">
            {avaliacao.perguntas.map((pergunta) => (
              <div key={pergunta.id} className="border-l-4 border-blue-500 pl-6">
                <h4 className="font-semibold text-gray-900 mb-2">{pergunta.titulo}</h4>
                {pergunta.descricao && (
                  <p className="text-sm text-gray-600 mb-3">{pergunta.descricao}</p>
                )}
                {pergunta.resposta && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {pergunta.resposta.texto || '-'}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {avaliacao.textos.length > 0 && (
        <div className="space-y-6">
          {avaliacao.textos.map((texto, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-8"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">{texto.titulo}</h3>
              </div>
              <div
                className="prose prose-sm max-w-none text-gray-700"
                dangerouslySetInnerHTML={{ __html: texto.conteudo }}
              />
              {texto.titulo === 'Sugestões de Desenvolvimento' && avaliacao.pdiTagsDetails && avaliacao.pdiTagsDetails.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Tags PDI Relacionadas</h4>
                  <div className="flex flex-wrap gap-2">
                    {avaliacao.pdiTagsDetails.map((tag) => (
                      <span
                        key={tag.id}
                        className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200"
                      >
                        {tag.nome}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {avaliacao.observacoes && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-900 mb-2">
            Observações Gerais
          </h3>
          <p className="text-yellow-800 leading-relaxed">{avaliacao.observacoes}</p>
        </div>
      )}
      </div>
    </div>
  );
}
