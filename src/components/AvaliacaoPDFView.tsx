import { User, Calendar, FileText } from 'lucide-react';

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

interface AvaliacaoPDFViewProps {
  avaliacao: Avaliacao;
}

export function AvaliacaoPDFView({ avaliacao }: AvaliacaoPDFViewProps) {
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

  return (
    <div className="bg-white p-8 max-w-[210mm]" style={{ fontFamily: 'Arial, sans-serif' }}>
      <div className="mb-8 pb-6 border-b-2 border-gray-300">
        <div className="flex items-start gap-6 mb-6">
          <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {avaliacao.colaborador?.nome}
            </h1>
            <p className="text-gray-600 text-lg mb-3">{avaliacao.modelo?.nome}</p>
            <div className="flex items-center gap-6 text-sm text-gray-600">
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
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {calculateMedia(
                    avaliacao.competencias.reduce((acc, comp) => {
                      return { ...acc, ...comp.pontuacoes };
                    }, {})
                  ).toFixed(1)}
                </div>
                <div className="text-xs text-white">Média</div>
              </div>
            </div>
          </div>
        </div>

        {avaliacao.psicologa && (
          <div className="bg-blue-50 border border-blue-200 rounded p-3">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Psicóloga Responsável:</span> {avaliacao.psicologa.nome}
            </p>
          </div>
        )}
      </div>

      {avaliacao.textos.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-300">
            Análise Geral
          </h2>
          {avaliacao.textos.map((texto, index) => (
            <div key={index} className="mb-6 break-inside-avoid">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-blue-600 text-white rounded flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">{texto.titulo}</h3>
              </div>
              <div
                className="text-sm text-gray-700 leading-relaxed pl-11"
                dangerouslySetInnerHTML={{ __html: texto.conteudo }}
              />
              {texto.titulo === 'Sugestões de Desenvolvimento' && avaliacao.pdiTagsDetails && avaliacao.pdiTagsDetails.length > 0 && (
                <div className="mt-4 pl-11">
                  <h4 className="text-xs font-semibold text-gray-700 mb-2">Tags PDI Relacionadas</h4>
                  <div className="flex flex-wrap gap-2">
                    {avaliacao.pdiTagsDetails.map((tag) => (
                      <span
                        key={tag.id}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200"
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

      {avaliacao.competencias.map((competencia, index) => (
        <div key={competencia.id} className="mb-8 break-inside-avoid">
          <div className="mb-4">
            <div className="flex items-start gap-3 mb-3 pb-2 border-b border-gray-300">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded flex items-center justify-center font-bold">
                {index + 1}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900">
                  {competencia.nome}
                </h3>
                {competencia.descricao && (
                  <p className="text-gray-600 text-sm mt-1">
                    {competencia.descricao}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4 pl-4">
            {competencia.criterios.map((criterio) => {
              const pontuacao = competencia.pontuacoes[criterio.id] || 0;
              const observacoes = competencia.observacoes[criterio.id];
              const percentage = (pontuacao / 5) * 100;

              return (
                <div key={criterio.id} className="border-l-4 border-gray-300 pl-4 break-inside-avoid">
                  <div className="mb-2">
                    <h4 className="font-semibold text-gray-900 text-sm">{criterio.nome}</h4>
                    {criterio.descricao && (
                      <p className="text-xs text-gray-600 mt-1">
                        {criterio.descricao}
                      </p>
                    )}
                  </div>

                  <div className="mb-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-700">Pontuação</span>
                      <span className="text-sm font-bold text-gray-900">
                        {pontuacao.toFixed(1)} / 5.0
                      </span>
                    </div>
                    <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="absolute top-0 left-0 h-full bg-blue-600 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>

                  {observacoes && (
                    <div className="mt-2 bg-gray-50 border border-gray-200 rounded p-2">
                      <p className="text-xs text-gray-700">{observacoes}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {avaliacao.perguntas.length > 0 && (
        <div className="mb-8 break-inside-avoid">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-300">
            Análise Observativa
          </h2>
          <div className="space-y-4">
            {avaliacao.perguntas.map((pergunta) => (
              <div key={pergunta.id} className="border-l-4 border-blue-600 pl-4 break-inside-avoid">
                <h4 className="font-semibold text-gray-900 text-sm mb-1">{pergunta.titulo}</h4>
                {pergunta.descricao && (
                  <p className="text-xs text-gray-600 mb-2">{pergunta.descricao}</p>
                )}
                {pergunta.resposta && (
                  <div className="bg-gray-50 border border-gray-200 rounded p-2">
                    <p className="text-xs text-gray-700 whitespace-pre-wrap">
                      {pergunta.resposta.texto || '-'}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {avaliacao.observacoes && (
        <div className="bg-yellow-50 border border-yellow-300 rounded p-4 break-inside-avoid">
          <h3 className="text-base font-semibold text-yellow-900 mb-2">
            Observações Gerais
          </h3>
          <p className="text-sm text-yellow-800">{avaliacao.observacoes}</p>
        </div>
      )}
    </div>
  );
}
