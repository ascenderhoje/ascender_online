import { useState, FormEvent, useRef } from 'react';
import { Button } from './Button';
import { useToast } from './Toast';
import { supabase } from '../lib/supabase';

interface EmpresaFormData {
  nome: string;
  cidade: string;
  regua: number;
  valido_ate: string;
  avatar_url: string;
  vitalicio: boolean;
}

interface EmpresaFormProps {
  empresa?: {
    id: string;
    nome: string;
    cidade: string | null;
    regua: number;
    valido_ate: string | null;
    avatar_url: string | null;
  };
  onSubmit: (data: EmpresaFormData) => Promise<void>;
  onCancel: () => void;
}

export const EmpresaForm = ({ empresa, onSubmit, onCancel }: EmpresaFormProps) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string>(empresa?.avatar_url || '');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<EmpresaFormData>({
    nome: empresa?.nome || '',
    cidade: empresa?.cidade || '',
    regua: empresa?.regua || 0,
    valido_ate: empresa?.valido_ate || '',
    avatar_url: empresa?.avatar_url || '',
    vitalicio: !empresa?.valido_ate,
  });

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

    setLoading(true);
    try {
      const submitData = {
        ...formData,
        valido_ate: formData.vitalicio ? '' : formData.valido_ate,
      };
      await onSubmit(submitData);
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
          placeholder="Nome da empresa"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Cidade
        </label>
        <input
          type="text"
          value={formData.cidade}
          onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Cidade"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Régua
        </label>
        <input
          type="number"
          value={formData.regua}
          onChange={(e) => setFormData({ ...formData, regua: parseInt(e.target.value) || 0 })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          min="0"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Válido até
        </label>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.vitalicio}
              onChange={(e) => setFormData({
                ...formData,
                vitalicio: e.target.checked,
                valido_ate: e.target.checked ? '' : formData.valido_ate
              })}
              className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm text-gray-700">Vitalício (sem data de expiração)</span>
          </label>
          {!formData.vitalicio && (
            <input
              type="date"
              value={formData.valido_ate}
              onChange={(e) => setFormData({ ...formData, valido_ate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          )}
        </div>
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

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Salvando...' : empresa ? 'Atualizar' : 'Criar'}
        </Button>
      </div>
    </form>
  );
};
