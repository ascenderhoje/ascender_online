import { useState, useEffect, FormEvent } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { useToast } from '../components/Toast';
import { supabase } from '../lib/supabase';

interface AdministradorFormPageProps {
  administradorId?: string;
}

interface Empresa {
  id: string;
  nome: string;
}

export const AdministradorFormPage = ({ administradorId }: AdministradorFormPageProps) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [ativo, setAtivo] = useState(true);
  const [eAdministrador, setEAdministrador] = useState(false);
  const [ePsicologa, setEPsicologa] = useState(false);
  const [empresaPadraoId, setEmpresaPadraoId] = useState<string>('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [empresas, setEmpresas] = useState<Empresa[]>([]);

  const isEditMode = !!administradorId;

  useEffect(() => {
    loadEmpresas();
    if (administradorId) {
      loadAdministrador();
    }
  }, [administradorId]);

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

  const loadAdministrador = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('administradores')
        .select('*')
        .eq('id', administradorId)
        .single();

      if (error) throw error;

      setNome(data.nome);
      setEmail(data.email);
      setTelefone(data.telefone || '');
      setAtivo(data.ativo);
      setEAdministrador(data.e_administrador);
      setEPsicologa(data.e_psicologa);
      setEmpresaPadraoId(data.empresa_padrao_id || '');
      setAvatarUrl(data.avatar_url || '');
    } catch (error: any) {
      showToast('error', error.message || 'Erro ao carregar administrador');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!nome.trim() || !email.trim()) {
      showToast('error', 'Nome e e-mail são obrigatórios');
      return;
    }

    if (!eAdministrador && !ePsicologa) {
      showToast('error', 'Selecione ao menos uma função (Administrador ou Psicóloga)');
      return;
    }

    try {
      setLoading(true);

      const data = {
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        telefone: telefone.trim() || null,
        ativo,
        e_administrador: eAdministrador,
        e_psicologa: ePsicologa,
        empresa_padrao_id: empresaPadraoId || null,
        avatar_url: avatarUrl.trim() || null,
      };

      if (isEditMode) {
        const { error } = await supabase
          .from('administradores')
          .update(data)
          .eq('id', administradorId);

        if (error) throw error;
        showToast('success', 'Administrador atualizado com sucesso');
      } else {
        const { error } = await supabase
          .from('administradores')
          .insert(data);

        if (error) throw error;
        showToast('success', 'Administrador criado com sucesso');
      }

      window.location.href = '/administradores';
    } catch (error: any) {
      showToast('error', error.message || 'Erro ao salvar administrador');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header
        title={isEditMode ? 'Editar Administrador' : 'Adicionar Administrador'}
        action={
          <Button
            variant="ghost"
            icon={ArrowLeft}
            onClick={() => (window.location.href = '/administradores')}
          >
            Voltar
          </Button>
        }
      />

      <div className="p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Dados Básicos</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  E-mail <span className="text-red-600">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone
                </label>
                <input
                  type="tel"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Avatar URL
                </label>
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://exemplo.com/avatar.jpg"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Empresa Padrão
                </label>
                <select
                  value={empresaPadraoId}
                  onChange={(e) => setEmpresaPadraoId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Nenhuma</option>
                  {empresas.map((empresa) => (
                    <option key={empresa.id} value={empresa.id}>
                      {empresa.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ativo}
                    onChange={(e) => setAtivo(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
                <span className="text-sm font-medium text-gray-900">Ativo</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Funções</h2>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="eAdministrador"
                  checked={eAdministrador}
                  onChange={(e) => setEAdministrador(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="eAdministrador" className="text-sm font-medium text-gray-900">
                  Administrador
                </label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="ePsicologa"
                  checked={ePsicologa}
                  onChange={(e) => setEPsicologa(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="ePsicologa" className="text-sm font-medium text-gray-900">
                  Psicóloga
                </label>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
};
