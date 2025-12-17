import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Header } from '../components/Header';
import { useToast } from '../components/Toast';
import { useRouter } from '../utils/router';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { PDIContent } from '../types';
import { PDIFilters } from '../components/PDIFilters';
import { PDIContentCard } from '../components/PDIContentCard';

export const PDIBibliotecaPage = () => {
  const { showToast } = useToast();
  const { navigate } = useRouter();
  const { pessoa } = useAuth();
  const [contents, setContents] = useState<PDIContent[]>([]);
  const [filteredContents, setFilteredContents] = useState<PDIContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [userContentIds, setUserContentIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    tags: [] as string[],
    mediaTypes: [] as string[],
    audiences: [] as string[],
    minRating: 0,
  });

  useEffect(() => {
    loadContents();
    if (pessoa?.id) {
      loadUserContents();
    }
  }, [pessoa]);

  useEffect(() => {
    applyFilters();
  }, [contents, searchTerm, filters]);

  const loadContents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pdi_contents')
        .select(`
          *,
          media_type:pdi_media_types(*)
        `)
        .eq('is_active', true)
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

  const loadUserContents = async () => {
    if (!pessoa?.id) return;

    try {
      const { data, error } = await supabase
        .from('pdi_user_contents')
        .select('content_id')
        .eq('user_id', pessoa.id);

      if (error) throw error;
      setUserContentIds(data?.map((uc) => uc.content_id) || []);
    } catch (error: any) {
      console.error('Erro ao carregar conteúdos do usuário:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...contents];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (content) =>
          content.titulo.toLowerCase().includes(term) ||
          content.descricao_curta.toLowerCase().includes(term) ||
          content.descricao_longa?.toLowerCase().includes(term)
      );
    }

    if (filters.tags.length > 0) {
      filtered = filtered.filter((content) =>
        content.tags?.some((tag) => filters.tags.includes(tag.id))
      );
    }

    if (filters.mediaTypes.length > 0) {
      filtered = filtered.filter((content) =>
        filters.mediaTypes.includes(content.media_type_id)
      );
    }

    if (filters.audiences.length > 0) {
      filtered = filtered.filter((content) =>
        content.audiences?.some((aud) => filters.audiences.includes(aud.id))
      );
    }

    if (filters.minRating > 0) {
      filtered = filtered.filter((content) => content.avg_rating >= filters.minRating);
    }

    setFilteredContents(filtered);
  };

  const handleAddContent = async (content: PDIContent) => {
    if (!pessoa?.id) {
      showToast('error', 'Você precisa estar logado');
      return;
    }

    try {
      const { error } = await supabase.from('pdi_user_contents').insert({
        user_id: pessoa.id,
        content_id: content.id,
        status: 'em_andamento',
      });

      if (error) {
        if (error.code === '23505') {
          showToast('error', 'Este conteúdo já está no seu PDI');
        } else {
          throw error;
        }
        return;
      }

      showToast('success', 'Conteúdo adicionado ao seu PDI');
      setUserContentIds([...userContentIds, content.id]);
    } catch (error: any) {
      showToast('error', error.message || 'Erro ao adicionar conteúdo');
    }
  };

  return (
    <>
      <Header
        title="Biblioteca de Conteúdos"
        subtitle="Explore conteúdos de desenvolvimento e adicione ao seu PDI"
      />

      <div className="p-6">
        <button
          onClick={() => navigate('/pdi/meu-pdi')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft size={18} />
          Voltar para Meu PDI
        </button>

        <PDIFilters onSearch={setSearchTerm} onFilterChange={setFilters} />

        {loading ? (
          <div className="text-center py-12 text-gray-500">Carregando...</div>
        ) : filteredContents.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {searchTerm || filters.tags.length > 0 || filters.mediaTypes.length > 0
                ? 'Nenhum conteúdo encontrado com os filtros aplicados'
                : 'Nenhum conteúdo disponível'}
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-gray-600">
              {filteredContents.length} conteúdo{filteredContents.length !== 1 ? 's' : ''}{' '}
              encontrado{filteredContents.length !== 1 ? 's' : ''}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredContents.map((content) => (
                <PDIContentCard
                  key={content.id}
                  content={content}
                  isAdded={userContentIds.includes(content.id)}
                  onAdd={handleAddContent}
                  showActions={true}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
};
