import { useState, useEffect, FormEvent } from 'react';
import { Button } from './Button';
import { useToast } from './Toast';
import { supabase } from '../lib/supabase';
import { X } from 'lucide-react';

interface GrupoFormData {
  nome: string;
  empresa_id: string;
  membros: string[];
  gestores: string[];
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

interface Pessoa {
  id: string;
  nome: string;
  email: string;
}

export const GrupoForm = ({ grupo, onSubmit, onCancel }: GrupoFormProps) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [formData, setFormData] = useState<GrupoFormData>({
    nome: grupo?.nome || '',
    empresa_id: grupo?.empresa_id || '',
    membros: [],
    gestores: [],
  });

  useEffect(() => {
    loadEmpresas();
    if (grupo?.id) {
      loadGrupoRelations();
    }
  }, []);

  useEffect(() => {
    if (formData.empresa_id) {
      loadPessoas(formData.empresa_id);
    } else {
      setPessoas([]);
      setFormData(prev => ({ ...prev, membros: [], gestores: [] }));
    }
  }, [formData.empresa_id]);

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

  const loadPessoas = async (empresaId: string) => {
    try {
      const { data, error } = await supabase
        .from('pessoas')
        .select('id, nome, email')
        .eq('empresa_id', empresaId)
        .order('nome');

      if (error) throw error;
      setPessoas(data || []);
    } catch (error) {
      console.error('Error loading pessoas:', error);
    }
  };

  const loadGrupoRelations = async () => {
    if (!grupo?.id) return;

    try {
      const [membrosRes, gestoresRes] = await Promise.all([
        supabase
          .from('pessoas_grupos')
          .select('pessoa_id')
          .eq('grupo_id', grupo.id),
        supabase
          .from('grupos_gestores')
          .select('pessoa_id')
          .eq('grupo_id', grupo.id),
      ]);

      if (membrosRes.error) throw membrosRes.error;
      if (gestoresRes.error) throw gestoresRes.error;

      setFormData(prev => ({
        ...prev,
        membros: membrosRes.data?.map(m => m.pessoa_id) || [],
        gestores: gestoresRes.data?.map(g => g.pessoa_id) || [],
      }));
    } catch (error) {
      console.error('Error loading grupo relations:', error);
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

  const toggleMembro = (pessoaId: string) => {
    setFormData(prev => ({
      ...prev,
      membros: prev.membros.includes(pessoaId)
        ? prev.membros.filter(id => id !== pessoaId)
        : [...prev.membros, pessoaId],
    }));
  };

  const toggleGestor = (pessoaId: string) => {
    setFormData(prev => ({
      ...prev,
      gestores: prev.gestores.includes(pessoaId)
        ? prev.gestores.filter(id => id !== pessoaId)
        : [...prev.gestores, pessoaId],
    }));
  };

  const removeMembro = (pessoaId: string) => {
    setFormData(prev => ({
      ...prev,
      membros: prev.membros.filter(id => id !== pessoaId),
    }));
  };

  const removeGestor = (pessoaId: string) => {
    setFormData(prev => ({
      ...prev,
      gestores: prev.gestores.filter(id => id !== pessoaId),
    }));
  };

  const getSelectedPessoas = (ids: string[]) => {
    return pessoas.filter(p => ids.includes(p.id));
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
          disabled={!!grupo}
        >
          <option value="">Selecione uma empresa</option>
          {empresas.map((empresa) => (
            <option key={empresa.id} value={empresa.id}>
              {empresa.nome}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-1">
          {grupo ? 'Não é possível alterar a empresa após a criação' : 'Cada grupo pertence a uma única empresa'}
        </p>
      </div>

      {formData.empresa_id && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Membros do Grupo
            </label>
            <p className="text-xs text-gray-500 mb-3">
              Pessoas que pertencem a este grupo
            </p>

            {formData.membros.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {getSelectedPessoas(formData.membros).map((pessoa) => (
                  <span
                    key={pessoa.id}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                  >
                    {pessoa.nome}
                    <button
                      type="button"
                      onClick={() => removeMembro(pessoa.id)}
                      className="hover:bg-blue-200 rounded-full p-0.5"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="border border-gray-300 rounded-md max-h-48 overflow-y-auto">
              {pessoas.length === 0 ? (
                <p className="p-4 text-sm text-gray-500 text-center">
                  Nenhuma pessoa cadastrada nesta empresa
                </p>
              ) : (
                pessoas.map((pessoa) => (
                  <label
                    key={pessoa.id}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
                  >
                    <input
                      type="checkbox"
                      checked={formData.membros.includes(pessoa.id)}
                      onChange={() => toggleMembro(pessoa.id)}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{pessoa.nome}</p>
                      <p className="text-xs text-gray-500">{pessoa.email}</p>
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gestores do Grupo
            </label>
            <p className="text-xs text-gray-500 mb-3">
              Pessoas que têm acesso para gerenciar este grupo
            </p>

            {formData.gestores.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {getSelectedPessoas(formData.gestores).map((pessoa) => (
                  <span
                    key={pessoa.id}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                  >
                    {pessoa.nome}
                    <button
                      type="button"
                      onClick={() => removeGestor(pessoa.id)}
                      className="hover:bg-green-200 rounded-full p-0.5"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="border border-gray-300 rounded-md max-h-48 overflow-y-auto">
              {pessoas.length === 0 ? (
                <p className="p-4 text-sm text-gray-500 text-center">
                  Nenhuma pessoa cadastrada nesta empresa
                </p>
              ) : (
                pessoas.map((pessoa) => (
                  <label
                    key={pessoa.id}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
                  >
                    <input
                      type="checkbox"
                      checked={formData.gestores.includes(pessoa.id)}
                      onChange={() => toggleGestor(pessoa.id)}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{pessoa.nome}</p>
                      <p className="text-xs text-gray-500">{pessoa.email}</p>
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>
        </>
      )}

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
