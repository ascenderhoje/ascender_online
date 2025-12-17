import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from '../utils/router';
import { supabase } from '../lib/supabase';
import { Search, TrendingUp, ListChecks, BarChart3, X } from 'lucide-react';
import { Button } from '../components/Button';
import { useToast } from '../components/Toast';

interface Pessoa {
  id: string;
  nome: string;
  email: string;
  funcao: string | null;
  avatar_url: string | null;
  tipo_acesso: string;
  avaliacoes_count: number;
}

export function GestorPessoasPage() {
  const { pessoa } = useAuth();
  const { navigate } = useRouter();
  const { showToast } = useToast();
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [filteredPessoas, setFilteredPessoas] = useState<Pessoa[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [funcaoFilter, setFuncaoFilter] = useState<string>('todos');
  const [loading, setLoading] = useState(true);
  const [selectedPessoaIds, setSelectedPessoaIds] = useState<string[]>([]);

  const uniqueFuncoes = useMemo(() => {
    const funcoes = pessoas
      .map(p => p.funcao)
      .filter((f): f is string => f !== null && f.trim() !== '');
    return [...new Set(funcoes)].sort((a, b) => a.localeCompare(b));
  }, [pessoas]);

  useEffect(() => {
    loadPessoas();
  }, [pessoa]);

  useEffect(() => {
    let filtered = pessoas;

    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.funcao && p.funcao.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (funcaoFilter !== 'todos') {
      filtered = filtered.filter(p => p.funcao === funcaoFilter);
    }

    setFilteredPessoas(filtered);
  }, [searchTerm, funcaoFilter, pessoas]);

  const hasActiveFilters = searchTerm !== '' || funcaoFilter !== 'todos';

  const clearFilters = () => {
    setSearchTerm('');
    setFuncaoFilter('todos');
  };

  const loadPessoas = async () => {
    if (!pessoa) return;

    try {
      setLoading(true);

      const { data: gruposGestorData, error: gruposError } = await supabase
        .from('grupos_gestores')
        .select('grupo_id')
        .eq('pessoa_id', pessoa.id);

      if (gruposError) throw gruposError;

      const gruposIds = (gruposGestorData || []).map(g => g.grupo_id);

      if (gruposIds.length === 0) {
        setPessoas([]);
        setFilteredPessoas([]);
        return;
      }

      const { data: pessoasGruposData, error: pessoasGruposError } = await supabase
        .from('pessoas_grupos')
        .select(`
          pessoa_id,
          pessoas (
            id,
            nome,
            email,
            funcao,
            avatar_url,
            tipo_acesso
          )
        `)
        .in('grupo_id', gruposIds);

      if (pessoasGruposError) throw pessoasGruposError;

      const pessoasSet = new Map<string, Pessoa>();
      (pessoasGruposData || []).forEach((item: any) => {
        if (item.pessoas && !pessoasSet.has(item.pessoas.id)) {
          pessoasSet.set(item.pessoas.id, {
            id: item.pessoas.id,
            nome: item.pessoas.nome,
            email: item.pessoas.email,
            funcao: item.pessoas.funcao,
            avatar_url: item.pessoas.avatar_url,
            tipo_acesso: item.pessoas.tipo_acesso,
            avaliacoes_count: 0,
          });
        }
      });

      const pessoasList = Array.from(pessoasSet.values());

      const pessoasIds = pessoasList.map(p => p.id);

      if (pessoasIds.length > 0) {
        const { data: avaliacoesCount } = await supabase
          .from('avaliacoes')
          .select('colaborador_id')
          .eq('status', 'finalizada')
          .in('colaborador_id', pessoasIds);

        const countMap = new Map<string, number>();
        (avaliacoesCount || []).forEach((av: any) => {
          countMap.set(av.colaborador_id, (countMap.get(av.colaborador_id) || 0) + 1);
        });

        pessoasList.forEach(p => {
          p.avaliacoes_count = countMap.get(p.id) || 0;
        });
      }

      const pessoasComAvaliacoes = pessoasList.filter(p => p.avaliacoes_count > 0);

      setPessoas(pessoasComAvaliacoes);
      setFilteredPessoas(pessoasComAvaliacoes);
    } catch (error) {
      console.error('Erro ao carregar pessoas:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = (pessoaId: string, hasAvaliacoes: boolean) => {
    if (!hasAvaliacoes) {
      showToast('warning', 'Esta pessoa não possui avaliações finalizadas para comparar');
      return;
    }

    setSelectedPessoaIds((prev) => {
      if (prev.includes(pessoaId)) {
        return prev.filter((id) => id !== pessoaId);
      }
      if (prev.length >= 10) {
        showToast('warning', 'Você pode selecionar no máximo 10 pessoas para comparar');
        return prev;
      }
      return [...prev, pessoaId];
    });
  };

  const toggleAllSelection = () => {
    const pessoasComAvaliacoes = filteredPessoas.filter(p => p.avaliacoes_count > 0);

    if (selectedPessoaIds.length === pessoasComAvaliacoes.length && pessoasComAvaliacoes.length > 0) {
      setSelectedPessoaIds([]);
    } else {
      const toSelect = pessoasComAvaliacoes.slice(0, 10).map((p) => p.id);
      setSelectedPessoaIds(toSelect);
      if (pessoasComAvaliacoes.length > 10) {
        showToast('warning', 'Apenas as primeiras 10 pessoas foram selecionadas (limite máximo)');
      }
    }
  };

  const handleAdicionarComparativo = async () => {
    if (selectedPessoaIds.length === 0) {
      showToast('warning', 'Selecione pelo menos uma pessoa para comparar');
      return;
    }

    try {
      const { data: avaliacoes, error } = await supabase
        .from('avaliacoes')
        .select('id')
        .eq('status', 'finalizada')
        .in('colaborador_id', selectedPessoaIds);

      if (error) throw error;

      if (!avaliacoes || avaliacoes.length === 0) {
        showToast('error', 'Nenhuma avaliação finalizada encontrada para as pessoas selecionadas');
        return;
      }

      const avaliacaoIds = avaliacoes.map(av => av.id);
      sessionStorage.setItem('gestorComparativoIds', JSON.stringify(avaliacaoIds));
      navigate('/gestor-comparativo');
    } catch (error: any) {
      console.error('Erro ao buscar avaliações:', error);
      showToast('error', 'Erro ao buscar avaliações para comparativo');
    }
  };

  const handleLimparSelecao = () => {
    setSelectedPessoaIds([]);
    sessionStorage.removeItem('gestorComparativoIds');
    showToast('success', 'Seleção limpa');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-ascender-neutral flex items-center justify-center">
        <p className="text-gray-500 font-nunito">Carregando...</p>
      </div>
    );
  }

  const getInitials = (nome: string) => {
    const names = nome.split(' ');
    if (names.length >= 2) {
      return `${names[0].charAt(0)}${names[1].charAt(0)}`.toUpperCase();
    }
    return nome.charAt(0).toUpperCase();
  };

  const getTipoAcessoLabel = (tipo: string) => {
    if (tipo === 'gestor') return 'Gestor';
    if (tipo === 'colaborador') return 'Colaborador';
    return tipo;
  };

  const pessoasComAvaliacoes = filteredPessoas.filter(p => p.avaliacoes_count > 0);
  const allSelectableSelected = pessoasComAvaliacoes.length > 0 &&
    selectedPessoaIds.length === pessoasComAvaliacoes.length;

  return (
    <div className="min-h-screen bg-ascender-neutral">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-poppins font-bold text-ascender-purple mb-6">Pessoas</h1>

          <div className="flex flex-wrap gap-4 mb-4 items-center">
            <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar por nome, e-mail ou funcao..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ascender-purple focus:border-transparent font-nunito"
              />
            </div>

            <select
              value={funcaoFilter}
              onChange={(e) => setFuncaoFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ascender-purple focus:border-transparent font-nunito bg-white"
            >
              <option value="todos">Todas as Funcoes</option>
              {uniqueFuncoes.map((funcao) => (
                <option key={funcao} value={funcao}>
                  {funcao}
                </option>
              ))}
            </select>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-ascender-purple border border-ascender-purple rounded-xl hover:bg-ascender-purple hover:text-white transition-colors font-nunito"
              >
                <X className="w-4 h-4" />
                Limpar Filtros
              </button>
            )}

            {selectedPessoaIds.length > 0 && (
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={handleLimparSelecao}
                  className="whitespace-nowrap"
                >
                  Limpar Seleção
                </Button>
                <Button
                  onClick={handleAdicionarComparativo}
                  icon={BarChart3}
                  className="whitespace-nowrap"
                >
                  Adicionar Comparativo ({selectedPessoaIds.length}/10)
                </Button>
              </div>
            )}
          </div>
        </div>

        {filteredPessoas.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center border border-gray-200">
            <p className="text-gray-500 font-nunito">
              {searchTerm ? 'Nenhuma pessoa encontrada com esse critério de busca.' : 'Nenhuma pessoa encontrada nos grupos que você gerencia.'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left w-12">
                      <input
                        type="checkbox"
                        checked={allSelectableSelected}
                        onChange={toggleAllSelection}
                        className="rounded border-gray-300 text-ascender-purple focus:ring-ascender-purple"
                        disabled={pessoasComAvaliacoes.length === 0}
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-poppins font-semibold text-gray-500 uppercase tracking-wider">
                      Nome
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-poppins font-semibold text-gray-500 uppercase tracking-wider">
                      Função
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-poppins font-semibold text-gray-500 uppercase tracking-wider">
                      Avaliações
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-poppins font-semibold text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPessoas.map((pessoaItem, index) => {
                    const hasAvaliacoes = pessoaItem.avaliacoes_count > 0;
                    const isSelected = selectedPessoaIds.includes(pessoaItem.id);

                    return (
                      <tr
                        key={pessoaItem.id}
                        className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} ${!hasAvaliacoes ? 'opacity-60' : ''}`}
                      >
                        <td className="px-4 py-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelection(pessoaItem.id, hasAvaliacoes)}
                            disabled={!hasAvaliacoes}
                            className="rounded border-gray-300 text-ascender-purple focus:ring-ascender-purple disabled:opacity-50 disabled:cursor-not-allowed"
                            title={!hasAvaliacoes ? 'Esta pessoa não possui avaliações finalizadas' : ''}
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="flex-shrink-0">
                              {pessoaItem.avatar_url ? (
                                <img
                                  className="h-12 w-12 rounded-full object-cover"
                                  src={pessoaItem.avatar_url}
                                  alt={pessoaItem.nome}
                                />
                              ) : (
                                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-ascender-yellow to-yellow-500 flex items-center justify-center shadow-md">
                                  <span className="text-white font-poppins font-bold text-sm">
                                    {getInitials(pessoaItem.nome)}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="text-base font-poppins font-semibold text-gray-900">
                                {pessoaItem.nome}
                              </div>
                              <div className="text-sm font-nunito text-gray-600">
                                {pessoaItem.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-nunito text-gray-900">
                          {pessoaItem.funcao || '-'}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {hasAvaliacoes ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {pessoaItem.avaliacoes_count}
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                              0
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => navigate(`/gestor-pessoa/${pessoaItem.id}`)}
                              className="px-3 py-1.5 text-sm font-nunito text-ascender-purple hover:bg-ascender-purple-light/10 rounded-lg transition-colors"
                            >
                              Avaliações
                            </button>
                            <button
                              onClick={() => navigate(`/gestor-pessoa/${pessoaItem.id}?tab=pdi`)}
                              className="px-3 py-1.5 text-sm font-nunito text-ascender-purple hover:bg-ascender-purple-light/10 rounded-lg transition-colors flex items-center gap-1"
                            >
                              <TrendingUp size={14} />
                              PDI
                            </button>
                            <button
                              onClick={() => navigate(`/gestor-pessoa/${pessoaItem.id}?tab=acoes`)}
                              className="px-3 py-1.5 text-sm font-nunito text-ascender-purple hover:bg-ascender-purple-light/10 rounded-lg transition-colors flex items-center gap-1"
                            >
                              <ListChecks size={14} />
                              Ações
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {filteredPessoas.length > 0 && (
          <div className="mt-4 text-sm text-gray-600 font-nunito">
            {filteredPessoas.length} pessoa{filteredPessoas.length !== 1 ? 's' : ''} encontrada{filteredPessoas.length !== 1 ? 's' : ''}
            {pessoasComAvaliacoes.length > 0 && (
              <span className="ml-2">
                • {pessoasComAvaliacoes.length} com avaliações finalizadas
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
