import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
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

export const GruposPage = () => {
  const { showToast } = useToast();
  const [grupos, setGrupos] = useState<GrupoWithEmpresa[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [grupoToEdit, setGrupoToEdit] = useState<GrupoWithEmpresa | null>(null);

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

  useEffect(() => {
    loadGrupos();
  }, []);

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

  const columns = [
    { key: 'nome', label: 'Nome do Grupo', sortable: true },
    {
      key: 'empresa',
      label: 'Empresa',
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
      label: 'Criado em',
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
        <Table
          data={grupos}
          columns={columns}
          onEdit={handleEdit}
          onDelete={handleDelete}
          selectable
          selectedItems={selectedItems}
          onSelectionChange={setSelectedItems}
          emptyMessage="Nenhum grupo cadastrado."
          totalItems={grupos.length}
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
