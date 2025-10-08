import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
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

  const filteredModelos = modelos.filter((m) =>
    m.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { key: 'nome', label: 'Nome', sortable: true },
    {
      key: 'status',
      label: 'Status',
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
      label: 'Criado em',
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
        <div className="mb-4">
          <input
            type="text"
            placeholder="Buscar por nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
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
