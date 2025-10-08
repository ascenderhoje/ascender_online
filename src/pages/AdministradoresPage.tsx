import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { Table } from '../components/Table';
import { useToast } from '../components/Toast';
import { supabase } from '../lib/supabase';

interface Administrador {
  id: string;
  nome: string;
  email: string;
  avatar_url: string | null;
  ativo: boolean;
  e_administrador: boolean;
  e_psicologa: boolean;
}

export const AdministradoresPage = () => {
  const { showToast } = useToast();
  const [administradores, setAdministradores] = useState<Administrador[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadAdministradores();
  }, []);

  const loadAdministradores = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('administradores')
        .select('*')
        .order('nome');

      if (error) throw error;
      setAdministradores(data || []);
    } catch (error: any) {
      showToast('error', error.message || 'Erro ao carregar administradores');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este administrador?')) return;

    try {
      const { error } = await supabase
        .from('administradores')
        .delete()
        .eq('id', id);

      if (error) throw error;
      showToast('success', 'Administrador excluído com sucesso');
      loadAdministradores();
    } catch (error: any) {
      showToast('error', error.message || 'Erro ao excluir administrador');
    }
  };

  const filteredAdministradores = administradores.filter(
    (admin) =>
      admin.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (admin: Administrador) => {
    window.location.href = `/administradores/${admin.id}/edit`;
  };

  const columns = [
    {
      key: 'nome',
      label: 'Nome',
      sortable: true,
    },
    {
      key: 'email',
      label: 'E-mail',
      sortable: true,
    },
    {
      key: 'avatar_url',
      label: 'Avatar',
      render: (admin: Administrador) => (
        <div className="flex items-center justify-center">
          {admin.avatar_url ? (
            <img
              src={admin.avatar_url}
              alt={admin.nome}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <span className="text-gray-400 text-sm">Null</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <Header
        title="Administradores do Sistema"
        action={
          <Button
            icon={Plus}
            onClick={() => (window.location.href = '/administradores/new')}
          >
            Adicionar Administrador do Sistema
          </Button>
        }
      />

      <div className="p-6">
        <div className="mb-6">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar"
            className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {loading ? (
          <div className="bg-white p-12 text-center">
            <p className="text-gray-500">Carregando...</p>
          </div>
        ) : (
          <Table
            columns={columns}
            data={filteredAdministradores}
            onEdit={handleEdit}
            onDelete={handleDelete}
            emptyMessage="Nenhum administrador cadastrado"
          />
        )}

        {!loading && (
          <div className="mt-4 text-sm text-gray-600">
            {filteredAdministradores.length} resultado{filteredAdministradores.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </>
  );
};
