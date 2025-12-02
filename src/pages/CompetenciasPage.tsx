import { useState, useEffect } from 'react';
import { Plus, Lock, Search, ArrowUp, ArrowDown, X } from 'lucide-react';
import { Header } from '../components/Header';
import { Table } from '../components/Table';
import { Button } from '../components/Button';
import { useToast } from '../components/Toast';
import { supabase } from '../lib/supabase';
import { useRouter } from '../utils/router';

interface Competencia {
  id: string;
  nome: string;
  fixo: boolean;
  empresa_id: string | null;
  status: string;
  created_at: string;
}

export const CompetenciasPage = () => {
  const { showToast } = useToast();
  const { navigate } = useRouter();
  const [competencias, setCompetencias] = useState<Competencia[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [fixoFilter, setFixoFilter] = useState<'todos' | 'sim' | 'nao'>('todos');
  const [sortBy, setSortBy] = useState<'nome' | 'fixo'>('nome');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const loadCompetencias = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('competencias')
        .select('*')
        .eq('status', 'ativo')
        .order('nome');

      if (error) throw error;
      setCompetencias(data || []);
    } catch (error) {
      console.error('Error loading competencias:', error);
      showToast('error', 'Erro ao carregar competências');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompetencias();
  }, []);

  const handleToggleFixo = async (competencia: Competencia) => {
    try {
      const { error } = await supabase
        .from('competencias')
        .update({ fixo: !competencia.fixo })
        .eq('id', competencia.id);

      if (error) throw error;

      showToast('success', `Competência ${!competencia.fixo ? 'marcada como fixa' : 'desmarcada'}`);
      loadCompetencias();
    } catch (error: any) {
      showToast('error', error.message || 'Erro ao atualizar competência');
    }
  };

  const handleDelete = async (competencia: Competencia) => {
    if (!confirm(`Tem certeza que deseja excluir "${competencia.nome}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('competencias')
        .update({ status: 'arquivado' })
        .eq('id', competencia.id);

      if (error) throw error;

      showToast('success', 'Competência arquivada com sucesso!');
      loadCompetencias();
    } catch (error: any) {
      showToast('error', error.message || 'Erro ao arquivar competência');
    }
  };

  const handleSort = (column: 'nome' | 'fixo') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFixoFilter('todos');
    setSortBy('nome');
    setSortOrder('asc');
  };

  const hasActiveFilters = searchTerm !== '' || fixoFilter !== 'todos';

  const filteredCompetencias = competencias
    .filter((c) => {
      const matchesSearch = c.nome.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFixo =
        fixoFilter === 'todos' ||
        (fixoFilter === 'sim' && c.fixo) ||
        (fixoFilter === 'nao' && !c.fixo);
      return matchesSearch && matchesFixo;
    })
    .sort((a, b) => {
      let compareValue = 0;

      if (sortBy === 'nome') {
        compareValue = a.nome.localeCompare(b.nome);
      } else if (sortBy === 'fixo') {
        compareValue = (a.fixo ? 1 : 0) - (b.fixo ? 1 : 0);
      }

      return sortOrder === 'asc' ? compareValue : -compareValue;
    });

  const renderSortIcon = (column: 'nome' | 'fixo') => {
    if (sortBy !== column) return null;
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-4 h-4 inline-block ml-1" />
    ) : (
      <ArrowDown className="w-4 h-4 inline-block ml-1" />
    );
  };

  const columns = [
    {
      key: 'nome',
      label: (
        <button
          onClick={() => handleSort('nome')}
          className={`flex items-center font-medium transition-colors ${
            sortBy === 'nome' ? 'text-[#6B46C1]' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Nome
          {renderSortIcon('nome')}
        </button>
      ),
      sortable: true,
      render: (c: Competencia) => (
        <div className="flex items-center gap-2">
          {c.fixo && <Lock size={16} className="text-blue-600" />}
          <span className={c.fixo ? 'font-semibold' : ''}>{c.nome}</span>
        </div>
      ),
    },
    {
      key: 'fixo',
      label: (
        <button
          onClick={() => handleSort('fixo')}
          className={`flex items-center font-medium transition-colors ${
            sortBy === 'fixo' ? 'text-[#6B46C1]' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Fixo
          {renderSortIcon('fixo')}
        </button>
      ),
      render: (c: Competencia) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleToggleFixo(c);
          }}
          className={`px-3 py-1 text-xs font-medium rounded-full ${
            c.fixo ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
          }`}
        >
          {c.fixo ? 'Sim' : 'Não'}
        </button>
      ),
    },
  ];

  if (loading) {
    return (
      <>
        <Header title="Competências" />
        <div className="p-6 flex items-center justify-center">
          <p className="text-gray-500">Carregando...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header
        title="Competências"
        action={
          <Button icon={Plus} onClick={() => navigate('/competencias/new')}>
            Adicionar Competência
          </Button>
        }
      />

      <div className="p-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[250px] relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6B46C1]"
              />
            </div>

            <select
              value={fixoFilter}
              onChange={(e) => setFixoFilter(e.target.value as 'todos' | 'sim' | 'nao')}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6B46C1] bg-white"
            >
              <option value="todos">Todas</option>
              <option value="sim">Fixas</option>
              <option value="nao">Não Fixas</option>
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
        </div>

        <div className="text-sm text-gray-600 mb-3">
          Mostrando {filteredCompetencias.length} de {competencias.length} competências
        </div>

        <Table
          data={filteredCompetencias}
          columns={columns}
          onEdit={(c) => navigate(`/competencias/${c.id}/edit`)}
          onDelete={handleDelete}
          selectable
          selectedItems={selectedItems}
          onSelectionChange={setSelectedItems}
          emptyMessage="Nenhuma competência cadastrada."
          totalItems={filteredCompetencias.length}
        />
      </div>
    </>
  );
};
