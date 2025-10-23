import { useState, useEffect } from 'react';
import { useRouter } from '../utils/router';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { useToast } from '../components/Toast';
import { supabase } from '../lib/supabase';
import { PDITag, PDIMediaType, PDIAudience } from '../types';
import { ArrowLeft, Upload } from 'lucide-react';

interface PDIContentFormPageProps {
  contentId?: string;
}

export const PDIContentFormPage = ({ contentId }: PDIContentFormPageProps) => {
  const { showToast } = useToast();
  const { navigate } = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [mediaTypes, setMediaTypes] = useState<PDIMediaType[]>([]);
  const [tags, setTags] = useState<PDITag[]>([]);
  const [audiences, setAudiences] = useState<PDIAudience[]>([]);
  const [competencies, setCompetencies] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    titulo: '',
    descricao_curta: '',
    descricao_longa: '',
    cover_image_url: '',
    media_type_id: '',
    external_url: '',
    duration_minutes: '',
    investment_cents: '',
    is_active: true,
    selectedTags: [] as string[],
    selectedCompetencies: [] as string[],
    selectedAudiences: [] as string[],
  });

  useEffect(() => {
    loadFormOptions();
    if (contentId) {
      loadContent();
    }
  }, [contentId]);

  const loadFormOptions = async () => {
    try {
      const [mediaTypesRes, tagsRes, audiencesRes, competenciesRes] = await Promise.all([
        supabase.from('pdi_media_types').select('*').eq('ativo', true).order('ordem'),
        supabase.from('pdi_tags').select('*').order('nome'),
        supabase.from('pdi_audiences').select('*').eq('ativo', true).order('ordem'),
        supabase.from('competencias').select('*').eq('status', 'ativo').order('nome'),
      ]);

      if (mediaTypesRes.data) setMediaTypes(mediaTypesRes.data);
      if (tagsRes.data) setTags(tagsRes.data);
      if (audiencesRes.data) setAudiences(audiencesRes.data);
      if (competenciesRes.data) setCompetencies(competenciesRes.data);
    } catch (error: any) {
      showToast('error', 'Erro ao carregar opções do formulário');
    }
  };

  const loadContent = async () => {
    if (!contentId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pdi_contents')
        .select('*')
        .eq('id', contentId)
        .single();

      if (error) throw error;

      const [tagsRes, competenciesRes, audiencesRes] = await Promise.all([
        supabase.from('pdi_content_tags').select('tag_id').eq('content_id', contentId),
        supabase.from('pdi_content_competencies').select('competency_id').eq('content_id', contentId),
        supabase.from('pdi_content_audiences').select('audience_id').eq('content_id', contentId),
      ]);

      setFormData({
        titulo: data.titulo,
        descricao_curta: data.descricao_curta,
        descricao_longa: data.descricao_longa || '',
        cover_image_url: data.cover_image_url,
        media_type_id: data.media_type_id,
        external_url: data.external_url || '',
        duration_minutes: data.duration_minutes?.toString() || '',
        investment_cents: data.investment_cents ? (data.investment_cents / 100).toString() : '',
        is_active: data.is_active,
        selectedTags: tagsRes.data?.map((t) => t.tag_id) || [],
        selectedCompetencies: competenciesRes.data?.map((c) => c.competency_id) || [],
        selectedAudiences: audiencesRes.data?.map((a) => a.audience_id) || [],
      });
    } catch (error: any) {
      showToast('error', error.message || 'Erro ao carregar conteúdo');
      navigate('/pdi/conteudos');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = (id: string, field: 'selectedTags' | 'selectedCompetencies' | 'selectedAudiences') => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(id)
        ? prev[field].filter((itemId) => itemId !== id)
        : [...prev[field], id],
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/jpeg') && !file.type.startsWith('image/jpg')) {
      showToast('error', 'Apenas imagens JPG são permitidas');
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      showToast('error', 'A imagem deve ter no máximo 3MB');
      return;
    }

    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `pdi-covers/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('public')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('public').getPublicUrl(filePath);

      setFormData({ ...formData, cover_image_url: data.publicUrl });
      showToast('success', 'Imagem enviada com sucesso');
    } catch (error: any) {
      showToast('error', error.message || 'Erro ao enviar imagem');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.titulo.trim() || !formData.descricao_curta.trim() || !formData.media_type_id) {
      showToast('error', 'Preencha todos os campos obrigatórios');
      return;
    }

    try {
      setLoading(true);

      const contentData = {
        titulo: formData.titulo.trim(),
        descricao_curta: formData.descricao_curta.trim(),
        descricao_longa: formData.descricao_longa.trim() || null,
        cover_image_url: formData.cover_image_url.trim() || null,
        media_type_id: formData.media_type_id,
        external_url: formData.external_url.trim() || null,
        duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes) : null,
        investment_cents: formData.investment_cents ? Math.round(parseFloat(formData.investment_cents) * 100) : null,
        is_active: formData.is_active,
      };

      let contentIdToUse = contentId;

      if (contentId) {
        const { error } = await supabase
          .from('pdi_contents')
          .update(contentData)
          .eq('id', contentId);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('pdi_contents')
          .insert(contentData)
          .select()
          .single();

        if (error) throw error;
        contentIdToUse = data.id;
      }

      if (contentIdToUse) {
        await supabase.from('pdi_content_tags').delete().eq('content_id', contentIdToUse);
        if (formData.selectedTags.length > 0) {
          await supabase
            .from('pdi_content_tags')
            .insert(formData.selectedTags.map((tagId) => ({ content_id: contentIdToUse, tag_id: tagId })));
        }

        await supabase.from('pdi_content_competencies').delete().eq('content_id', contentIdToUse);
        if (formData.selectedCompetencies.length > 0) {
          await supabase
            .from('pdi_content_competencies')
            .insert(
              formData.selectedCompetencies.map((compId) => ({
                content_id: contentIdToUse,
                competency_id: compId,
              }))
            );
        }

        await supabase.from('pdi_content_audiences').delete().eq('content_id', contentIdToUse);
        if (formData.selectedAudiences.length > 0) {
          await supabase
            .from('pdi_content_audiences')
            .insert(
              formData.selectedAudiences.map((audId) => ({ content_id: contentIdToUse, audience_id: audId }))
            );
        }
      }

      showToast('success', contentId ? 'Conteúdo atualizado com sucesso' : 'Conteúdo criado com sucesso');
      navigate('/pdi/conteudos');
    } catch (error: any) {
      showToast('error', error.message || 'Erro ao salvar conteúdo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header
        title={contentId ? 'Editar Conteúdo' : 'Novo Conteúdo'}
        subtitle="Preencha os dados do conteúdo de desenvolvimento"
      />

      <div className="p-6">
        <button
          onClick={() => navigate('/pdi/conteudos')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft size={18} />
          Voltar
        </button>

        <form onSubmit={handleSubmit} className="max-w-4xl">
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Como fazer amigos e influenciar pessoas"
                  required
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição Curta <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.descricao_curta}
                  onChange={(e) => setFormData({ ...formData, descricao_curta: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={2}
                  placeholder="Descrição breve do conteúdo"
                  required
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição Longa
                </label>
                <textarea
                  value={formData.descricao_longa}
                  onChange={(e) => setFormData({ ...formData, descricao_longa: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  placeholder="Descrição detalhada (opcional)"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Imagem de Capa
                </label>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Fazer upload (JPG, máx. 3MB)</label>
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg"
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
                    />
                    {uploading && <p className="text-xs text-blue-600 mt-1">Enviando...</p>}
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="px-2 bg-white text-gray-500">ou</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Informar URL da imagem</label>
                    <input
                      type="url"
                      value={formData.cover_image_url}
                      onChange={(e) => setFormData({ ...formData, cover_image_url: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://exemplo.com/imagem.jpg"
                    />
                  </div>

                  {formData.cover_image_url && (
                    <div className="mt-3">
                      <p className="text-xs text-gray-600 mb-2">Preview (aspect ratio 1:1):</p>
                      <div className="w-48 aspect-square border border-gray-200 rounded-lg overflow-hidden">
                        <img
                          src={formData.cover_image_url}
                          alt="Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = '';
                            e.currentTarget.alt = 'Erro ao carregar imagem';
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Mídia <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.media_type_id}
                  onChange={(e) => setFormData({ ...formData, media_type_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Selecione...</option>
                  {mediaTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Link Externo
                </label>
                <input
                  type="url"
                  value={formData.external_url}
                  onChange={(e) => setFormData({ ...formData, external_url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duração (minutos)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: 120"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Investimento (R$)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.investment_cents}
                  onChange={(e) => setFormData({ ...formData, investment_cents: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: 49.90"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleSelection(tag.id, 'selectedTags')}
                      className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                        formData.selectedTags.includes(tag.id)
                          ? 'bg-blue-50 border-blue-300 text-blue-700'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {tag.nome}
                    </button>
                  ))}
                </div>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Competências</label>
                <div className="flex flex-wrap gap-2">
                  {competencies.map((comp) => (
                    <button
                      key={comp.id}
                      type="button"
                      onClick={() => toggleSelection(comp.id, 'selectedCompetencies')}
                      className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                        formData.selectedCompetencies.includes(comp.id)
                          ? 'bg-blue-50 border-blue-300 text-blue-700'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {comp.nome}
                    </button>
                  ))}
                </div>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Público</label>
                <div className="flex flex-wrap gap-2">
                  {audiences.map((aud) => (
                    <button
                      key={aud.id}
                      type="button"
                      onClick={() => toggleSelection(aud.id, 'selectedAudiences')}
                      className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                        formData.selectedAudiences.includes(aud.id)
                          ? 'bg-blue-50 border-blue-300 text-blue-700'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {aud.nome}
                    </button>
                  ))}
                </div>
              </div>

              <div className="col-span-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Conteúdo ativo</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/pdi/conteudos')}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={loading}
              >
                Cancelar
              </button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Salvando...' : contentId ? 'Atualizar' : 'Criar'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};
