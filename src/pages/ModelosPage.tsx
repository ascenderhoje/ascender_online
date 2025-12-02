import { useState, useEffect } from 'react';
import { Plus, Search, ArrowUp, ArrowDown, X } from 'lucide-react';
import { Header } from '../components/Header';
import { Table } from '../components/Table';
import { Button } from '../components/Button';
import { useToast } from '../components/Toast';
import { supabase } from '../lib/supabase';
import { useRouter } from '../utils/router';

interface Modelo {
  id: string;
  nome: string;
  status: 'rascunho' | 'publicado';
  empresa_id: string | null;
  created_at: string;
}

export const ModelosPage = () => {
  const { showToast } = useToast();
  const { navigate } = useRouter();
  const [modelos, setModelos] = useState<Modelo[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'publicado' | 'rascunho'>('todos');
  const [sortBy, setSortBy] = useState<'nome' | 'status' | 'created_at'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const loadModelos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('modelos_avaliacao')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setModelos(data || []);
    } catch (error) {
      console.error('Error loading modelos:', error);
      showToast('error', 'Erro ao carregar modelos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadModelos();
  }, []);

  const handleDelete = async (modelo: Modelo) => {
    if (!confirm(`Tem certeza que deseja excluir "${modelo.nome}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('modelos_avaliacao')
        .delete()
        .eq('id', modelo.id);

      if (error) throw error;

      showToast('success', 'Modelo excluído com sucesso!');
      loadModelos();
    } catch (error: any) {
      showToast('error', error.message || 'Erro ao excluir modelo');
    }
  };

  const handleSort = (column: 'nome' | 'status' | 'created_at') => {
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
    setSortBy('created_at');
    setSortOrder('desc');
  };

  const hasActiveFilters = searchTerm !== '' || statusFilter !== 'todos';

  const filteredModelos = modelos
    .filter((m) => {
      const matchesSearch = m.nome.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'todos' || m.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let compareValue = 0;

      if (sortBy === 'nome') {
        compareValue = a.nome.localeCompare(b.nome);
      } else if (sortBy === 'status') {
        const statusOrder = { publicado: 1, rascunho: 2 };
        compareValue = statusOrder[a.status] - statusOrder[b.status];
      } else if (sortBy === 'created_at') {
        compareValue = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }

      return sortOrder === 'asc' ? compareValue : -compareValue;
    });

  const renderSortIcon = (column: 'nome' | 'status' | 'created_at') => {
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
    },
    {
      key: 'status',
      label: (
        <button
          onClick={() => handleSort('status')}
          className={`flex items-center font-medium transition-colors ${
            sortBy === 'status' ? 'text-[#6B46C1]' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Status
          {renderSortIcon('status')}
        </button>
      ),
      render: (m: Modelo) => (
        <span
          className={`px-3 py-1 text-xs font-medium rounded-full ${
            m.status === 'publicado'
              ? 'bg-green-100 text-green-700'
              : 'bg-yellow-100 text-yellow-700'
          }`}
        >
          {m.status === 'publicado' ? 'Publicado' : 'Rascunho'}
        </span>
      ),
    },
    {
      key: 'created_at',
      label: (
        <button
          onClick={() => handleSort('created_at')}
          className={`flex items-center font-medium transition-colors ${
            sortBy === 'created_at' ? 'text-[#6B46C1]' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Criado em
          {renderSortIcon('created_at')}
        </button>
      ),
      render: (m: Modelo) => {
        const date = new Date(m.created_at);
        return <span className="text-sm text-gray-600">{date.toLocaleDateString('pt-BR')}</span>;
      },
    },
  ];

  if (loading) {
    return (
      <>
        <Header title="Modelos de Avaliação" />
        <div className="p-6 flex items-center justify-center">
          <p className="text-gray-500">Carregando...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header
        title="Modelos de Avaliação"
        action={
          <Button icon={Plus} onClick={() => navigate('/modelos/new')}>
            Adicionar Modelo
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
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'todos' | 'publicado' | 'rascunho')}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6B46C1] bg-white"
            >
              <option value="todos">Todos os Status</option>
              <option value="publicado">Publicados</option>
              <option value="rascunho">Rascunhos</option>
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
          Mostrando {filteredModelos.length} de {modelos.length} modelos
        </div>

        <Table
          data={filteredModelos}
          columns={columns}
          onEdit={(m) => navigate(`/modelos/${m.id}/edit`)}
          onDelete={handleDelete}
          selectable
          selectedItems={selectedItems}
          onSelectionChange={setSelectedItems}
          emptyMessage="Nenhum modelo cadastrado."
          totalItems={filteredModelos.length}
        />
      </div>
    </>
  );
};
