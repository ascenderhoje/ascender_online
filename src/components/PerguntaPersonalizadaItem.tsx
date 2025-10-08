import { useState } from 'react';
import { ChevronDown, ChevronUp, Trash2, Copy } from 'lucide-react';

interface PerguntaTexto {
  idioma: string;
  titulo: string;
  descricao: string;
  idioma_padrao: boolean;
}

interface PerguntaPersonalizadaItemProps {
  index: number;
  visibilidade: string;
  textos: PerguntaTexto[];
  obrigatorio: boolean;
  opcoes: string[];
  onUpdate: (index: number, field: string, value: any) => void;
  onRemove: (index: number) => void;
  onDuplicate: (index: number) => void;
}

const IDIOMAS = [
  { code: 'pt-BR', label: 'Português', flag: '🇧🇷' },
  { code: 'en-US', label: 'Inglês', flag: '🇺🇸' },
  { code: 'es-ES', label: 'Espanhol', flag: '🇪🇸' },
];

export const PerguntaPersonalizadaItem = ({
  index,
  visibilidade,
  textos,
  obrigatorio,
  opcoes,
  onUpdate,
  onRemove,
  onDuplicate,
}: PerguntaPersonalizadaItemProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('pt-BR');

  const getTextoForIdioma = (idioma: string) => {
    return textos.find((t) => t.idioma === idioma) || { idioma, titulo: '', descricao: '', idioma_padrao: idioma === 'pt-BR' };
  };

  const updateTexto = (idioma: string, field: 'titulo' | 'descricao', value: string) => {
    const newTextos = textos.filter((t) => t.idioma !== idioma);
    const textoAtual = getTextoForIdioma(idioma);
    newTextos.push({
      ...textoAtual,
      [field]: value,
    });
    onUpdate(index, 'textos', newTextos);
  };

  const addOpcao = () => {
    onUpdate(index, 'opcoes', [...opcoes, '']);
  };

  const updateOpcao = (opcaoIndex: number, value: string) => {
    const newOpcoes = [...opcoes];
    newOpcoes[opcaoIndex] = value;
    onUpdate(index, 'opcoes', newOpcoes);
  };

  const removeOpcao = (opcaoIndex: number) => {
    const newOpcoes = opcoes.filter((_, i) => i !== opcaoIndex);
    onUpdate(index, 'opcoes', newOpcoes);
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
              {textoPtBr.titulo || `Pergunta ${index + 1}`}
            </span>
          </div>
          {obrigatorio && (
            <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded">
              Obrigatório
            </span>
          )}
          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
            {visibilidade === 'todos' ? 'Colaborador e Gestor' : visibilidade === 'gestor' ? 'Gestor' : 'Colaborador'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate(index);
            }}
            className="text-gray-600 hover:text-gray-700 p-2"
            title="Duplicar"
          >
            <Copy size={18} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(index);
            }}
            className="text-red-600 hover:text-red-700 p-2"
            title="Excluir"
          >
            <Trash2 size={18} />
          </button>
        </div>
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
              <option value="colaborador">Colaborador</option>
              <option value="gestor">Gestor</option>
              <option value="todos">Colaborador e Gestor</option>
            </select>
          </div>

          <div className="border-t pt-4">
            <div className="flex gap-2 mb-4">
              {IDIOMAS.map((idioma) => (
                <button
                  key={idioma.code}
                  type="button"
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
                  Título da pergunta {activeTab === 'pt-BR' && <span className="text-red-600">*</span>}
                </label>
                <input
                  type="text"
                  value={textoAtual.titulo}
                  onChange={(e) => updateTexto(activeTab, 'titulo', e.target.value)}
                  placeholder="Ex: Qual é sua maior conquista profissional?"
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
                  placeholder="Texto de ajuda para o respondente..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {opcoes.length > 0 && (
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Opções de resposta
                </label>
                <button
                  type="button"
                  onClick={addOpcao}
                  className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                >
                  + Adicionar opção
                </button>
              </div>
              <div className="space-y-2">
                {opcoes.map((opcao, opcaoIndex) => (
                  <div key={opcaoIndex} className="flex gap-2">
                    <input
                      type="text"
                      value={opcao}
                      onChange={(e) => updateOpcao(opcaoIndex, e.target.value)}
                      placeholder={`Opção ${opcaoIndex + 1}`}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => removeOpcao(opcaoIndex)}
                      className="text-red-600 hover:text-red-700 p-2"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 border-t pt-4">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={obrigatorio}
                onChange={(e) => onUpdate(index, 'obrigatorio', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
            <span className="text-sm font-medium text-gray-900">Obrigatório</span>
          </div>
        </div>
      )}
    </div>
  );
};
