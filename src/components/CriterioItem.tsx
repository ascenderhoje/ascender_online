import { useState } from 'react';
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react';

interface CriterioTexto {
  idioma: string;
  nome: string;
  descricao: string;
  idioma_padrao: boolean;
}

interface CriterioItemProps {
  index: number;
  visibilidade: string;
  textos: CriterioTexto[];
  onUpdate: (index: number, field: string, value: any) => void;
  onRemove: (index: number) => void;
}

const IDIOMAS = [
  { code: 'pt-BR', label: 'Português', flag: '🇧🇷' },
  { code: 'en-US', label: 'Inglês', flag: '🇺🇸' },
  { code: 'es-ES', label: 'Espanhol', flag: '🇪🇸' },
];

export const CriterioItem = ({ index, visibilidade, textos, onUpdate, onRemove }: CriterioItemProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('pt-BR');

  const getTextoForIdioma = (idioma: string) => {
    return textos.find((t) => t.idioma === idioma) || { idioma, nome: '', descricao: '', idioma_padrao: idioma === 'pt-BR' };
  };

  const updateTexto = (idioma: string, field: 'nome' | 'descricao', value: string) => {
    const newTextos = textos.filter((t) => t.idioma !== idioma);
    const textoAtual = getTextoForIdioma(idioma);
    newTextos.push({
      ...textoAtual,
      [field]: value,
    });
    onUpdate(index, 'textos', newTextos);
  };

  const textoAtual = getTextoForIdioma(activeTab);
  const textoPtBr = getTextoForIdioma('pt-BR');

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3 flex-1">
          <div className="flex items-center gap-2">
            {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            <span className="font-medium">
              {textoPtBr.nome || `Critério ${index + 1}`}
            </span>
          </div>
          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
            {visibilidade === 'todos' ? 'Colaborador e Gestor' : visibilidade === 'gestor' ? 'Apenas Gestor' : 'Avaliadores/Admins'}
          </span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(index);
          }}
          className="text-red-600 hover:text-red-700 p-2"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {isOpen && (
        <div className="border-t border-gray-200 p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quem pode visualizar
            </label>
            <select
              value={visibilidade}
              onChange={(e) => onUpdate(index, 'visibilidade', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="todos">Colaborador e Gestor</option>
              <option value="gestor">Apenas Gestor</option>
              <option value="avaliadores">Somente Avaliadores ou Admins</option>
            </select>
          </div>

          <div className="border-t pt-4">
            <div className="flex gap-2 mb-4">
              {IDIOMAS.map((idioma) => (
                <button
                  key={idioma.code}
                  onClick={() => setActiveTab(idioma.code)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === idioma.code
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {idioma.flag} {idioma.label}
                  {idioma.code === 'pt-BR' && (
                    <span className="ml-1 text-xs">[Padrão]</span>
                  )}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do critério {activeTab === 'pt-BR' && <span className="text-red-600">*</span>}
                </label>
                <input
                  type="text"
                  value={textoAtual.nome}
                  onChange={(e) => updateTexto(activeTab, 'nome', e.target.value)}
                  placeholder="Ex: Demonstra capacidade de liderar equipes"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  value={textoAtual.descricao}
                  onChange={(e) => updateTexto(activeTab, 'descricao', e.target.value)}
                  placeholder="Descreva o critério de forma detalhada..."
                  rows={4}
                  maxLength={500}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {textoAtual.descricao.length}/500 caracteres
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
