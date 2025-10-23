import { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import { PDITag, PDIMediaType, PDIAudience } from '../types';
import { supabase } from '../lib/supabase';

interface PDIFiltersProps {
  onSearch: (term: string) => void;
  onFilterChange: (filters: {
    tags: string[];
    mediaTypes: string[];
    audiences: string[];
    minRating: number;
  }) => void;
}

export const PDIFilters = ({ onSearch, onFilterChange }: PDIFiltersProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [tags, setTags] = useState<PDITag[]>([]);
  const [mediaTypes, setMediaTypes] = useState<PDIMediaType[]>([]);
  const [audiences, setAudiences] = useState<PDIAudience[]>([]);

  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedMediaTypes, setSelectedMediaTypes] = useState<string[]>([]);
  const [selectedAudiences, setSelectedAudiences] = useState<string[]>([]);
  const [minRating, setMinRating] = useState(0);

  useEffect(() => {
    loadFilterOptions();
  }, []);

  useEffect(() => {
    onFilterChange({
      tags: selectedTags,
      mediaTypes: selectedMediaTypes,
      audiences: selectedAudiences,
      minRating,
    });
  }, [selectedTags, selectedMediaTypes, selectedAudiences, minRating]);

  const loadFilterOptions = async () => {
    const [tagsRes, mediaTypesRes, audiencesRes] = await Promise.all([
      supabase.from('pdi_tags').select('*').order('nome'),
      supabase.from('pdi_media_types').select('*').eq('ativo', true).order('ordem'),
      supabase.from('pdi_audiences').select('*').eq('ativo', true).order('ordem'),
    ]);

    if (tagsRes.data) setTags(tagsRes.data);
    if (mediaTypesRes.data) setMediaTypes(mediaTypesRes.data);
    if (audiencesRes.data) setAudiences(audiencesRes.data);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    onSearch(value);
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const toggleMediaType = (typeId: string) => {
    setSelectedMediaTypes((prev) =>
      prev.includes(typeId) ? prev.filter((id) => id !== typeId) : [...prev, typeId]
    );
  };

  const toggleAudience = (audienceId: string) => {
    setSelectedAudiences((prev) =>
      prev.includes(audienceId) ? prev.filter((id) => id !== audienceId) : [...prev, audienceId]
    );
  };

  const clearFilters = () => {
    setSelectedTags([]);
    setSelectedMediaTypes([]);
    setSelectedAudiences([]);
    setMinRating(0);
  };

  const activeFiltersCount =
    selectedTags.length + selectedMediaTypes.length + selectedAudiences.length + (minRating > 0 ? 1 : 0);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
      <div className="flex gap-3 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Buscar conteúdos..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
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
          {activeFiltersCount > 0 && (
            <span className="bg-blue-600 text-white text-xs font-medium px-2 py-0.5 rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {showFilters && (
        <div className="space-y-4 pt-4 border-t border-gray-200">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => toggleTag(tag.id)}
                  className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                    selectedTags.includes(tag.id)
                      ? 'bg-blue-50 border-blue-300 text-blue-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {tag.nome}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Mídia</label>
            <div className="flex flex-wrap gap-2">
              {mediaTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => toggleMediaType(type.id)}
                  className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                    selectedMediaTypes.includes(type.id)
                      ? 'bg-blue-50 border-blue-300 text-blue-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {type.nome}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Público</label>
            <div className="flex flex-wrap gap-2">
              {audiences.map((audience) => (
                <button
                  key={audience.id}
                  onClick={() => toggleAudience(audience.id)}
                  className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                    selectedAudiences.includes(audience.id)
                      ? 'bg-blue-50 border-blue-300 text-blue-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {audience.nome}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Avaliação Mínima: {minRating} ★
            </label>
            <input
              type="range"
              min="0"
              max="5"
              step="0.5"
              value={minRating}
              onChange={(e) => setMinRating(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {activeFiltersCount > 0 && (
            <div className="flex justify-end">
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Limpar filtros
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
