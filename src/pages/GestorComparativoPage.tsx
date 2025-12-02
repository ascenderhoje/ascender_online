import { useState, useEffect } from 'react';
import { useRouter } from '../utils/router';
import { supabase } from '../lib/supabase';
import { ArrowLeft, RefreshCw, Trash2, BarChart3, ClipboardList } from 'lucide-react';
import { Button } from '../components/Button';
import { useToast } from '../components/Toast';
import { useAuth } from '../contexts/AuthContext';

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
  modeloId: string;
  modeloNome: string;
}

interface BarraGrafico {
  colaboradorNome: string;
  criterioNome: string;
  competenciaNome: string;
  valor: number;
  cor: string;
  isFirstInGroup: boolean;
}

interface ModeloGroup {
  modeloId: string;
  modeloNome: string;
  colaboradores: ColaboradorData[];
  criterios: CriterioData[];
}

const CORES_DISPONIVEIS = [
  '#3B82F6',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#06B6D4',
  '#EC4899',
  '#8B5CF6',
  '#14B8A6',
  '#F97316',
  '#6B7280',
];

export const GestorComparativoPage = () => {
  const { navigate } = useRouter();
  const { showToast } = useToast();
  const { pessoa } = useAuth();
  const [loading, setLoading] = useState(true);
  const [modeloGroups, setModeloGroups] = useState<ModeloGroup[]>([]);
  const [multipleModels, setMultipleModels] = useState(false);
  const [activeModelTab, setActiveModelTab] = useState<string>('');

  useEffect(() => {
    const selectedIdsStr = sessionStorage.getItem('gestorComparativoIds');
    if (!selectedIdsStr) {
      setLoading(false);
      return;
    }

    const ids = JSON.parse(selectedIdsStr);
    if (ids.length === 0) {
      setLoading(false);
      return;
    }

    loadComparativoData(ids);
  }, []);

  const loadComparativoData = async (avaliacaoIds: string[]) => {
    try {
      setLoading(true);

      if (!pessoa) {
        showToast('error', 'Usuário não autenticado');
        navigate('/gestor-dashboard');
        return;
      }

      const { data: gruposGestorData, error: gruposError } = await supabase
        .from('grupos_gestores')
        .select('grupo_id')
        .eq('pessoa_id', pessoa.id);

      if (gruposError) throw gruposError;

      const gruposIds = (gruposGestorData || []).map(g => g.grupo_id);

      if (gruposIds.length === 0) {
        showToast('error', 'Você não gerencia nenhum grupo');
        navigate('/gestor-dashboard');
        return;
      }

      const { data: pessoasGruposData, error: pessoasGruposError } = await supabase
        .from('pessoas_grupos')
        .select('pessoa_id')
        .in('grupo_id', gruposIds);

      if (pessoasGruposError) throw pessoasGruposError;

      const pessoasIds = [...new Set((pessoasGruposData || []).map(pg => pg.pessoa_id))];

      const { data: avaliacoesData, error: avaliacoesError } = await supabase
        .from('avaliacoes')
        .select(`
          id,
          data_avaliacao,
          colaborador_id,
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
        .in('id', avaliacaoIds)
        .eq('status', 'finalizada')
        .in('colaborador_id', pessoasIds);

      if (avaliacoesError) throw avaliacoesError;

      if (!avaliacoesData || avaliacoesData.length === 0) {
        showToast('error', 'Nenhuma avaliação encontrada ou você não tem permissão para visualizá-las');
        navigate('/gestor-pessoas');
        return;
      }

      const modeloIds = [...new Set(avaliacoesData.map((a: any) => a.modelo_id))];
      const hasMultipleModels = modeloIds.length > 1;
      setMultipleModels(hasMultipleModels);

      const { data: modelosData, error: modelosError } = await supabase
        .from('modelos_avaliacao')
        .select('id, nome')
        .in('id', modeloIds);

      if (modelosError) throw modelosError;

      const modelosMap: Record<string, string> = {};
      (modelosData || []).forEach((m: any) => {
        modelosMap[m.id] = m.nome;
      });

      const { data: competenciasModelo, error: compError } = await supabase
        .from('modelos_competencias')
        .select(`
          modelo_id,
          competencia_id,
          competencias (
            id,
            nome
          )
        `)
        .in('modelo_id', modeloIds);

      if (compError) throw compError;

      const competenciasByModelo: Record<string, any[]> = {};
      const competenciasMap: Record<string, string> = {};

      (competenciasModelo || []).forEach((c: any) => {
        if (!competenciasByModelo[c.modelo_id]) {
          competenciasByModelo[c.modelo_id] = [];
        }
        competenciasByModelo[c.modelo_id].push(c.competencias);
        competenciasMap[c.competencias.id] = c.competencias.nome;
      });

      const allCompetenciaIds = [...new Set((competenciasModelo || []).map((c: any) => c.competencias.id))];

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
        .in('competencia_id', allCompetenciaIds)
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
          modeloId: avaliacao.modelo_id,
          modeloNome: modelosMap[avaliacao.modelo_id] || 'Modelo Desconhecido',
        });
      }

      const grupos: ModeloGroup[] = modeloIds.map((modeloId) => {
        const colaboradoresDoModelo = colaboradoresProcessados.filter(
          (c) => c.modeloId === modeloId
        );

        const competenciasDoModelo = competenciasByModelo[modeloId] || [];
        const competenciaIdsDoModelo = competenciasDoModelo.map((c: any) => c.id);

        const criteriosDoModelo = (criteriosData || [])
          .filter((crit: any) => competenciaIdsDoModelo.includes(crit.competencia_id))
          .sort((a: any, b: any) => a.ordem - b.ordem);

        const criteriosArray: CriterioData[] = criteriosDoModelo.map((crit: any) => {
          const textoPtBr = (crit.criterios_textos || []).find((t: any) => t.idioma === 'pt-BR');
          const valores: Record<string, number> = {};

          colaboradoresDoModelo.forEach((colab) => {
            valores[colab.id] = colab.criterios[crit.id] || 0;
          });

          return {
            id: crit.id,
            nome: textoPtBr?.nome || `Critério ${crit.ordem + 1}`,
            competenciaNome: competenciasMap[crit.competencia_id] || 'N/A',
            valores,
          };
        });

        return {
          modeloId,
          modeloNome: modelosMap[modeloId] || 'Modelo Desconhecido',
          colaboradores: colaboradoresDoModelo,
          criterios: criteriosArray,
        };
      });

      setModeloGroups(grupos);
      if (grupos.length > 0) {
        setActiveModelTab(grupos[0].modeloId);
      }
    } catch (error: any) {
      console.error('Erro ao carregar comparativo:', error);
      showToast('error', error.message || 'Erro ao carregar dados do comparativo');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoverColaborador = (id: string) => {
    const todosColaboradores = modeloGroups.flatMap((g) => g.colaboradores);
    const novosColaboradores = todosColaboradores.filter((c) => c.id !== id);

    if (novosColaboradores.length === 0) {
      sessionStorage.removeItem('gestorComparativoIds');
      navigate('/gestor-pessoas');
      return;
    }

    const novosIds = novosColaboradores.map((c) => c.id);
    sessionStorage.setItem('gestorComparativoIds', JSON.stringify(novosIds));

    loadComparativoData(novosIds);
    showToast('success', 'Colaborador removido do comparativo');
  };

  const handleLimpar = () => {
    sessionStorage.removeItem('gestorComparativoIds');
    navigate('/gestor-pessoas');
  };

  const handleAtualizar = () => {
    const selectedIdsStr = sessionStorage.getItem('gestorComparativoIds');
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
      <div className="min-h-screen bg-ascender-neutral flex items-center justify-center">
        <p className="text-gray-500 font-nunito">Carregando comparativo...</p>
      </div>
    );
  }

  if (modeloGroups.length === 0) {
    return (
      <div className="min-h-screen bg-ascender-neutral">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button
            variant="secondary"
            onClick={() => navigate('/gestor-pessoas')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Pessoas
          </Button>
          <h1 className="text-3xl font-poppins font-bold text-ascender-purple mb-6">Comparativo de Avaliações</h1>

          <div className="bg-white rounded-2xl border-2 border-dashed border-gray-300 p-12 text-center shadow-md">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <BarChart3 className="w-8 h-8 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-poppins font-semibold text-gray-900 mb-2">
                  Nenhuma pessoa selecionada para comparação
                </h3>
                <p className="text-gray-600 font-nunito mb-6">
                  Vá para a página Pessoas, selecione as pessoas que deseja comparar e clique em "Adicionar Comparativo".
                </p>
                <Button
                  onClick={() => navigate('/gestor-pessoas')}
                  icon={ClipboardList}
                >
                  Ir para Pessoas
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ascender-neutral">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          variant="secondary"
          onClick={() => navigate('/gestor-pessoas')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para Pessoas
        </Button>
        <h1 className="text-3xl font-poppins font-bold text-ascender-purple mb-2">Comparativo de Avaliações</h1>
        <p className="text-gray-600 font-nunito mb-6">
          Comparando {modeloGroups.reduce((acc, g) => acc + g.colaboradores.length, 0)}{' '}
          {modeloGroups.reduce((acc, g) => acc + g.colaboradores.length, 0) === 1 ? 'colaborador' : 'colaboradores'}
          {multipleModels && ` em ${modeloGroups.length} modelos diferentes`}
        </p>

        {multipleModels && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <BarChart3 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-blue-900 mb-1">
                Comparando {modeloGroups.length} modelos diferentes
              </h3>
              <p className="text-sm text-blue-700">
                As avaliações selecionadas utilizam modelos de avaliação diferentes. Cada modelo
                possui critérios específicos e não podem ser comparados diretamente. Os gráficos
                abaixo estão organizados por modelo.
              </p>
            </div>
          </div>
        )}

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

        {multipleModels && modeloGroups.length > 1 && (
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex gap-2 -mb-px">
                {modeloGroups.map((grupo) => (
                  <button
                    key={grupo.modeloId}
                    onClick={() => setActiveModelTab(grupo.modeloId)}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                      activeModelTab === grupo.modeloId
                        ? 'border-ascender-purple text-ascender-purple'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {grupo.modeloNome}
                    <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-gray-100">
                      {grupo.colaboradores.length}
                    </span>
                  </button>
                ))}
              </nav>
            </div>
          </div>
        )}

        {modeloGroups.map((grupo) => (
          <div
            key={grupo.modeloId}
            className={multipleModels ? (activeModelTab === grupo.modeloId ? 'block' : 'hidden') : 'block'}
          >
            {multipleModels && (
              <div className="mb-4">
                <h2 className="text-lg font-poppins font-bold text-gray-900">{grupo.modeloNome}</h2>
                <p className="text-sm font-nunito text-gray-600">
                  {grupo.colaboradores.length} colaborador{grupo.colaboradores.length !== 1 ? 'es' : ''}
                </p>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-8 shadow-md">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-ascender-purple">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-poppins font-semibold text-white uppercase tracking-wider">
                        Data
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-poppins font-semibold text-white uppercase tracking-wider">
                        Colaborador
                      </th>
                      {grupo.criterios.map((crit, idx) => (
                        <th key={idx} className="px-4 py-3 text-center text-xs font-poppins font-semibold text-white uppercase tracking-wider">
                          <div>{crit.nome}</div>
                          <div className="text-[10px] font-normal text-white/80 mt-0.5 normal-case">
                            {crit.competenciaNome}
                          </div>
                        </th>
                      ))}
                      <th className="px-4 py-3 text-center text-xs font-poppins font-semibold text-white uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {grupo.colaboradores.map((colab, idx) => (
                      <tr key={colab.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-4 text-sm font-nunito text-gray-900 whitespace-nowrap">
                          {formatDate(colab.data)}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full flex-shrink-0"
                              style={{ backgroundColor: colab.cor }}
                            />
                            <div>
                              <div className="font-poppins font-medium">{colab.nome}</div>
                              <div className="text-xs font-nunito text-gray-500">{colab.empresa}</div>
                            </div>
                          </div>
                        </td>
                        {grupo.criterios.map((crit, critIdx) => (
                          <td key={critIdx} className="px-4 py-4 text-sm text-center">
                            <span className="font-poppins font-semibold text-gray-900">
                              {crit.valores[colab.id]?.toFixed(2) || '0.00'}
                            </span>
                          </td>
                        ))}
                        <td className="px-4 py-4 text-center">
                          <button
                            onClick={() => handleRemoverColaborador(colab.id)}
                            className="text-red-600 hover:text-red-900 text-sm font-nunito font-medium"
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

            <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-8 shadow-md">
              <div className="flex items-center gap-3 mb-6">
                <BarChart3 className="w-6 h-6 text-ascender-purple" />
                <h2 className="text-xl font-poppins font-bold text-gray-900">
                  Gráfico Comparativo{multipleModels ? ` - ${grupo.modeloNome}` : ''}
                </h2>
              </div>

              <div className="mb-6 flex flex-wrap gap-4">
                {grupo.colaboradores.map((colab) => (
                  <div key={colab.id} className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: colab.cor }}
                    />
                    <span className="text-sm font-nunito font-medium text-gray-700">{colab.nome}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-1">
                {(() => {
                  const barras: BarraGrafico[] = [];

                  grupo.criterios.forEach((crit) => {
                    grupo.colaboradores.forEach((colab, colabIdx) => {
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
                            <h3 className="text-sm font-poppins font-bold text-gray-800 uppercase tracking-wide">
                              {barra.criterioNome}
                            </h3>
                            <p className="text-xs font-nunito text-gray-500 mt-0.5">
                              {barra.competenciaNome}
                            </p>
                          </div>
                        )}
                        <div className="flex items-center gap-3">
                          <div className="w-40 text-xs font-nunito text-gray-700 truncate" title={`${barra.colaboradorNome} - ${barra.criterioNome}`}>
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
                          <div className="w-12 text-right text-xs font-nunito text-gray-500">
                            {barra.valor.toFixed(1)}
                          </div>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>

              <div className="mt-6 flex justify-between items-center text-xs font-nunito text-gray-500 border-t pt-4">
                <span>0</span>
                <span>1</span>
                <span>2</span>
                <span>3</span>
                <span>4</span>
                <span>5</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
