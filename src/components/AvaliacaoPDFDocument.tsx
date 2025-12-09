import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';

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

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#FFFFFF',
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottom: '2 solid #E5E7EB',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
  },
  colaboradorNome: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  modeloNome: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  headerInfo: {
    flexDirection: 'row',
    gap: 20,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    fontSize: 9,
    color: '#6B7280',
  },
  mediaBox: {
    width: 70,
    height: 70,
    backgroundColor: '#2563EB',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaValor: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  mediaLabel: {
    fontSize: 8,
    color: '#FFFFFF',
    marginTop: 2,
  },
  psicologaBox: {
    backgroundColor: '#EFF6FF',
    border: '1 solid #BFDBFE',
    borderRadius: 6,
    padding: 10,
    marginTop: 10,
  },
  psicologaText: {
    fontSize: 9,
    color: '#1F2937',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
    paddingBottom: 6,
    borderBottom: '1 solid #E5E7EB',
  },
  competenciaCard: {
    marginBottom: 18,
    break: 'avoid',
  },
  competenciaHeader: {
    flexDirection: 'row',
    marginBottom: 10,
    paddingBottom: 8,
    borderBottom: '1 solid #E5E7EB',
  },
  competenciaNumero: {
    width: 35,
    height: 35,
    backgroundColor: '#2563EB',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  competenciaNumeroText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  competenciaNome: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
  },
  competenciaDescricao: {
    fontSize: 9,
    color: '#6B7280',
    marginTop: 3,
  },
  criterioContainer: {
    marginBottom: 12,
    marginLeft: 15,
    paddingLeft: 12,
    borderLeft: '3 solid #E5E7EB',
  },
  criterioNome: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 3,
  },
  criterioDescricao: {
    fontSize: 8,
    color: '#6B7280',
    marginBottom: 6,
  },
  pontuacaoContainer: {
    marginBottom: 6,
  },
  pontuacaoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  pontuacaoLabel: {
    fontSize: 8,
    color: '#374151',
  },
  pontuacaoValor: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#111827',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2563EB',
    borderRadius: 4,
  },
  observacoesBox: {
    backgroundColor: '#F9FAFB',
    border: '1 solid #E5E7EB',
    borderRadius: 4,
    padding: 8,
    marginTop: 6,
  },
  observacoesText: {
    fontSize: 8,
    color: '#374151',
    lineHeight: 1.4,
  },
  textoCard: {
    marginBottom: 15,
  },
  textoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  textoIconBox: {
    width: 28,
    height: 28,
    backgroundColor: '#2563EB',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  textoTitulo: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#111827',
  },
  textoConteudo: {
    fontSize: 9,
    color: '#374151',
    lineHeight: 1.5,
    marginLeft: 36,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
    marginLeft: 36,
  },
  tagsLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 6,
    marginLeft: 36,
  },
  tag: {
    backgroundColor: '#DBEAFE',
    border: '1 solid #93C5FD',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagText: {
    fontSize: 8,
    color: '#1E40AF',
  },
  perguntaCard: {
    marginBottom: 12,
    marginLeft: 15,
    paddingLeft: 12,
    borderLeft: '3 solid #2563EB',
  },
  perguntaTitulo: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 3,
  },
  perguntaDescricao: {
    fontSize: 8,
    color: '#6B7280',
    marginBottom: 6,
  },
  respostaBox: {
    backgroundColor: '#F9FAFB',
    border: '1 solid #E5E7EB',
    borderRadius: 4,
    padding: 8,
  },
  respostaText: {
    fontSize: 8,
    color: '#374151',
    lineHeight: 1.4,
  },
  observacoesGeraisBox: {
    backgroundColor: '#FEF3C7',
    border: '1 solid #FCD34D',
    borderRadius: 6,
    padding: 12,
    marginTop: 10,
  },
  observacoesGeraisTitulo: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#78350F',
    marginBottom: 6,
  },
  observacoesGeraisText: {
    fontSize: 9,
    color: '#92400E',
    lineHeight: 1.4,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 9,
    color: '#9CA3AF',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    fontSize: 8,
  },
  statusFinalizada: {
    backgroundColor: '#D1FAE5',
    color: '#065F46',
  },
  statusRascunho: {
    backgroundColor: '#FEF3C7',
    color: '#92400E',
  },
});

interface AvaliacaoPDFDocumentProps {
  avaliacao: Avaliacao;
}

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

const stripHtml = (html: string): string => {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<li>/gi, '• ')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim();
};

export function AvaliacaoPDFDocument({ avaliacao }: AvaliacaoPDFDocumentProps) {
  const mediaGeral = calculateMedia(
    avaliacao.competencias.reduce((acc, comp) => {
      return { ...acc, ...comp.pontuacoes };
    }, {})
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <Text style={styles.colaboradorNome}>
                {avaliacao.colaborador?.nome || 'Colaborador'}
              </Text>
              <Text style={styles.modeloNome}>
                {avaliacao.modelo?.nome || 'Modelo de Avaliação'}
              </Text>
              <View style={styles.headerInfo}>
                <Text style={styles.infoItem}>
                  Data: {formatDate(avaliacao.data_avaliacao)}
                </Text>
                <Text style={styles.infoItem}>
                  Status: {getStatusLabel(avaliacao.status)}
                </Text>
              </View>
            </View>
            <View style={styles.mediaBox}>
              <Text style={styles.mediaValor}>{mediaGeral.toFixed(1)}</Text>
              <Text style={styles.mediaLabel}>Média</Text>
            </View>
          </View>

          {avaliacao.psicologa && (
            <View style={styles.psicologaBox}>
              <Text style={styles.psicologaText}>
                Psicóloga Responsável: {avaliacao.psicologa.nome}
              </Text>
            </View>
          )}
        </View>

        {avaliacao.textos.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Análise Geral</Text>
            {avaliacao.textos.map((texto, index) => (
              <View key={index} style={styles.textoCard} wrap={false}>
                <View style={styles.textoHeader}>
                  <View style={styles.textoIconBox}>
                    <Text style={{ color: '#FFFFFF', fontSize: 12 }}>📄</Text>
                  </View>
                  <Text style={styles.textoTitulo}>{texto.titulo}</Text>
                </View>
                <Text style={styles.textoConteudo}>
                  {stripHtml(texto.conteudo)}
                </Text>
                {texto.titulo === 'Sugestões de Desenvolvimento' &&
                  avaliacao.pdiTagsDetails &&
                  avaliacao.pdiTagsDetails.length > 0 && (
                    <View>
                      <Text style={styles.tagsLabel}>Tags PDI Relacionadas</Text>
                      <View style={styles.tagsContainer}>
                        {avaliacao.pdiTagsDetails.map((tag) => (
                          <View key={tag.id} style={styles.tag}>
                            <Text style={styles.tagText}>{tag.nome}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
              </View>
            ))}
          </View>
        )}

        {avaliacao.competencias.map((competencia, index) => (
          <View key={competencia.id} style={styles.competenciaCard} wrap={false}>
            <View style={styles.competenciaHeader}>
              <View style={styles.competenciaNumero}>
                <Text style={styles.competenciaNumeroText}>{index + 1}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.competenciaNome}>{competencia.nome}</Text>
                {competencia.descricao && (
                  <Text style={styles.competenciaDescricao}>
                    {competencia.descricao}
                  </Text>
                )}
              </View>
            </View>

            {competencia.criterios.map((criterio) => {
              const pontuacao = competencia.pontuacoes[criterio.id] || 0;
              const observacoes = competencia.observacoes[criterio.id];
              const percentage = (pontuacao / 5) * 100;

              return (
                <View key={criterio.id} style={styles.criterioContainer}>
                  <Text style={styles.criterioNome}>{criterio.nome}</Text>
                  {criterio.descricao && (
                    <Text style={styles.criterioDescricao}>
                      {criterio.descricao}
                    </Text>
                  )}

                  <View style={styles.pontuacaoContainer}>
                    <View style={styles.pontuacaoHeader}>
                      <Text style={styles.pontuacaoLabel}>Pontuação</Text>
                      <Text style={styles.pontuacaoValor}>
                        {pontuacao.toFixed(1)} / 5.0
                      </Text>
                    </View>
                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progressFill,
                          { width: `${percentage}%` },
                        ]}
                      />
                    </View>
                  </View>

                  {observacoes && (
                    <View style={styles.observacoesBox}>
                      <Text style={styles.observacoesText}>{observacoes}</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        ))}

        {avaliacao.perguntas.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Análise Observativa</Text>
            {avaliacao.perguntas.map((pergunta) => (
              <View key={pergunta.id} style={styles.perguntaCard}>
                <Text style={styles.perguntaTitulo}>{pergunta.titulo}</Text>
                {pergunta.descricao && (
                  <Text style={styles.perguntaDescricao}>
                    {pergunta.descricao}
                  </Text>
                )}
                {pergunta.resposta && (
                  <View style={styles.respostaBox}>
                    <Text style={styles.respostaText}>
                      {pergunta.resposta.texto || '-'}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {avaliacao.observacoes && (
          <View style={styles.observacoesGeraisBox}>
            <Text style={styles.observacoesGeraisTitulo}>
              Observações Gerais
            </Text>
            <Text style={styles.observacoesGeraisText}>
              {avaliacao.observacoes}
            </Text>
          </View>
        )}

        <Text
          style={styles.footer}
          render={({ pageNumber, totalPages }) =>
            `Página ${pageNumber} de ${totalPages} - Gerado em ${formatDate(
              new Date().toISOString()
            )}`
          }
          fixed
        />
      </Page>
    </Document>
  );
}
