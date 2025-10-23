import { useState } from 'react';
import { ExternalLink, Calendar, DollarSign, Clock, Plus, Check, Trash2, Edit } from 'lucide-react';
import { PDIContent } from '../types';
import { PDIRatingStars } from './PDIRatingStars';
import { PDITagChip } from './PDITagChip';

interface PDIContentCardProps {
  content: PDIContent;
  isAdded?: boolean;
  onAdd?: (content: PDIContent) => void;
  onRemove?: (contentId: string) => void;
  onEdit?: (contentId: string) => void;
  showActions?: boolean;
  plannedDate?: string;
  status?: string;
}

export const PDIContentCard = ({
  content,
  isAdded = false,
  onAdd,
  onRemove,
  onEdit,
  showActions = true,
  plannedDate,
  status,
}: PDIContentCardProps) => {
  const [imageError, setImageError] = useState(false);

  const formatCurrency = (cents?: number) => {
    if (!cents) return null;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(cents / 100);
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return null;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
    }
    return `${mins}min`;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative h-48 bg-gray-100">
        {!imageError ? (
          <img
            src={content.cover_image_url}
            alt={content.titulo}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <span className="text-sm">Imagem não disponível</span>
          </div>
        )}
        {content.external_url && (
          <a
            href={content.external_url}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
            title="Abrir link externo"
          >
            <ExternalLink size={16} className="text-gray-600" />
          </a>
        )}
        {status && (
          <div
            className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-medium ${
              status === 'concluido'
                ? 'bg-green-500 text-white'
                : 'bg-blue-500 text-white'
            }`}
          >
            {status === 'concluido' ? 'Concluído' : 'Em Andamento'}
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 text-lg line-clamp-2 flex-1">
            {content.titulo}
          </h3>
          {content.media_type && (
            <span className="ml-2 text-xs text-gray-500 whitespace-nowrap">
              {content.media_type.nome}
            </span>
          )}
        </div>

        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {content.descricao_curta}
        </p>

        <div className="flex items-center gap-4 mb-3 text-xs text-gray-500">
          {content.duration_minutes && (
            <div className="flex items-center gap-1">
              <Clock size={14} />
              <span>{formatDuration(content.duration_minutes)}</span>
            </div>
          )}
          {content.investment_cents && (
            <div className="flex items-center gap-1">
              <DollarSign size={14} />
              <span>{formatCurrency(content.investment_cents)}</span>
            </div>
          )}
          {plannedDate && (
            <div className="flex items-center gap-1">
              <Calendar size={14} />
              <span>{new Date(plannedDate).toLocaleDateString('pt-BR')}</span>
            </div>
          )}
        </div>

        {content.tags && content.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {content.tags.slice(0, 3).map((tag) => (
              <PDITagChip key={tag.id} name={tag.nome} small />
            ))}
            {content.tags.length > 3 && (
              <span className="text-xs text-gray-500">+{content.tags.length - 3}</span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <PDIRatingStars rating={content.avg_rating} size={16} />
            <span className="text-xs text-gray-500">
              {content.avg_rating.toFixed(1)} ({content.ratings_count})
            </span>
          </div>

          {showActions && (
            <div className="flex gap-2">
              {onEdit && (
                <button
                  onClick={() => onEdit(content.id)}
                  className="text-sm px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1"
                >
                  <Edit size={14} />
                  Editar
                </button>
              )}
              {onRemove && (
                <button
                  onClick={() => onRemove(content.id)}
                  className="text-sm px-3 py-1.5 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-1"
                >
                  <Trash2 size={14} />
                  Remover
                </button>
              )}
              {onAdd && !isAdded && (
                <button
                  onClick={() => onAdd(content)}
                  className="text-sm px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
                >
                  <Plus size={14} />
                  Adicionar
                </button>
              )}
              {isAdded && (
                <button
                  disabled
                  className="text-sm px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg flex items-center gap-1 cursor-default"
                >
                  <Check size={14} />
                  Adicionado
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
