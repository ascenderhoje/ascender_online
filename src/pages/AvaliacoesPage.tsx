import { useState, useEffect } from 'react';
import { Plus, Mail, Copy, Search, ArrowUp, ArrowDown, X } from 'lucide-react';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { useToast } from '../components/Toast';
import { supabase } from '../lib/supabase';
import { useRouter } from '../utils/router';

interface Avaliacao {
  id: string;
  data_avaliacao: string;
  colaborador_email: string;
  status: string;
  editing_user_name: string | null;
  empresa: { nome: string; id: string };
  colaborador: { nome: string };
  psicologa_responsavel: { nome: string } | null;
}

interface Empresa {
  id: string;
  nome: string;
}

export const AvaliacoesPage = () => {
  const { showToast } = useToast();
  const { navigate } = useRouter();
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [comparativo, setComparativo] = useState<Avaliacao[]>([]);
  const [statusFilter, setStatusFilter] = useState<'todos' | 'finalizada' | 'rascunho'>('todos');
  const [empresaFilter, setEmpresaFilter] = useState<string>('todos');
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [sortBy, setSortBy] = useState<'data_avaliacao' | 'status' | 'empresa' | 'colaborador'>('data_avaliacao');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    loadAvaliacoes();
    loadEmpresas();
  }, []);

  const loadEmpresas = async () => {
    try {
      const { data, error } = await supabase
        .from('empresas')
        .select('id, nome')
        .order('nome');

      if (error) throw error;
      setEmpresas(data || []);
    } catch (error) {
      console.error('Error loading empresas:', error);
    }
  };

  const loadAvaliacoes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('avaliacoes')
        .select(`
          *,
          empresa:empresas(id, nome),
          colaborador:pessoas!colaborador_id(nome),
          psicologa_responsavel:administradores!psicologa_responsavel_id(nome)
        `)
        .order('data_avaliacao', { ascending: false });

      if (error) throw error;
      setAvaliacoes(data || []);
    } catch (error: any) {
      showToast('error', error.message || 'Erro ao carregar avaliações');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta avaliação?')) return;

    try {
      const { error } = await supabase.from('avaliacoes').delete().eq('id', id);
      if (error) throw error;
      showToast('success', 'Avaliação excluída com sucesso');
      loadAvaliacoes();
    } catch (error: any) {
      showToast('error', error.message || 'Erro ao excluir avaliação');
    }
  };

  const handleCopy = async (id: string) => {
    try {
      const { data: original, error: fetchError } = await supabase
        .from('avaliacoes')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      const { error: insertError } = await supabase.from('avaliacoes').insert({
        empresa_id: original.empresa_id,
        colaborador_id: original.colaborador_id,
        modelo_id: original.modelo_id,
        psicologa_responsavel_id: original.psicologa_responsavel_id,
        data_avaliacao: new Date().toISOString().split('T')[0],
        colaborador_email: original.colaborador_email,
        status: 'rascunho',
      });

      if (insertError) throw insertError;
      showToast('success', 'Avaliação duplicada com sucesso');
      loadAvaliacoes();
    } catch (error: any) {
      showToast('error', error.message || 'Erro ao duplicar avaliação');
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((selectedId) => selectedId !== id);
      }
      if (prev.length >= 10) {
        showToast('warning', 'Você pode selecionar no máximo 10 avaliações para comparar');
        return prev;
      }
      return [...prev, id];
    });
  };

  const toggleAllSelection = () => {
    if (selectedIds.length === filteredAvaliacoes.length) {
      setSelectedIds([]);
    } else {
      const toSelect = filteredAvaliacoes.slice(0, 10).map((a) => a.id);
      setSelectedIds(toSelect);
      if (filteredAvaliacoes.length > 10) {
        showToast('warning', 'Apenas as primeiras 10 avaliações foram selecionadas (limite máximo)');
      }
    }
  };

  const adicionarComparativo = () => {
    if (selectedIds.length === 0) {
      showToast('warning', 'Selecione pelo menos uma avaliação para comparar');
      return;
    }

    sessionStorage.setItem('comparativoIds', JSON.stringify(selectedIds));
    navigate('/avaliacoes/comparativo');
  };

  const limparComparativo = () => {
    setComparativo([]);
    setSelectedIds([]);
    showToast('success', 'Comparativo limpo');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getStatusBadge = (status: string) => {
    if (status === 'finalizada') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Finalizada
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        Rascunho
      </span>
    );
  };

  const handleSort = (column: 'data_avaliacao' | 'status' | 'empresa' | 'colaborador') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('todos');
    setEmpresaFilter('todos');
    setSortBy('data_avaliacao');
    setSortOrder('desc');
  };

  const hasActiveFilters = searchTerm !== '' || statusFilter !== 'todos' || empresaFilter !== 'todos';

  const filteredAvaliacoes = avaliacoes
    .filter((avaliacao) => {
      const matchesSearch =
        avaliacao.colaborador.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        avaliacao.empresa.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        avaliacao.colaborador_email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'todos' || avaliacao.status === statusFilter;
      const matchesEmpresa = empresaFilter === 'todos' || avaliacao.empresa.id === empresaFilter;
      return matchesSearch && matchesStatus && matchesEmpresa;
    })
    .sort((a, b) => {
      let compareValue = 0;

      if (sortBy === 'data_avaliacao') {
        compareValue = new Date(a.data_avaliacao).getTime() - new Date(b.data_avaliacao).getTime();
      } else if (sortBy === 'status') {
        const statusOrder = { finalizada: 1, rascunho: 2 };
        compareValue = statusOrder[a.status as keyof typeof statusOrder] - statusOrder[b.status as keyof typeof statusOrder];
      } else if (sortBy === 'empresa') {
        compareValue = a.empresa.nome.localeCompare(b.empresa.nome);
      } else if (sortBy === 'colaborador') {
        compareValue = a.colaborador.nome.localeCompare(b.colaborador.nome);
      }

      return sortOrder === 'asc' ? compareValue : -compareValue;
    });

  return (
    <>
      <Header
        title="Avaliações"
        action={
          <div className="flex gap-2">
            <Button variant="secondary" icon={Mail} disabled={selectedIds.length === 0}>
              E-Mail Devolutiva
            </Button>
            <Button variant="secondary" icon={Copy} disabled={selectedIds.length !== 1}>
              Copiar
            </Button>
            <Button icon={Plus} onClick={() => navigate('/avaliacoes/new')}>
              Adicionar Avaliação
            </Button>
          </div>
        }
      />

      <div className="p-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center mb-4">
            <div className="flex-1 min-w-[250px] relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por colaborador, empresa ou e-mail..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6B46C1]"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'todos' | 'finalizada' | 'rascunho')}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6B46C1] bg-white"
            >
              <option value="todos">Todos os Status</option>
              <option value="finalizada">Finalizadas</option>
              <option value="rascunho">Rascunhos</option>
            </select>

            <select
              value={empresaFilter}
              onChange={(e) => setEmpresaFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6B46C1] bg-white"
            >
              <option value="todos">Todas as Empresas</option>
              {empresas.map((empresa) => (
                <option key={empresa.id} value={empresa.id}>
                  {empresa.nome}
                </option>
              ))}
            </select>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#6B46C1] border border-[#6B46C1] rounded-md hover:bg-[#6B46C1] hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
                Limpar Filtros
              </button>
            )}
          </div>

          {selectedIds.length > 0 && (
            <div className="flex justify-end">
              <Button variant="secondary" onClick={adicionarComparativo}>
                Adicionar Comparativo ({selectedIds.length}/10)
              </Button>
            </div>
          )}
        </div>

        <div className="text-sm text-gray-600 mb-3">
          Mostrando {filteredAvaliacoes.length} de {avaliacoes.length} avaliações
        </div>

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === filteredAvaliacoes.length && filteredAvaliacoes.length > 0}
                      onChange={toggleAllSelection}
                      className="rounded"
                    />
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort('colaborador')}
                      className={`flex items-center text-xs font-medium uppercase tracking-wider transition-colors ${
                        sortBy === 'colaborador' ? 'text-[#6B46C1]' : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Colaborador
                      {sortBy === 'colaborador' && (
                        sortOrder === 'asc' ? <ArrowUp className="w-4 h-4 ml-1" /> : <ArrowDown className="w-4 h-4 ml-1" />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort('empresa')}
                      className={`flex items-center text-xs font-medium uppercase tracking-wider transition-colors ${
                        sortBy === 'empresa' ? 'text-[#6B46C1]' : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Empresa
                      {sortBy === 'empresa' && (
                        sortOrder === 'asc' ? <ArrowUp className="w-4 h-4 ml-1" /> : <ArrowDown className="w-4 h-4 ml-1" />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    E-Mail
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort('data_avaliacao')}
                      className={`flex items-center text-xs font-medium uppercase tracking-wider transition-colors ${
                        sortBy === 'data_avaliacao' ? 'text-[#6B46C1]' : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Data da Avaliação
                      {sortBy === 'data_avaliacao' && (
                        sortOrder === 'asc' ? <ArrowUp className="w-4 h-4 ml-1" /> : <ArrowDown className="w-4 h-4 ml-1" />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Psicóloga responsável
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuário editando
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort('status')}
                      className={`flex items-center text-xs font-medium uppercase tracking-wider transition-colors ${
                        sortBy === 'status' ? 'text-[#6B46C1]' : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Status
                      {sortBy === 'status' && (
                        sortOrder === 'asc' ? <ArrowUp className="w-4 h-4 ml-1" /> : <ArrowDown className="w-4 h-4 ml-1" />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                      Carregando...
                    </td>
                  </tr>
                ) : filteredAvaliacoes.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                      Nenhuma avaliação encontrada
                    </td>
                  </tr>
                ) : (
                  filteredAvaliacoes.map((avaliacao) => (
                    <tr key={avaliacao.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(avaliacao.id)}
                          onChange={() => toggleSelection(avaliacao.id)}
                          className="rounded"
                        />
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">{avaliacao.colaborador.nome}</td>
                      <td className="px-4 py-4 text-sm text-gray-900">{avaliacao.empresa.nome}</td>
                      <td className="px-4 py-4 text-sm text-gray-900">{avaliacao.colaborador_email}</td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {formatDate(avaliacao.data_avaliacao)}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {avaliacao.psicologa_responsavel?.nome || '-'}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {avaliacao.status === 'rascunho' && avaliacao.editing_user_name ? avaliacao.editing_user_name : '-'}
                      </td>
                      <td className="px-4 py-4 text-sm">
                        {getStatusBadge(avaliacao.status)}
                      </td>
                      <td className="px-4 py-4 text-sm text-right space-x-2">
                        <button
                          onClick={() => navigate(`/avaliacoes/${avaliacao.id}/view`)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Visualizar
                        </button>
                        <button
                          onClick={() => navigate(`/avaliacoes/${avaliacao.id}/edit`)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(avaliacao.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {filteredAvaliacoes.length} resultado{filteredAvaliacoes.length !== 1 ? 's' : ''}
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded">
              ← Anterior
            </button>
            <button className="px-3 py-1 text-sm bg-indigo-600 text-white rounded">1</button>
            <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded">2</button>
            <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded">3</button>
            <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded">
              Próxima →
            </button>
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Comparativo</h2>
          <div className="flex gap-2 mb-4">
            <button
              onClick={limparComparativo}
              className="px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded hover:bg-orange-600"
            >
              Limpar
            </button>
            <button
              onClick={() => loadAvaliacoes()}
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded hover:bg-indigo-700"
            >
              Atualizar
            </button>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-8">
            {comparativo.length === 0 ? (
              <div className="text-center text-gray-500">
                Não existe avaliações adicionadas para comparar. Selecione as avaliações e click no
                botão <strong>[Adicionar Comparativo]</strong>.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Data
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Empresa
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Colaborador
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        E-mail
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Psicóloga
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {comparativo.map((avaliacao) => (
                      <tr key={avaliacao.id}>
                        <td className="px-4 py-4 text-sm">{formatDate(avaliacao.data_avaliacao)}</td>
                        <td className="px-4 py-4 text-sm">{avaliacao.empresa.nome}</td>
                        <td className="px-4 py-4 text-sm">{avaliacao.colaborador.nome}</td>
                        <td className="px-4 py-4 text-sm">{avaliacao.colaborador_email}</td>
                        <td className="px-4 py-4 text-sm">
                          {avaliacao.psicologa_responsavel?.nome || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
