import { useState, useEffect } from 'react';
import { useRouter } from '../utils/router';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { ArrowLeft, User, Calendar, FileText } from 'lucide-react';
import { Button } from '../components/Button';

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

interface Avaliacao {
  id: string;
  data_avaliacao: string;
  status: string;
  observacoes: string | null;
  colaborador: {
    nome: string;
    email: string;
    avatar_url: string | null;
  } | null;
  avaliador: {
    nome: string;
  } | null;
  modelo: {
    nome: string;
    descricao: string;
  } | null;
  competencias: Competencia[];
  perguntas: PerguntaPersonalizada[];
  textos: Array<{
    titulo: string;
    conteudo: string;
  }>;
}

export function UserAvaliacaoViewPage() {
  const { params, navigate } = useRouter();
  const { pessoa } = useAuth();
  const [avaliacao, setAvaliacao] = useState<Avaliacao | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      loadAvaliacao(params.id);
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
          colaborador:pessoas!avaliacoes_colaborador_id_fkey (
            nome,
            email,
            avatar_url
          ),
          avaliador:pessoas!avaliacoes_avaliador_id_fkey (
            nome
          ),
          modelo:modelos_avaliacao (
            nome,
            descricao
          )
        `)
        .eq('id', id)
        .eq('colaborador_id', pessoa?.id)
        .maybeSingle();

      if (avaliacaoError) throw avaliacaoError;
      if (!avaliacaoData) {
        navigate('/user-dashboard');
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
            nome,
            descricao,
            criterios (
              id,
              nome,
              descricao,
              peso
            )
          )
        `)
        .eq('modelo_id', modeloId);

      if (competenciasError) throw competenciasError;

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

      const competencias: Competencia[] = (competenciasData || []).map((item: any) => ({
        id: item.competencias.id,
        nome: item.competencias.nome,
        descricao: item.competencias.descricao,
        criterios: item.competencias.criterios,
        pontuacoes: item.competencias.criterios.reduce((acc: any, crit: any) => {
          acc[crit.id] = pontuacoesMap[crit.id]?.pontuacao || 0;
          return acc;
        }, {}),
        observacoes: item.competencias.criterios.reduce((acc: any, crit: any) => {
          acc[crit.id] = pontuacoesMap[crit.id]?.observacoes || '';
          return acc;
        }, {}),
      }));

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
        .select('titulo, conteudo')
        .eq('avaliacao_id', id)
        .order('ordem', { ascending: true });

      setAvaliacao({
        ...avaliacaoData,
        competencias,
        perguntas,
        textos: textosData || [],
      } as Avaliacao);
    } catch (error) {
      console.error('Erro ao carregar avaliação:', error);
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

  const calculateMedia = (pontuacoes: Record<string, number>) => {
    const valores = Object.values(pontuacoes).filter(v => v > 0);
    if (valores.length === 0) return 0;
    return valores.reduce((acc, val) => acc + val, 0) / valores.length;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Carregando avaliação...</p>
      </div>
    );
  }

  if (!avaliacao) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Avaliação não encontrada</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Button
            variant="secondary"
            onClick={() => navigate('/user-dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Avaliação</h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6">
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
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span>Status: {getStatusLabel(avaliacao.status)}</span>
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

          {avaliacao.modelo?.descricao && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-900 text-sm">{avaliacao.modelo.descricao}</p>
            </div>
          )}
        </div>

        {avaliacao.competencias.map((competencia, index) => (
          <div
            key={competencia.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6"
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
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6">
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
              </div>
            ))}
          </div>
        )}

        {avaliacao.observacoes && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-6">
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
