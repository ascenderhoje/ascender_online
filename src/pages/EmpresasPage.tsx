import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Header } from '../components/Header';
import { Table } from '../components/Table';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { EmpresaForm } from '../components/EmpresaForm';
import { useToast } from '../components/Toast';
import { supabase } from '../lib/supabase';

interface Empresa {
  id: string;
  nome: string;
  cidade: string | null;
  regua: number;
  valido_ate: string | null;
  avatar_url: string | null;
}

export const EmpresasPage = () => {
  const { showToast } = useToast();
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [empresaToEdit, setEmpresaToEdit] = useState<Empresa | null>(null);

  const loadEmpresas = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('empresas')
        .select('*')
        .eq('ativo', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEmpresas(data || []);
    } catch (error) {
      console.error('Error loading empresas:', error);
      showToast('error', 'Erro ao carregar empresas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmpresas();
  }, []);

  const handleCreate = async (formData: any) => {
    try {
      const { error } = await supabase.from('empresas').insert([
        {
          nome: formData.nome,
          cidade: formData.cidade || null,
          regua: formData.regua,
          valido_ate: formData.valido_ate || null,
          avatar_url: formData.avatar_url || null,
        },
      ]);

      if (error) throw error;

      showToast('success', 'Empresa criada com sucesso!');
      setIsCreateModalOpen(false);
      loadEmpresas();
    } catch (error: any) {
      console.error('Error creating empresa:', error);
      showToast('error', error.message || 'Erro ao criar empresa');
    }
  };

  const handleEdit = (empresa: Empresa) => {
    setEmpresaToEdit(empresa);
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (formData: any) => {
    if (!empresaToEdit) return;

    try {
      const { error } = await supabase
        .from('empresas')
        .update({
          nome: formData.nome,
          cidade: formData.cidade || null,
          regua: formData.regua,
          valido_ate: formData.valido_ate || null,
          avatar_url: formData.avatar_url || null,
        })
        .eq('id', empresaToEdit.id);

      if (error) throw error;

      showToast('success', 'Empresa atualizada com sucesso!');
      setIsEditModalOpen(false);
      setEmpresaToEdit(null);
      loadEmpresas();
    } catch (error: any) {
      console.error('Error updating empresa:', error);
      showToast('error', error.message || 'Erro ao atualizar empresa');
    }
  };

  const handleDelete = async (empresa: Empresa) => {
    if (!confirm(`Tem certeza que deseja excluir "${empresa.nome}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('empresas')
        .update({ ativo: false })
        .eq('id', empresa.id);

      if (error) throw error;

      showToast('success', 'Empresa excluída com sucesso!');
      loadEmpresas();
    } catch (error: any) {
      console.error('Error deleting empresa:', error);
      showToast('error', error.message || 'Erro ao excluir empresa');
    }
  };

  const columns = [
    { key: 'nome', label: 'Nome', sortable: true },
    { key: 'cidade', label: 'Cidade', sortable: true },
    {
      key: 'regua',
      label: 'Régua',
      render: (empresa: Empresa) => <span>{empresa.regua}</span>,
    },
    {
      key: 'valido_ate',
      label: 'Válido até',
      sortable: true,
      render: (empresa: Empresa) => {
        if (!empresa.valido_ate) return <span className="text-gray-400">Null</span>;
        const date = new Date(empresa.valido_ate);
        return <span>{date.toLocaleDateString('pt-BR')}</span>;
      },
    },
    {
      key: 'avatar_url',
      label: 'Avatar',
      render: (empresa: Empresa) => {
        if (!empresa.avatar_url) {
          return (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                <span className="text-xs">⭕</span>
              </div>
              <span className="text-xs text-red-600">excluir</span>
            </div>
          );
        }
        return (
          <img
            src={empresa.avatar_url}
            alt={empresa.nome}
            className="w-12 h-12 object-contain"
          />
        );
      },
    },
  ];

  if (loading) {
    return (
      <>
        <Header title="Empresas" />
        <div className="p-6 flex items-center justify-center">
          <p className="text-gray-500">Carregando...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header
        title="Empresas"
        action={
          <Button icon={Plus} onClick={() => setIsCreateModalOpen(true)}>
            Adicionar Empresa
          </Button>
        }
      />

      <div className="p-6">
        <Table
          data={empresas}
          columns={columns}
          onEdit={handleEdit}
          onDelete={handleDelete}
          selectable
          selectedItems={selectedItems}
          onSelectionChange={setSelectedItems}
          emptyMessage="Nenhuma empresa cadastrada."
          totalItems={empresas.length}
        />
      </div>

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Adicionar Empresa"
      >
        <EmpresaForm
          onSubmit={handleCreate}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEmpresaToEdit(null);
        }}
        title="Editar Empresa"
      >
        {empresaToEdit && (
          <EmpresaForm
            empresa={empresaToEdit}
            onSubmit={handleUpdate}
            onCancel={() => {
              setIsEditModalOpen(false);
              setEmpresaToEdit(null);
            }}
          />
        )}
      </Modal>
    </>
  );
};
