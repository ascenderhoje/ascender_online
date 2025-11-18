import { useState, useEffect } from 'react';
import { useRouter } from '../utils/router';
import { supabase } from '../lib/supabase';
import { ArrowLeft, RefreshCw, Trash2, BarChart3 } from 'lucide-react';
import { Button } from '../components/Button';
import { useToast } from '../components/Toast';

interface CriterioData {
  id: string;
  nome: string;
  competenciaNome: string;
  valores: Record<string, number>;
}

interface ColaboradorData {
  id: string;
  nome: string;
  email: string;
  empresa: string;
  data: string;
  criterios: Record<string, number>;
  cor: string;
}

interface BarraGrafico {
  colaboradorNome: string;
  criterioNome: string;
  competenciaNome: string;
  valor: number;
  cor: string;
  isFirstInGroup: boolean;
}

const CORES_DISPONIVEIS = [
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // amber
  '#EF4444', // red
  '#06B6D4', // cyan
  '#EC4899', // pink
  '#8B5CF6', // violet (diferente de purple/indigo)
  '#14B8A6', // teal
  '#F97316', // orange
  '#6B7280', // gray
];

export const ComparativoPage = () => {
  const { navigate } = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [colaboradores, setColaboradores] = useState<ColaboradorData[]>([]);
  const [criterios, setCriterios] = useState<CriterioData[]>([]);

  useEffect(() => {
    const selectedIdsStr = sessionStorage.getItem('comparativoIds');
    if (!selectedIdsStr) {
      navigate('/avaliacoes');
      return;
    }

    const ids = JSON.parse(selectedIdsStr);
    if (ids.length === 0) {
      navigate('/avaliacoes');
      return;
    }

    loadComparativoData(ids);
  }, []);

  const loadComparativoData = async (avaliacaoIds: string[]) => {
    try {
      setLoading(true);

      const { data: avaliacoesData, error: avaliacoesError } = await supabase
        .from('avaliacoes')
        .select(`
          id,
          data_avaliacao,
          colaborador:pessoas!colaborador_id (
            id,
            nome,
            email
          ),
          empresa:empresas (
            nome
          ),
          modelo_id
        `)
        .in('id', avaliacaoIds);

      if (avaliacoesError) throw avaliacoesError;

      if (!avaliacoesData || avaliacoesData.length === 0) {
        showToast('error', 'Nenhuma avaliação encontrada');
        navigate('/avaliacoes');
        return;
      }

      const modeloIds = [...new Set(avaliacoesData.map((a: any) => a.modelo_id))];
      if (modeloIds.length > 1) {
        showToast('warning', 'Avaliações de modelos diferentes. Os resultados podem não ser comparáveis.');
      }

      const { data: competenciasModelo, error: compError } = await supabase
        .from('modelos_competencias')
        .select(`
          competencia_id,
          competencias (
            id,
            nome
          )
        `)
        .eq('modelo_id', modeloIds[0]);

      if (compError) throw compError;

      const competenciaIds = (competenciasModelo || []).map((c: any) => c.competencias.id);
      const competenciasMap: Record<string, string> = {};
      (competenciasModelo || []).forEach((c: any) => {
        competenciasMap[c.competencias.id] = c.competencias.nome;
      });

      const { data: criteriosData, error: criteriosError } = await supabase
        .from('criterios')
        .select(`
          id,
          competencia_id,
          ordem,
          criterios_textos (
            idioma,
            nome
          )
        `)
        .in('competencia_id', competenciaIds)
        .order('ordem');

      if (criteriosError) throw criteriosError;

      const criteriosMap: Record<string, { nome: string; competenciaNome: string; ordem: number }> = {};
      (criteriosData || []).forEach((c: any) => {
        const textoPtBr = (c.criterios_textos || []).find((t: any) => t.idioma === 'pt-BR');
        criteriosMap[c.id] = {
          nome: textoPtBr?.nome || `Critério ${c.ordem + 1}`,
          competenciaNome: competenciasMap[c.competencia_id] || 'N/A',
          ordem: c.ordem,
        };
      });

      const colaboradoresProcessados: ColaboradorData[] = [];

      for (let i = 0; i < avaliacoesData.length; i++) {
        const avaliacao = avaliacoesData[i];

        const { data: pontuacoesData } = await supabase
          .from('avaliacoes_competencias')
          .select('competencia_id, criterio_id, pontuacao')
          .eq('avaliacao_id', avaliacao.id);

        const criteriosPontuacoes: Record<string, number> = {};

        (pontuacoesData || []).forEach((p: any) => {
          if (p.pontuacao !== null && p.pontuacao !== undefined) {
            criteriosPontuacoes[p.criterio_id] = Number(p.pontuacao);
          }
        });

        colaboradoresProcessados.push({
          id: avaliacao.id,
          nome: (avaliacao as any).colaborador?.nome || 'N/A',
          email: (avaliacao as any).colaborador?.email || 'N/A',
          empresa: (avaliacao as any).empresa?.nome || 'N/A',
          data: avaliacao.data_avaliacao,
          criterios: criteriosPontuacoes,
          cor: CORES_DISPONIVEIS[i % CORES_DISPONIVEIS.length],
        });
      }

      const criteriosIds = Object.keys(criteriosMap);
      const criteriosArray: CriterioData[] = criteriosIds
        .sort((a, b) => criteriosMap[a].ordem - criteriosMap[b].ordem)
        .map((critId: string) => {
          const valores: Record<string, number> = {};
          colaboradoresProcessados.forEach((colab) => {
            valores[colab.id] = colab.criterios[critId] || 0;
          });
          return {
            id: critId,
            nome: criteriosMap[critId].nome,
            competenciaNome: criteriosMap[critId].competenciaNome,
            valores,
          };
        });

      setColaboradores(colaboradoresProcessados);
      setCriterios(criteriosArray);
    } catch (error: any) {
      console.error('Erro ao carregar comparativo:', error);
      showToast('error', error.message || 'Erro ao carregar dados do comparativo');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoverColaborador = (id: string) => {
    const novosColaboradores = colaboradores.filter((c) => c.id !== id);

    if (novosColaboradores.length === 0) {
      sessionStorage.removeItem('comparativoIds');
      navigate('/avaliacoes');
      return;
    }

    setColaboradores(novosColaboradores);

    const novosIds = novosColaboradores.map((c) => c.id);
    sessionStorage.setItem('comparativoIds', JSON.stringify(novosIds));

    const novosCriterios = criterios.map((crit) => {
      const novosValores: Record<string, number> = {};
      novosColaboradores.forEach((colab) => {
        novosValores[colab.id] = crit.valores[colab.id];
      });
      return {
        ...crit,
        valores: novosValores,
      };
    });

    setCriterios(novosCriterios);
    showToast('success', 'Colaborador removido do comparativo');
  };

  const handleLimpar = () => {
    sessionStorage.removeItem('comparativoIds');
    navigate('/avaliacoes');
  };

  const handleAtualizar = () => {
    const selectedIdsStr = sessionStorage.getItem('comparativoIds');
    if (selectedIdsStr) {
      const ids = JSON.parse(selectedIdsStr);
      loadComparativoData(ids);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-500">Carregando comparativo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Button
          variant="secondary"
          onClick={() => navigate('/avaliacoes')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para Avaliações
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Comparativo de Avaliações</h1>
        <p className="text-gray-600 mt-1">
          Comparando {colaboradores.length} {colaboradores.length === 1 ? 'colaborador' : 'colaboradores'}
        </p>
      </div>

      <div className="flex gap-2 mb-6">
        <Button
          variant="secondary"
          onClick={handleLimpar}
          icon={Trash2}
        >
          Limpar
        </Button>
        <Button
          onClick={handleAtualizar}
          icon={RefreshCw}
        >
          Atualizar
        </Button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Colaborador
                </th>
                {criterios.map((crit, idx) => (
                  <th key={idx} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div>{crit.nome}</div>
                    <div className="text-[10px] font-normal text-gray-400 mt-0.5 normal-case">
                      {crit.competenciaNome}
                    </div>
                  </th>
                ))}
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {colaboradores.map((colab, idx) => (
                <tr key={colab.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-4 text-sm text-gray-900 whitespace-nowrap">
                    {formatDate(colab.data)}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: colab.cor }}
                      />
                      <div>
                        <div className="font-medium">{colab.nome}</div>
                        <div className="text-xs text-gray-500">{colab.empresa}</div>
                      </div>
                    </div>
                  </td>
                  {criterios.map((crit, critIdx) => (
                    <td key={critIdx} className="px-4 py-4 text-sm text-center">
                      <span className="font-semibold text-gray-900">
                        {crit.valores[colab.id]?.toFixed(2) || '0.00'}
                      </span>
                    </td>
                  ))}
                  <td className="px-4 py-4 text-center">
                    <button
                      onClick={() => handleRemoverColaborador(colab.id)}
                      className="text-red-600 hover:text-red-900 text-sm font-medium"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="flex items-center gap-3 mb-6">
          <BarChart3 className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900">Gráfico Comparativo</h2>
        </div>

        <div className="mb-6 flex flex-wrap gap-4">
          {colaboradores.map((colab) => (
            <div key={colab.id} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: colab.cor }}
              />
              <span className="text-sm font-medium text-gray-700">{colab.nome}</span>
            </div>
          ))}
        </div>

        <div className="space-y-1">
          {(() => {
            const barras: BarraGrafico[] = [];

            criterios.forEach((crit) => {
              colaboradores.forEach((colab, colabIdx) => {
                barras.push({
                  colaboradorNome: colab.nome,
                  criterioNome: crit.nome,
                  competenciaNome: crit.competenciaNome,
                  valor: crit.valores[colab.id] || 0,
                  cor: colab.cor,
                  isFirstInGroup: colabIdx === 0,
                });
              });
            });

            return barras.map((barra, idx) => {
              const percentage = (barra.valor / 5) * 100;

              return (
                <div key={idx}>
                  {barra.isFirstInGroup && idx > 0 && (
                    <div className="h-6" />
                  )}
                  {barra.isFirstInGroup && (
                    <div className="mb-2 mt-4">
                      <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
                        {barra.criterioNome}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {barra.competenciaNome}
                      </p>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <div className="w-40 text-xs text-gray-700 truncate" title={`${barra.colaboradorNome} - ${barra.criterioNome}`}>
                      {barra.colaboradorNome}
                    </div>
                    <div className="flex-1 relative">
                      <div className="h-8 bg-gray-100 rounded-lg overflow-hidden relative">
                        <div
                          className="h-full rounded-lg transition-all duration-500 flex items-center justify-end pr-2"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: barra.cor,
                          }}
                        >
                          {barra.valor > 0 && (
                            <span className="text-xs font-bold text-white drop-shadow">
                              {barra.valor.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="absolute top-0 bottom-0 left-0 right-0 pointer-events-none">
                        <div className="h-full flex items-center">
                          {[1, 2, 3, 4, 5].map((mark) => (
                            <div
                              key={mark}
                              className="absolute h-full border-l border-gray-300 border-dashed"
                              style={{ left: `${(mark / 5) * 100}%` }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="w-12 text-right text-xs text-gray-500">
                      {barra.valor.toFixed(1)}
                    </div>
                  </div>
                </div>
              );
            });
          })()}
        </div>

        <div className="mt-6 flex justify-between items-center text-xs text-gray-500 border-t pt-4">
          <span>0</span>
          <span>1</span>
          <span>2</span>
          <span>3</span>
          <span>4</span>
          <span>5</span>
        </div>
      </div>
    </div>
  );
};
