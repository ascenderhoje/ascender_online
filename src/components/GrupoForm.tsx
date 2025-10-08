import { useState, useEffect, FormEvent } from 'react';
import { Button } from './Button';
import { useToast } from './Toast';
import { supabase } from '../lib/supabase';

interface GrupoFormData {
  nome: string;
  empresa_id: string;
}

interface GrupoFormProps {
  grupo?: {
    id: string;
    nome: string;
    empresa_id: string | null;
  };
  onSubmit: (data: GrupoFormData) => Promise<void>;
  onCancel: () => void;
}

interface Empresa {
  id: string;
  nome: string;
}

export const GrupoForm = ({ grupo, onSubmit, onCancel }: GrupoFormProps) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [formData, setFormData] = useState<GrupoFormData>({
    nome: grupo?.nome || '',
    empresa_id: grupo?.empresa_id || '',
  });

  useEffect(() => {
    loadEmpresas();
  }, []);

  const loadEmpresas = async () => {
    try {
      const { data, error } = await supabase
        .from('empresas')
        .select('id, nome')
        .eq('ativo', true)
        .order('nome');

      if (error) throw error;
      setEmpresas(data || []);
    } catch (error) {
      console.error('Error loading empresas:', error);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!formData.nome.trim()) {
      showToast('error', 'Nome é obrigatório');
      return;
    }

    if (!formData.empresa_id) {
      showToast('error', 'Empresa é obrigatória');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nome do Grupo <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.nome}
          onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Nome do grupo"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Empresa <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.empresa_id}
          onChange={(e) => setFormData({ ...formData, empresa_id: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        >
          <option value="">Selecione uma empresa</option>
          {empresas.map((empresa) => (
            <option key={empresa.id} value={empresa.id}>
              {empresa.nome}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-1">
          Cada grupo pertence a uma única empresa
        </p>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Salvando...' : grupo ? 'Atualizar' : 'Criar'}
        </Button>
      </div>
    </form>
  );
};
