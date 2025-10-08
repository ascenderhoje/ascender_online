import { useState, useEffect, FormEvent, useRef } from 'react';
import { Button } from './Button';
import { useToast } from './Toast';
import { supabase } from '../lib/supabase';

interface PessoaFormData {
  nome: string;
  email: string;
  senha?: string;
  idioma: string;
  genero: string;
  empresa_id: string;
  funcao: string;
  avatar_url: string;
  tipo_acesso: 'gestor' | 'colaborador';
  grupos_pertence: string[];
  grupos_tem_acesso: string[];
}

interface PessoaFormProps {
  pessoa?: {
    id: string;
    nome: string;
    email: string;
    idioma: string;
    genero: string | null;
    empresa_id: string | null;
    funcao: string | null;
    avatar_url: string | null;
    tipo_acesso: 'gestor' | 'colaborador';
  };
  onSubmit: (data: PessoaFormData) => Promise<void>;
  onCancel: () => void;
}

interface Empresa {
  id: string;
  nome: string;
}

interface Grupo {
  id: string;
  nome: string;
}

export const PessoaForm = ({ pessoa, onSubmit, onCancel }: PessoaFormProps) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [uploading, setUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string>(pessoa?.avatar_url || '');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<PessoaFormData>({
    nome: pessoa?.nome || '',
    email: pessoa?.email || '',
    senha: '',
    idioma: pessoa?.idioma || 'pt-BR',
    genero: pessoa?.genero || '',
    empresa_id: pessoa?.empresa_id || '',
    funcao: pessoa?.funcao || '',
    avatar_url: pessoa?.avatar_url || '',
    tipo_acesso: pessoa?.tipo_acesso || 'colaborador',
    grupos_pertence: [],
    grupos_tem_acesso: [],
  });

  useEffect(() => {
    loadEmpresas();
    loadGrupos();
    if (pessoa?.id) {
      loadPessoaGrupos(pessoa.id);
    }
  }, [pessoa]);

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

  const loadGrupos = async () => {
    try {
      const { data, error } = await supabase
        .from('grupos')
        .select('id, nome')
        .order('nome');

      if (error) throw error;
      setGrupos(data || []);
    } catch (error) {
      console.error('Error loading grupos:', error);
    }
  };

  const loadPessoaGrupos = async (pessoaId: string) => {
    try {
      const { data: gruposPertence, error: errorPertence } = await supabase
        .from('pessoas_grupos')
        .select('grupo_id')
        .eq('pessoa_id', pessoaId);

      if (errorPertence) throw errorPertence;

      const { data: gruposTemAcesso, error: errorTemAcesso } = await supabase
        .from('grupos_gestores')
        .select('grupo_id')
        .eq('pessoa_id', pessoaId);

      if (errorTemAcesso) throw errorTemAcesso;

      setFormData(prev => ({
        ...prev,
        grupos_pertence: gruposPertence?.map(g => g.grupo_id) || [],
        grupos_tem_acesso: gruposTemAcesso?.map(g => g.grupo_id) || [],
      }));
    } catch (error) {
      console.error('Error loading pessoa grupos:', error);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('error', 'Por favor, selecione uma imagem');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('error', 'A imagem deve ter no máximo 5MB');
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setFormData({ ...formData, avatar_url: publicUrl });
      setAvatarPreview(publicUrl);
      showToast('success', 'Imagem enviada com sucesso');
    } catch (error: any) {
      showToast('error', error.message || 'Erro ao fazer upload da imagem');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!formData.nome.trim()) {
      showToast('error', 'Nome é obrigatório');
      return;
    }

    if (!formData.email.trim()) {
      showToast('error', 'Email é obrigatório');
      return;
    }

    if (!pessoa && !formData.senha) {
      showToast('error', 'Senha é obrigatória para novos usuários');
      return;
    }

    if (formData.senha && formData.senha.length < 6) {
      showToast('error', 'Senha deve ter no mínimo 6 caracteres');
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
          Nome <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.nome}
          onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Nome completo"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="email@exemplo.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Senha {!pessoa && <span className="text-red-500">*</span>}
          </label>
          <input
            type="password"
            value={formData.senha}
            onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder={pessoa ? "Deixe em branco para manter" : "Mínimo 6 caracteres"}
            required={!pessoa}
            minLength={6}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Idioma
          </label>
          <select
            value={formData.idioma}
            onChange={(e) => setFormData({ ...formData, idioma: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="pt-BR">Português (Brasil)</option>
            <option value="en-US">English (US)</option>
            <option value="es-ES">Español</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Gênero
          </label>
          <select
            value={formData.genero}
            onChange={(e) => setFormData({ ...formData, genero: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Selecione</option>
            <option value="Masculino">Masculino</option>
            <option value="Feminino">Feminino</option>
            <option value="Outro">Outro</option>
            <option value="Prefiro não informar">Prefiro não informar</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Empresa
          </label>
          <select
            value={formData.empresa_id}
            onChange={(e) => setFormData({ ...formData, empresa_id: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Selecione uma empresa</option>
            {empresas.map((empresa) => (
              <option key={empresa.id} value={empresa.id}>
                {empresa.nome}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Função
          </label>
          <input
            type="text"
            value={formData.funcao}
            onChange={(e) => setFormData({ ...formData, funcao: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Cargo/Função"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tipo de Acesso <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.tipo_acesso}
          onChange={(e) => setFormData({ ...formData, tipo_acesso: e.target.value as any })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="colaborador">Colaborador</option>
          <option value="gestor">Gestor da Empresa</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Avatar
        </label>
        <div className="flex items-center gap-4">
          {avatarPreview && (
            <img
              src={avatarPreview}
              alt="Preview"
              className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
            />
          )}
          <div className="flex-1">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              type="button"
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? 'Enviando...' : 'Escolher imagem'}
            </Button>
            <p className="text-xs text-gray-500 mt-2">
              JPG, PNG ou GIF. Máximo 5MB.
            </p>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Permissões</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pertence a:
            </label>
            <div className="border border-gray-300 rounded-md p-3 max-h-48 overflow-y-auto">
              {grupos.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-2">Nenhum grupo cadastrado</p>
              ) : (
                grupos.map((grupo) => (
                  <label key={grupo.id} className="flex items-center gap-2 py-1 hover:bg-gray-50 px-2 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.grupos_pertence.includes(grupo.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            grupos_pertence: [...formData.grupos_pertence, grupo.id],
                          });
                        } else {
                          setFormData({
                            ...formData,
                            grupos_pertence: formData.grupos_pertence.filter(id => id !== grupo.id),
                          });
                        }
                      }}
                      className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700">{grupo.nome}</span>
                  </label>
                ))
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Grupos dos quais a pessoa é colaboradora
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tem acesso a:
            </label>
            <div className="border border-gray-300 rounded-md p-3 max-h-48 overflow-y-auto">
              {grupos.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-2">Nenhum grupo cadastrado</p>
              ) : (
                grupos.map((grupo) => (
                  <label key={grupo.id} className="flex items-center gap-2 py-1 hover:bg-gray-50 px-2 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.grupos_tem_acesso.includes(grupo.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            grupos_tem_acesso: [...formData.grupos_tem_acesso, grupo.id],
                          });
                        } else {
                          setFormData({
                            ...formData,
                            grupos_tem_acesso: formData.grupos_tem_acesso.filter(id => id !== grupo.id),
                          });
                        }
                      }}
                      className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700">{grupo.nome}</span>
                  </label>
                ))
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Grupos que a pessoa gerencia (pode ver todos os colaboradores)
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Salvando...' : pessoa ? 'Atualizar' : 'Criar'}
        </Button>
      </div>
    </form>
  );
};
