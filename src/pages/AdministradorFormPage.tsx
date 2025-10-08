import { useState, useEffect, FormEvent } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { useToast } from '../components/Toast';
import { supabase } from '../lib/supabase';
import { useRouter } from '../utils/router';
import { useAuth } from '../contexts/AuthContext';

interface AdministradorFormPageProps {
  administradorId?: string;
}

interface Empresa {
  id: string;
  nome: string;
}

export const AdministradorFormPage = ({ administradorId }: AdministradorFormPageProps) => {
  const { showToast } = useToast();
  const { navigate } = useRouter();
  const { administrador: currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [ativo, setAtivo] = useState(true);
  const [eAdministrador, setEAdministrador] = useState(false);
  const [ePsicologa, setEPsicologa] = useState(false);
  const [empresaPadraoId, setEmpresaPadraoId] = useState<string>('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [authUserId, setAuthUserId] = useState<string>('');

  const isEditMode = !!administradorId;
  const isAdmin = currentUser?.e_administrador || false;

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
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        showToast('error', 'Administrador não encontrado');
        navigate('/administradores');
        return;
      }

      console.log('Administrador carregado:', data);

      setNome(data.nome);
      setEmail(data.email);
      setTelefone(data.telefone || '');
      setAtivo(data.ativo);
      setEAdministrador(data.e_administrador);
      setEPsicologa(data.e_psicologa);
      setEmpresaPadraoId(data.empresa_padrao_id || '');
      setAvatarUrl(data.avatar_url || '');
      setAuthUserId(data.auth_user_id || '');
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

    if (!isEditMode && !senha) {
      showToast('error', 'Senha é obrigatória para novos administradores');
      return;
    }

    if (!isEditMode && senha !== confirmarSenha) {
      showToast('error', 'As senhas não coincidem');
      return;
    }

    if (!isEditMode && senha.length < 6) {
      showToast('error', 'A senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (isEditMode && senha && senha !== confirmarSenha) {
      showToast('error', 'As senhas não coincidem');
      return;
    }

    if (isEditMode && senha && senha.length < 6) {
      showToast('error', 'A senha deve ter pelo menos 6 caracteres');
      return;
    }

    try {
      setLoading(true);

      let userId = authUserId;

      if (!isEditMode) {
        const { data: session } = await supabase.auth.getSession();
        const token = session?.session?.access_token;

        if (!token) throw new Error('Não autenticado');

        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-users/create`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: email.trim().toLowerCase(),
              password: senha,
              metadata: {
                nome: nome.trim(),
              },
            }),
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Erro ao criar usuário de autenticação');
        }

        userId = result.user.id;
      } else if (senha && isAdmin) {
        const { data: session } = await supabase.auth.getSession();
        const token = session?.session?.access_token;

        if (!token) throw new Error('Não autenticado');

        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-users/update-password`,
          {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: authUserId,
              password: senha,
            }),
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Erro ao atualizar senha');
        }
      }

      const adminData = {
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        telefone: telefone.trim() || null,
        ativo,
        e_administrador: eAdministrador,
        e_psicologa: ePsicologa,
        empresa_padrao_id: empresaPadraoId || null,
        avatar_url: avatarUrl.trim() || null,
        auth_user_id: userId,
      };

      if (isEditMode) {
        const { error } = await supabase
          .from('administradores')
          .update(adminData)
          .eq('id', administradorId);

        if (error) throw error;

        if (senha && isAdmin) {
          showToast('success', 'Administrador e senha atualizados com sucesso');
        } else {
          showToast('success', 'Administrador atualizado com sucesso');
        }
      } else {
        const { error } = await supabase
          .from('administradores')
          .insert(adminData);

        if (error) throw error;
        showToast('success', 'Administrador criado com sucesso');
      }

      navigate('/administradores');
    } catch (error: any) {
      console.error('Error saving administrador:', error);
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
            onClick={() => navigate('/administradores')}
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
                  disabled={isEditMode}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                {isEditMode && (
                  <p className="text-xs text-gray-500 mt-1">
                    O e-mail não pode ser alterado após o cadastro
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Senha {!isEditMode && <span className="text-red-600">*</span>}
                </label>
                <input
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required={!isEditMode}
                  minLength={6}
                  disabled={isEditMode && !isAdmin}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder={isEditMode ? 'Deixe em branco para não alterar' : ''}
                />
                {isEditMode && !isAdmin && (
                  <p className="text-xs text-amber-600 mt-1">
                    Apenas administradores podem alterar senhas de outros usuários
                  </p>
                )}
                {!isEditMode && (
                  <p className="text-xs text-gray-500 mt-1">
                    Mínimo de 6 caracteres
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar Senha {!isEditMode && <span className="text-red-600">*</span>}
                </label>
                <input
                  type="password"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  required={!isEditMode}
                  minLength={6}
                  disabled={isEditMode && !isAdmin}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
