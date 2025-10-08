import { useState, useEffect } from 'react';
import { Plus, Lock } from 'lucide-react';
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

  const filteredCompetencias = competencias.filter((c) =>
    c.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      key: 'nome',
      label: 'Nome',
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
      label: 'Fixo',
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
