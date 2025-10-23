import { useState, useEffect } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { useToast } from '../components/Toast';
import { useRouter } from '../utils/router';
import { supabase } from '../lib/supabase';
import { PDIContent, PDITag, PDIMediaType } from '../types';
import { PDIContentCard } from '../components/PDIContentCard';

export const PDIContentsPage = () => {
  const { showToast } = useToast();
  const { navigate } = useRouter();
  const [contents, setContents] = useState<PDIContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMediaType, setSelectedMediaType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [mediaTypes, setMediaTypes] = useState<PDIMediaType[]>([]);

  useEffect(() => {
    loadContents();
    loadMediaTypes();
  }, []);

  const loadMediaTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('pdi_media_types')
        .select('*')
        .eq('ativo', true)
        .order('ordem');

      if (error) throw error;
      setMediaTypes(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar tipos de mídia:', error);
    }
  };

  const loadContents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pdi_contents')
        .select(`
          *,
          media_type:pdi_media_types(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const contentsWithRelations = await Promise.all(
        (data || []).map(async (content) => {
          const [tagsRes, competenciesRes, audiencesRes] = await Promise.all([
            supabase
              .from('pdi_content_tags')
              .select('tag:pdi_tags(*)')
              .eq('content_id', content.id),
            supabase
              .from('pdi_content_competencies')
              .select('competency:competencias(*)')
              .eq('content_id', content.id),
            supabase
              .from('pdi_content_audiences')
              .select('audience:pdi_audiences(*)')
              .eq('content_id', content.id),
          ]);

          return {
            ...content,
            tags: tagsRes.data?.map((t: any) => t.tag) || [],
            competencies: competenciesRes.data?.map((c: any) => c.competency) || [],
            audiences: audiencesRes.data?.map((a: any) => a.audience) || [],
          };
        })
      );

      setContents(contentsWithRelations);
    } catch (error: any) {
      showToast('error', error.message || 'Erro ao carregar conteúdos');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este conteúdo?')) return;

    try {
      const { error } = await supabase.from('pdi_contents').delete().eq('id', id);
      if (error) throw error;
      showToast('success', 'Conteúdo excluído com sucesso');
      loadContents();
    } catch (error: any) {
      showToast('error', error.message || 'Erro ao excluir conteúdo');
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('pdi_contents')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      showToast('success', `Conteúdo ${!currentStatus ? 'ativado' : 'desativado'} com sucesso`);
      loadContents();
    } catch (error: any) {
      showToast('error', error.message || 'Erro ao atualizar conteúdo');
    }
  };

  const filteredContents = contents.filter((content) => {
    const matchesSearch =
      content.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      content.descricao_curta.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesMediaType =
      !selectedMediaType || content.media_type_id === selectedMediaType;

    const matchesStatus =
      selectedStatus === 'all' ||
      (selectedStatus === 'active' && content.is_active) ||
      (selectedStatus === 'inactive' && !content.is_active);

    return matchesSearch && matchesMediaType && matchesStatus;
  });

  return (
    <>
      <Header
        title="Conteúdos do PDI"
        subtitle="Gerencie os conteúdos de desenvolvimento disponíveis para os colaboradores"
      />

      <div className="p-6">
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar conteúdos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 border rounded-lg flex items-center gap-2 transition-colors ${
              showFilters
                ? 'bg-blue-50 border-blue-300 text-blue-700'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter size={18} />
            Filtros
          </button>
          <Button onClick={() => navigate('/pdi/conteudos/new')}>
            <Plus size={18} />
            Novo Conteúdo
          </Button>
        </div>

        {showFilters && (
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Mídia
                </label>
                <select
                  value={selectedMediaType}
                  onChange={(e) => setSelectedMediaType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Todos os tipos</option>
                  {mediaTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Todos</option>
                  <option value="active">Ativos</option>
                  <option value="inactive">Inativos</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-gray-500">Carregando...</div>
        ) : filteredContents.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">
              {searchTerm ? 'Nenhum conteúdo encontrado' : 'Nenhum conteúdo cadastrado'}
            </p>
            {!searchTerm && (
              <Button onClick={() => navigate('/pdi/conteudos/new')}>
                <Plus size={18} />
                Criar Primeiro Conteúdo
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-gray-600">
              {filteredContents.length} conteúdo{filteredContents.length !== 1 ? 's' : ''}{' '}
              encontrado{filteredContents.length !== 1 ? 's' : ''}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredContents.map((content) => (
                <div key={content.id} className="relative">
                  <PDIContentCard
                    content={content}
                    onEdit={(id) => navigate(`/pdi/conteudos/${id}/edit`)}
                    onRemove={handleDelete}
                    showActions={true}
                  />
                  <div className="absolute top-2 left-2">
                    <button
                      onClick={() => handleToggleActive(content.id, content.is_active)}
                      className={`px-2 py-1 text-xs font-medium rounded ${
                        content.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {content.is_active ? 'Ativo' : 'Inativo'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
};
