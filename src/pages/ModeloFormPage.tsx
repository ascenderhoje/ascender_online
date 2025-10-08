import { useState, useEffect, FormEvent, useRef } from 'react';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { PerguntaPersonalizadaItem } from '../components/PerguntaPersonalizadaItem';
import { useToast } from '../components/Toast';
import { supabase } from '../lib/supabase';
import { useRouter } from '../utils/router';

interface Competencia {
  id: string;
  nome: string;
  empresa_id: string | null;
}

interface PerguntaTexto {
  idioma: string;
  titulo: string;
  descricao: string;
  idioma_padrao: boolean;
}

interface Pergunta {
  id?: string;
  visibilidade: string;
  textos: PerguntaTexto[];
  obrigatorio: boolean;
  ordem: number;
  opcoes: string[];
}

interface ModeloFormPageProps {
  modeloId?: string;
}

export const ModeloFormPage = ({ modeloId }: ModeloFormPageProps) => {
  const { showToast } = useToast();
  const { navigate } = useRouter();
  const [loading, setLoading] = useState(false);
  const [nome, setNome] = useState('');
  const [competenciasDisponiveis, setCompetenciasDisponiveis] = useState<Competencia[]>([]);
  const [competenciasSelecionadas, setCompetenciasSelecionadas] = useState<string[]>([]);
  const [perguntas, setPerguntas] = useState<Pergunta[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isEditMode = !!modeloId;

  useEffect(() => {
    loadCompetencias();
    if (modeloId) {
      loadModelo();
    }
  }, [modeloId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const loadCompetencias = async () => {
    try {
      const { data, error } = await supabase
        .from('competencias')
        .select('*')
        .eq('status', 'ativo')
        .order('nome');

      if (error) throw error;
      setCompetenciasDisponiveis(data || []);
    } catch (error) {
      console.error('Error loading competencias:', error);
    }
  };

  const loadModelo = async () => {
    try {
      setLoading(true);

      const { data: modelo, error: modeloError } = await supabase
        .from('modelos_avaliacao')
        .select('*')
        .eq('id', modeloId)
        .single();

      if (modeloError) throw modeloError;
      setNome(modelo.nome);

      const { data: modeloComps, error: compsError } = await supabase
        .from('modelos_competencias')
        .select('competencia_id')
        .eq('modelo_id', modeloId)
        .order('ordem');

      if (compsError) throw compsError;
      setCompetenciasSelecionadas((modeloComps || []).map((mc: any) => mc.competencia_id));

      const { data: perguntasData, error: pergError } = await supabase
        .from('perguntas_personalizadas')
        .select('*, perguntas_personalizadas_textos(*)')
        .eq('modelo_id', modeloId)
        .order('ordem');

      if (pergError) throw pergError;

      const perguntasFormatted = (perguntasData || []).map((p: any) => {
        let textos = p.perguntas_personalizadas_textos || [];

        if (textos.length === 0 && (p.titulo || p.descricao)) {
          textos = [
            { idioma: 'pt-BR', titulo: p.titulo || '', descricao: p.descricao || '', idioma_padrao: true }
          ];
        }

        if (textos.length === 0) {
          textos = [
            { idioma: 'pt-BR', titulo: '', descricao: '', idioma_padrao: true }
          ];
        }

        return {
          id: p.id,
          visibilidade: p.visibilidade || 'todos',
          textos,
          obrigatorio: p.obrigatorio,
          ordem: p.ordem,
          opcoes: p.opcoes || [],
        };
      });

      setPerguntas(perguntasFormatted);
    } catch (error: any) {
      showToast('error', error.message || 'Erro ao carregar modelo');
    } finally {
      setLoading(false);
    }
  };

  const toggleCompetencia = (id: string) => {
    if (competenciasSelecionadas.includes(id)) {
      setCompetenciasSelecionadas(competenciasSelecionadas.filter((c) => c !== id));
    } else {
      setCompetenciasSelecionadas([...competenciasSelecionadas, id]);
    }
  };

  const removeCompetencia = (id: string) => {
    setCompetenciasSelecionadas(competenciasSelecionadas.filter((c) => c !== id));
  };

  const addPergunta = () => {
    setPerguntas([
      ...perguntas,
      {
        visibilidade: 'todos',
        textos: [
          { idioma: 'pt-BR', titulo: '', descricao: '', idioma_padrao: true },
        ],
        obrigatorio: false,
        ordem: perguntas.length,
        opcoes: [],
      },
    ]);
  };

  const updatePergunta = (index: number, field: string, value: any) => {
    const newPerguntas = [...perguntas];
    newPerguntas[index] = {
      ...newPerguntas[index],
      [field]: value,
    };
    setPerguntas(newPerguntas);
  };

  const removePergunta = (index: number) => {
    if (confirm('Tem certeza que deseja remover esta pergunta?')) {
      setPerguntas(perguntas.filter((_, i) => i !== index));
    }
  };

  const duplicatePergunta = (index: number) => {
    const perguntaOriginal = perguntas[index];
    const textoPtBr = perguntaOriginal.textos.find((t) => t.idioma === 'pt-BR');
    const novosTextos = perguntaOriginal.textos.map((t) => ({
      ...t,
      titulo: t.idioma === 'pt-BR' ? `${textoPtBr?.titulo || ''} (cópia)` : t.titulo,
    }));
    const novaPergunta = {
      ...perguntaOriginal,
      textos: novosTextos,
      ordem: perguntas.length,
    };
    setPerguntas([...perguntas, novaPergunta]);
    showToast('success', 'Pergunta duplicada');
  };

  const handleSubmit = async (e: FormEvent, createAnother = false) => {
    e.preventDefault();

    if (nome.trim().length < 3) {
      showToast('error', 'Nome deve ter no mínimo 3 caracteres');
      return;
    }

    if (competenciasSelecionadas.length === 0 && perguntas.length === 0) {
      showToast('error', 'Selecione ao menos uma competência ou adicione uma pergunta personalizada');
      return;
    }

    const hasPerguntasSemTitulo = perguntas.some((p) => {
      const textoPtBr = p.textos.find((t) => t.idioma === 'pt-BR');
      return !textoPtBr || !textoPtBr.titulo.trim();
    });
    if (hasPerguntasSemTitulo) {
      showToast('error', 'Todas as perguntas devem ter título');
      return;
    }

    try {
      setLoading(true);

      let savedModeloId = modeloId;

      if (isEditMode) {
        const { error: updateError } = await supabase
          .from('modelos_avaliacao')
          .update({ nome })
          .eq('id', savedModeloId);

        if (updateError) throw updateError;

        await supabase.from('modelos_competencias').delete().eq('modelo_id', savedModeloId);
        await supabase.from('perguntas_personalizadas').delete().eq('modelo_id', savedModeloId);
      } else {
        const { data: newModelo, error: insertError } = await supabase
          .from('modelos_avaliacao')
          .insert({ nome, status: 'rascunho' })
          .select()
          .single();

        if (insertError) throw insertError;
        savedModeloId = newModelo.id;
      }

      for (let i = 0; i < competenciasSelecionadas.length; i++) {
        const { error: compError } = await supabase
          .from('modelos_competencias')
          .insert({
            modelo_id: savedModeloId,
            competencia_id: competenciasSelecionadas[i],
            ordem: i,
          });

        if (compError) throw compError;
      }

      for (let i = 0; i < perguntas.length; i++) {
        const pergunta = perguntas[i];
        const { data: newPergunta, error: pergError } = await supabase
          .from('perguntas_personalizadas')
          .insert({
            modelo_id: savedModeloId,
            visibilidade: pergunta.visibilidade,
            obrigatorio: pergunta.obrigatorio,
            ordem: i,
            opcoes: pergunta.opcoes,
          })
          .select()
          .single();

        if (pergError) throw pergError;

        for (const texto of pergunta.textos) {
          if (texto.titulo.trim()) {
            const { error: textoError } = await supabase
              .from('perguntas_personalizadas_textos')
              .insert({
                pergunta_id: newPergunta.id,
                idioma: texto.idioma,
                titulo: texto.titulo,
                descricao: texto.descricao,
                idioma_padrao: texto.idioma === 'pt-BR',
              });

            if (textoError) throw textoError;
          }
        }
      }

      showToast('success', `Modelo ${isEditMode ? 'atualizado' : 'criado'} com sucesso!`);

      if (createAnother) {
        setNome('');
        setCompetenciasSelecionadas([]);
        setPerguntas([]);
      } else {
        navigate('/modelos');
      }
    } catch (error: any) {
      showToast('error', error.message || 'Erro ao salvar modelo');
    } finally {
      setLoading(false);
    }
  };

  const filteredCompetencias = competenciasDisponiveis.filter((c) =>
    c.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Header
        title={isEditMode ? 'Editar Modelo de Avaliação' : 'Adicionar Modelo de Avaliação'}
        action={
          <Button variant="ghost" icon={ArrowLeft} onClick={() => navigate('/modelos')}>
            Voltar
          </Button>
        }
      />

      <div className="p-6 max-w-4xl">
        <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Dados do Modelo</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Avaliação de Desempenho Anual"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Grupos de Critérios
                </label>
                <p className="text-xs text-gray-500 mb-3">
                  Selecione as Competências que farão parte deste modelo
                </p>

                <div className="relative" ref={dropdownRef}>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => setShowDropdown(true)}
                    placeholder="Buscar competências..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />

                  {showDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {filteredCompetencias.map((comp) => (
                        <div
                          key={comp.id}
                          onClick={() => toggleCompetencia(comp.id)}
                          className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={competenciasSelecionadas.includes(comp.id)}
                              onChange={() => {}}
                              className="rounded"
                            />
                            <span>{comp.nome}</span>
                          </div>
                          {comp.empresa_id && (
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                              Empresa
                            </span>
                          )}
                        </div>
                      ))}
                      {filteredCompetencias.length === 0 && (
                        <div className="px-4 py-2 text-gray-500 text-sm">
                          Nenhuma competência encontrada
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {competenciasSelecionadas.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {competenciasSelecionadas.map((compId) => {
                      const comp = competenciasDisponiveis.find((c) => c.id === compId);
                      if (!comp) return null;
                      return (
                        <div
                          key={compId}
                          className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full flex items-center gap-2 text-sm"
                        >
                          <span>{comp.nome}</span>
                          <button
                            type="button"
                            onClick={() => removeCompetencia(compId)}
                            className="hover:text-indigo-900"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Perguntas Personalizadas</h2>
                <p className="text-xs text-gray-500 mt-1">
                  Use perguntas personalizadas para complementar as Competências selecionadas
                </p>
              </div>
              <button
                type="button"
                onClick={addPergunta}
                className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center gap-1"
              >
                <Plus size={16} />
                Adicionar um novo item
              </button>
            </div>

            {perguntas.length === 0 ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <p className="text-gray-500 mb-3">Vazio</p>
                <p className="text-sm text-gray-400 mb-4">
                  Nenhuma pergunta personalizada cadastrada
                </p>
                <button
                  type="button"
                  onClick={addPergunta}
                  className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center gap-1 mx-auto"
                >
                  <Plus size={16} />
                  Adicionar um novo item
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {perguntas.map((pergunta, index) => (
                  <PerguntaPersonalizadaItem
                    key={index}
                    index={index}
                    visibilidade={pergunta.visibilidade}
                    textos={pergunta.textos}
                    obrigatorio={pergunta.obrigatorio}
                    opcoes={pergunta.opcoes}
                    onUpdate={updatePergunta}
                    onRemove={removePergunta}
                    onDuplicate={duplicatePergunta}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : isEditMode ? 'Salvar alterações' : 'Criar'}
            </Button>
            {!isEditMode && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  const fakeEvent = { preventDefault: () => {} } as FormEvent;
                  handleSubmit(fakeEvent, true);
                }}
                disabled={loading}
              >
                Criar e adicionar outro
              </Button>
            )}
          </div>
        </form>
      </div>
    </>
  );
};
