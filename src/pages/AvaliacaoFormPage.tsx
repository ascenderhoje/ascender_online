import { useState, useEffect, FormEvent } from 'react';
import { ArrowLeft, Mail, Copy } from 'lucide-react';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { useToast } from '../components/Toast';
import { supabase } from '../lib/supabase';

interface AvaliacaoFormPageProps {
  avaliacaoId?: string;
}

interface Empresa {
  id: string;
  nome: string;
}

interface Pessoa {
  id: string;
  nome: string;
  email: string;
}

interface Modelo {
  id: string;
  nome: string;
}

interface Psicologa {
  id: string;
  nome: string;
}

export const AvaliacaoFormPage = ({ avaliacaoId }: AvaliacaoFormPageProps) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [dataAvaliacao, setDataAvaliacao] = useState('');
  const [empresaId, setEmpresaId] = useState('');
  const [colaboradorId, setColaboradorId] = useState('');
  const [modeloId, setModeloId] = useState('');
  const [psicologaId, setPsicologaId] = useState('');

  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [colaboradores, setColaboradores] = useState<Pessoa[]>([]);
  const [modelos, setModelos] = useState<Modelo[]>([]);
  const [psicologas, setPsicologas] = useState<Psicologa[]>([]);

  const isEditMode = !!avaliacaoId;

  useEffect(() => {
    loadEmpresas();
    loadModelos();
    loadPsicologas();
    if (avaliacaoId) {
      loadAvaliacao();
    }
  }, [avaliacaoId]);

  useEffect(() => {
    if (empresaId) {
      loadColaboradores(empresaId);
    } else {
      setColaboradores([]);
      setColaboradorId('');
    }
  }, [empresaId]);

  const loadEmpresas = async () => {
    try {
      const { data, error } = await supabase
        .from('empresas')
        .select('id, nome')
        .eq('ativo', true)
        .order('nome');

      if (error) throw error;
      setEmpresas(data || []);
    } catch (error: any) {
      console.error('Error loading empresas:', error);
    }
  };

  const loadColaboradores = async (empresaIdParam: string) => {
    try {
      const { data, error } = await supabase
        .from('pessoas')
        .select('id, nome, email')
        .eq('empresa_id', empresaIdParam)
        .order('nome');

      if (error) throw error;
      setColaboradores(data || []);
    } catch (error: any) {
      console.error('Error loading colaboradores:', error);
    }
  };

  const loadModelos = async () => {
    try {
      const { data, error } = await supabase
        .from('modelos_avaliacao')
        .select('id, nome')
        .order('nome');

      if (error) throw error;
      setModelos(data || []);
    } catch (error: any) {
      console.error('Error loading modelos:', error);
    }
  };

  const loadPsicologas = async () => {
    try {
      const { data, error } = await supabase
        .from('administradores')
        .select('id, nome')
        .eq('e_psicologa', true)
        .eq('ativo', true)
        .order('nome');

      if (error) throw error;
      setPsicologas(data || []);
    } catch (error: any) {
      console.error('Error loading psicologas:', error);
    }
  };

  const loadAvaliacao = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('avaliacoes')
        .select('*')
        .eq('id', avaliacaoId)
        .single();

      if (error) throw error;

      setDataAvaliacao(data.data_avaliacao);
      setEmpresaId(data.empresa_id);
      setColaboradorId(data.colaborador_id);
      setModeloId(data.modelo_id || '');
      setPsicologaId(data.psicologa_responsavel_id || '');

      await loadColaboradores(data.empresa_id);
    } catch (error: any) {
      showToast('error', error.message || 'Erro ao carregar avaliação');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!dataAvaliacao || !empresaId || !colaboradorId) {
      showToast('error', 'Data, Empresa e Colaborador são obrigatórios');
      return;
    }

    try {
      setLoading(true);

      const colaboradorSelecionado = colaboradores.find((c) => c.id === colaboradorId);

      const data = {
        data_avaliacao: dataAvaliacao,
        empresa_id: empresaId,
        colaborador_id: colaboradorId,
        modelo_id: modeloId || null,
        psicologa_responsavel_id: psicologaId || null,
        colaborador_email: colaboradorSelecionado?.email || '',
        status: 'rascunho',
      };

      if (isEditMode) {
        const { error } = await supabase.from('avaliacoes').update(data).eq('id', avaliacaoId);

        if (error) throw error;
        showToast('success', 'Avaliação atualizada com sucesso');
      } else {
        const { error } = await supabase.from('avaliacoes').insert(data);

        if (error) throw error;
        showToast('success', 'Avaliação criada com sucesso');
      }

      window.location.href = '/avaliacoes';
    } catch (error: any) {
      showToast('error', error.message || 'Erro ao salvar avaliação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header
        title={isEditMode ? 'Editar Avaliação' : 'Adicionar Avaliação'}
        action={
          <div className="flex gap-2">
            <Button variant="secondary" icon={Mail}>
              E-Mail Devolutiva
            </Button>
            <Button variant="secondary" icon={Copy}>
              Copiar
            </Button>
            <Button variant="ghost" icon={ArrowLeft} onClick={() => (window.location.href = '/avaliacoes')}>
              Voltar
            </Button>
          </div>
        }
      />

      <div className="p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Dados da Avaliação</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data da Avaliação <span className="text-red-600">*</span>
                </label>
                <input
                  type="date"
                  value={dataAvaliacao}
                  onChange={(e) => setDataAvaliacao(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Psicóloga responsável
                </label>
                <select
                  value={psicologaId}
                  onChange={(e) => setPsicologaId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Nenhum</option>
                  {psicologas.map((psi) => (
                    <option key={psi.id} value={psi.id}>
                      {psi.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Empresa <span className="text-red-600">*</span>
                </label>
                <select
                  value={empresaId}
                  onChange={(e) => setEmpresaId(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Cocriar</option>
                  {empresas.map((empresa) => (
                    <option key={empresa.id} value={empresa.id}>
                      {empresa.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Colaborador <span className="text-red-600">*</span>
                </label>
                <select
                  value={colaboradorId}
                  onChange={(e) => setColaboradorId(e.target.value)}
                  required
                  disabled={!empresaId}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">Selecione...</option>
                  {colaboradores.map((colab) => (
                    <option key={colab.id} value={colab.id}>
                      {colab.nome}
                    </option>
                  ))}
                </select>
                {!empresaId && (
                  <p className="mt-1 text-xs text-gray-500">
                    Selecione uma empresa primeiro
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Modelo de Avaliação
                </label>
                <select
                  value={modeloId}
                  onChange={(e) => setModeloId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Nenhum</option>
                  {modelos.map((modelo) => (
                    <option key={modelo.id} value={modelo.id}>
                      {modelo.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>

        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Comparativo</h2>
          <div className="flex gap-2 mb-4">
            <button className="px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded hover:bg-orange-600">
              Limpar
            </button>
            <button className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded hover:bg-indigo-700">
              Atualizar
            </button>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <div className="text-center text-gray-500">
              Não existe avaliações adicionadas para comparar. Selecione as avaliações e click no
              botão <strong>[Adicionar Comparativo]</strong>.
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
