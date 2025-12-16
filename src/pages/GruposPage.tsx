import { useState, useEffect } from 'react';
import { Plus, Search, ArrowUp, ArrowDown, X } from 'lucide-react';
import { Header } from '../components/Header';
import { Table } from '../components/Table';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { GrupoForm } from '../components/GrupoForm';
import { useToast } from '../components/Toast';
import { supabase } from '../lib/supabase';

interface Grupo {
  id: string;
  nome: string;
  empresa_id: string | null;
  created_at: string;
}

interface GrupoWithEmpresa extends Grupo {
  empresa?: { id: string; nome: string } | null;
}

interface Empresa {
  id: string;
  nome: string;
}

export const GruposPage = () => {
  const { showToast } = useToast();
  const [grupos, setGrupos] = useState<GrupoWithEmpresa[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [grupoToEdit, setGrupoToEdit] = useState<GrupoWithEmpresa | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [empresaFilter, setEmpresaFilter] = useState<string>('todos');
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [sortBy, setSortBy] = useState<'nome' | 'empresa' | 'created_at'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const loadGrupos = async () => {
    try {
      setLoading(true);
      const { data: gruposData, error: gruposError } = await supabase
        .from('grupos')
        .select(`
          *,
          empresa:empresas(id, nome)
        `)
        .order('created_at', { ascending: false });

      if (gruposError) throw gruposError;

      setGrupos(gruposData || []);
    } catch (error) {
      console.error('Error loading grupos:', error);
      showToast('error', 'Erro ao carregar grupos');
    } finally {
      setLoading(false);
    }
  };

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

  useEffect(() => {
    loadGrupos();
    loadEmpresas();
  }, []);

  const handleSort = (column: 'nome' | 'empresa' | 'created_at') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setEmpresaFilter('todos');
    setSortBy('created_at');
    setSortOrder('desc');
  };

  const hasActiveFilters = searchTerm !== '' || empresaFilter !== 'todos';

  const filteredGrupos = grupos
    .filter((g) => {
      const matchesSearch = g.nome.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesEmpresa =
        empresaFilter === 'todos' ||
        (empresaFilter === 'sem-empresa' && !g.empresa_id) ||
        g.empresa_id === empresaFilter;
      return matchesSearch && matchesEmpresa;
    })
    .sort((a, b) => {
      let compareValue = 0;

      if (sortBy === 'nome') {
        compareValue = a.nome.localeCompare(b.nome);
      } else if (sortBy === 'empresa') {
        const empresaA = a.empresa?.nome || '';
        const empresaB = b.empresa?.nome || '';
        if (!a.empresa_id && b.empresa_id) return sortOrder === 'asc' ? 1 : -1;
        if (a.empresa_id && !b.empresa_id) return sortOrder === 'asc' ? -1 : 1;
        compareValue = empresaA.localeCompare(empresaB);
      } else if (sortBy === 'created_at') {
        compareValue = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }

      return sortOrder === 'asc' ? compareValue : -compareValue;
    });

  const handleCreate = async (formData: any) => {
    try {
      const { data: grupoData, error: grupoError } = await supabase
        .from('grupos')
        .insert([{
          nome: formData.nome,
          empresa_id: formData.empresa_id || null
        }])
        .select()
        .single();

      if (grupoError) throw grupoError;

      if (grupoData && formData.membros?.length > 0) {
        const membrosInsert = formData.membros.map((pessoaId: string) => ({
          grupo_id: grupoData.id,
          pessoa_id: pessoaId,
        }));

        const { error: membrosError } = await supabase
          .from('pessoas_grupos')
          .insert(membrosInsert);

        if (membrosError) throw membrosError;
      }

      if (grupoData && formData.gestores?.length > 0) {
        const gestoresInsert = formData.gestores.map((pessoaId: string) => ({
          grupo_id: grupoData.id,
          pessoa_id: pessoaId,
        }));

        const { error: gestoresError } = await supabase
          .from('grupos_gestores')
          .insert(gestoresInsert);

        if (gestoresError) throw gestoresError;
      }

      showToast('success', 'Grupo criado com sucesso!');
      setIsCreateModalOpen(false);
      loadGrupos();
    } catch (error: any) {
      console.error('Error creating grupo:', error);
      showToast('error', error.message || 'Erro ao criar grupo');
    }
  };

  const handleEdit = (grupo: GrupoWithEmpresa) => {
    setGrupoToEdit(grupo);
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (formData: any) => {
    if (!grupoToEdit) return;

    try {
      const { error: grupoError } = await supabase
        .from('grupos')
        .update({
          nome: formData.nome,
          empresa_id: formData.empresa_id || null
        })
        .eq('id', grupoToEdit.id);

      if (grupoError) throw grupoError;

      await supabase
        .from('pessoas_grupos')
        .delete()
        .eq('grupo_id', grupoToEdit.id);

      await supabase
        .from('grupos_gestores')
        .delete()
        .eq('grupo_id', grupoToEdit.id);

      if (formData.membros?.length > 0) {
        const membrosInsert = formData.membros.map((pessoaId: string) => ({
          grupo_id: grupoToEdit.id,
          pessoa_id: pessoaId,
        }));

        const { error: membrosError } = await supabase
          .from('pessoas_grupos')
          .insert(membrosInsert);

        if (membrosError) throw membrosError;
      }

      if (formData.gestores?.length > 0) {
        const gestoresInsert = formData.gestores.map((pessoaId: string) => ({
          grupo_id: grupoToEdit.id,
          pessoa_id: pessoaId,
        }));

        const { error: gestoresError } = await supabase
          .from('grupos_gestores')
          .insert(gestoresInsert);

        if (gestoresError) throw gestoresError;
      }

      showToast('success', 'Grupo atualizado com sucesso!');
      setIsEditModalOpen(false);
      setGrupoToEdit(null);
      loadGrupos();
    } catch (error: any) {
      console.error('Error updating grupo:', error);
      showToast('error', error.message || 'Erro ao atualizar grupo');
    }
  };

  const handleDelete = async (grupo: Grupo) => {
    if (!confirm(`Tem certeza que deseja excluir "${grupo.nome}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('grupos')
        .delete()
        .eq('id', grupo.id);

      if (error) throw error;

      showToast('success', 'Grupo excluído com sucesso!');
      loadGrupos();
    } catch (error: any) {
      console.error('Error deleting grupo:', error);
      showToast('error', error.message || 'Erro ao excluir grupo');
    }
  };

  const renderSortIcon = (column: 'nome' | 'empresa' | 'created_at') => {
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
          Nome do Grupo
          {renderSortIcon('nome')}
        </button>
      ),
      sortable: true,
    },
    {
      key: 'empresa',
      label: (
        <button
          onClick={() => handleSort('empresa')}
          className={`flex items-center font-medium transition-colors ${
            sortBy === 'empresa' ? 'text-[#6B46C1]' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Empresa
          {renderSortIcon('empresa')}
        </button>
      ),
      render: (grupo: GrupoWithEmpresa) => (
        <div>
          {!grupo.empresa ? (
            <span className="text-sm text-gray-500">Sem empresa</span>
          ) : (
            <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
              {grupo.empresa.nome}
            </span>
          )}
        </div>
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
      render: (grupo: Grupo) => {
        const date = new Date(grupo.created_at);
        return <span className="text-sm text-gray-600">{date.toLocaleDateString('pt-BR')}</span>;
      },
    },
  ];

  if (loading) {
    return (
      <>
        <Header title="Grupos" />
        <div className="p-6 flex items-center justify-center">
          <p className="text-gray-500">Carregando...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header
        title="Grupos"
        action={
          <Button icon={Plus} onClick={() => setIsCreateModalOpen(true)}>
            Adicionar Grupo
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
                placeholder="Buscar por nome do grupo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6B46C1]"
              />
            </div>

            <select
              value={empresaFilter}
              onChange={(e) => setEmpresaFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6B46C1] bg-white"
            >
              <option value="todos">Todas as Empresas</option>
              <option value="sem-empresa">Sem Empresa</option>
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
        </div>

        <div className="text-sm text-gray-600 mb-3">
          Mostrando {filteredGrupos.length} de {grupos.length} grupos
        </div>

        <Table
          data={filteredGrupos}
          columns={columns}
          onEdit={handleEdit}
          onDelete={handleDelete}
          selectable
          selectedItems={selectedItems}
          onSelectionChange={setSelectedItems}
          emptyMessage="Nenhum grupo cadastrado."
          totalItems={filteredGrupos.length}
        />
      </div>

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Adicionar Grupo"
      >
        <GrupoForm
          onSubmit={handleCreate}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setGrupoToEdit(null);
        }}
        title="Editar Grupo"
      >
        {grupoToEdit && (
          <GrupoForm
            grupo={grupoToEdit}
            onSubmit={handleUpdate}
            onCancel={() => {
              setIsEditModalOpen(false);
              setGrupoToEdit(null);
            }}
          />
        )}
      </Modal>
    </>
  );
};
