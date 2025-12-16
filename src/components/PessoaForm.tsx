import { useState, useEffect, FormEvent, useRef } from 'react';
import { Button } from './Button';
import { useToast } from './Toast';
import { supabase } from '../lib/supabase';
import { X, Search } from 'lucide-react';

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
  const [searchPertence, setSearchPertence] = useState('');
  const [searchAcesso, setSearchAcesso] = useState('');
  const [showPertenceDropdown, setShowPertenceDropdown] = useState(false);
  const [showAcessoDropdown, setShowAcessoDropdown] = useState(false);
  const pertenceDropdownRef = useRef<HTMLDivElement>(null);
  const acessoDropdownRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pertenceDropdownRef.current && !pertenceDropdownRef.current.contains(event.target as Node)) {
        setShowPertenceDropdown(false);
      }
      if (acessoDropdownRef.current && !acessoDropdownRef.current.contains(event.target as Node)) {
        setShowAcessoDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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

  const addGrupoPertence = (grupoId: string) => {
    if (!formData.grupos_pertence.includes(grupoId)) {
      setFormData({
        ...formData,
        grupos_pertence: [...formData.grupos_pertence, grupoId],
      });
    }
    setSearchPertence('');
    setShowPertenceDropdown(false);
  };

  const addGrupoAcesso = (grupoId: string) => {
    if (!formData.grupos_tem_acesso.includes(grupoId)) {
      setFormData({
        ...formData,
        grupos_tem_acesso: [...formData.grupos_tem_acesso, grupoId],
      });
    }
    setSearchAcesso('');
    setShowAcessoDropdown(false);
  };

  const removeGrupoPertence = (grupoId: string) => {
    setFormData({
      ...formData,
      grupos_pertence: formData.grupos_pertence.filter(id => id !== grupoId),
    });
  };

  const removeGrupoAcesso = (grupoId: string) => {
    setFormData({
      ...formData,
      grupos_tem_acesso: formData.grupos_tem_acesso.filter(id => id !== grupoId),
    });
  };

  const getSelectedGrupos = (ids: string[]) => {
    return grupos.filter(g => ids.includes(g.id));
  };

  const getFilteredGrupos = (search: string, excludeIds: string[]) => {
    return grupos.filter(g => {
      if (excludeIds.includes(g.id)) return false;
      if (!search.trim()) return true;
      const searchLower = search.toLowerCase();
      return g.nome.toLowerCase().includes(searchLower);
    });
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
        {formData.tipo_acesso === 'gestor' && !pessoa && (
          <p className="mt-2 text-xs text-blue-600 bg-blue-50 p-2 rounded border border-blue-200">
            💡 Um grupo será criado automaticamente com o nome da empresa e nome completo do gestor.
          </p>
        )}
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
            <p className="text-xs text-gray-500 mb-3">
              Grupos dos quais a pessoa é colaboradora
            </p>

            {formData.grupos_pertence.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {getSelectedGrupos(formData.grupos_pertence).map((grupo) => (
                  <span
                    key={grupo.id}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                  >
                    {grupo.nome}
                    <button
                      type="button"
                      onClick={() => removeGrupoPertence(grupo.id)}
                      className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="relative" ref={pertenceDropdownRef}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  value={searchPertence}
                  onChange={(e) => {
                    setSearchPertence(e.target.value);
                    setShowPertenceDropdown(true);
                  }}
                  onFocus={() => setShowPertenceDropdown(true)}
                  placeholder="Buscar grupo para adicionar..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {showPertenceDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-[240px] overflow-y-auto">
                  {grupos.length === 0 ? (
                    <p className="p-4 text-sm text-gray-500 text-center">
                      Nenhum grupo cadastrado
                    </p>
                  ) : (
                    getFilteredGrupos(searchPertence, formData.grupos_pertence).length === 0 ? (
                      <p className="p-4 text-sm text-gray-500 text-center">
                        {searchPertence ? 'Nenhum grupo encontrado' : 'Todos os grupos já foram adicionados'}
                      </p>
                    ) : (
                      getFilteredGrupos(searchPertence, formData.grupos_pertence).map((grupo) => (
                        <button
                          key={grupo.id}
                          type="button"
                          onClick={() => addGrupoPertence(grupo.id)}
                          className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 text-left border-b border-gray-100 last:border-0 transition-colors"
                        >
                          <span className="text-sm text-gray-700">{grupo.nome}</span>
                        </button>
                      ))
                    )
                  )}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tem acesso a:
            </label>
            <p className="text-xs text-gray-500 mb-3">
              Grupos que a pessoa gerencia (pode ver todos os colaboradores)
            </p>

            {formData.grupos_tem_acesso.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {getSelectedGrupos(formData.grupos_tem_acesso).map((grupo) => (
                  <span
                    key={grupo.id}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                  >
                    {grupo.nome}
                    <button
                      type="button"
                      onClick={() => removeGrupoAcesso(grupo.id)}
                      className="hover:bg-green-200 rounded-full p-0.5 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="relative" ref={acessoDropdownRef}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  value={searchAcesso}
                  onChange={(e) => {
                    setSearchAcesso(e.target.value);
                    setShowAcessoDropdown(true);
                  }}
                  onFocus={() => setShowAcessoDropdown(true)}
                  placeholder="Buscar grupo para adicionar..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {showAcessoDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-[240px] overflow-y-auto">
                  {grupos.length === 0 ? (
                    <p className="p-4 text-sm text-gray-500 text-center">
                      Nenhum grupo cadastrado
                    </p>
                  ) : (
                    getFilteredGrupos(searchAcesso, formData.grupos_tem_acesso).length === 0 ? (
                      <p className="p-4 text-sm text-gray-500 text-center">
                        {searchAcesso ? 'Nenhum grupo encontrado' : 'Todos os grupos já foram adicionados'}
                      </p>
                    ) : (
                      getFilteredGrupos(searchAcesso, formData.grupos_tem_acesso).map((grupo) => (
                        <button
                          key={grupo.id}
                          type="button"
                          onClick={() => addGrupoAcesso(grupo.id)}
                          className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 text-left border-b border-gray-100 last:border-0 transition-colors"
                        >
                          <span className="text-sm text-gray-700">{grupo.nome}</span>
                        </button>
                      ))
                    )
                  )}
                </div>
              )}
            </div>
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
