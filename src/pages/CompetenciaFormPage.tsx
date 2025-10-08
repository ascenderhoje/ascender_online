import { useState, useEffect, FormEvent } from 'react';
import { ArrowLeft, Plus } from 'lucide-react';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { CriterioItem } from '../components/CriterioItem';
import { useToast } from '../components/Toast';
import { supabase } from '../lib/supabase';
import { useRouter } from '../utils/router';

interface CriterioTexto {
  idioma: string;
  nome: string;
  descricao: string;
  idioma_padrao: boolean;
}

interface Criterio {
  id?: string;
  visibilidade: string;
  ordem: number;
  textos: CriterioTexto[];
}

interface CompetenciaFormPageProps {
  competenciaId?: string;
}

export const CompetenciaFormPage = ({ competenciaId }: CompetenciaFormPageProps) => {
  const { showToast } = useToast();
  const { navigate } = useRouter();
  const [loading, setLoading] = useState(false);
  const [nome, setNome] = useState('');
  const [fixo, setFixo] = useState(false);
  const [criterios, setCriterios] = useState<Criterio[]>([]);

  const isEditMode = !!competenciaId;

  useEffect(() => {
    if (competenciaId) {
      loadCompetencia();
    }
  }, [competenciaId]);

  const loadCompetencia = async () => {
    try {
      setLoading(true);

      const { data: competencia, error: compError } = await supabase
        .from('competencias')
        .select('*')
        .eq('id', competenciaId)
        .maybeSingle();

      if (compError) throw compError;
      if (!competencia) {
        showToast('error', 'Competência não encontrada');
        navigate('/competencias');
        return;
      }

      setNome(competencia.nome);
      setFixo(competencia.fixo);

      const { data: criteriosData, error: critError } = await supabase
        .from('criterios')
        .select('*, criterios_textos(*)')
        .eq('competencia_id', competenciaId)
        .order('ordem');

      if (critError) {
        console.error('Erro ao carregar critérios:', critError);
        throw critError;
      }

      console.log('Critérios carregados do banco:', criteriosData);

      const criteriosFormatted = (criteriosData || []).map((c: any) => {
        let textos = c.criterios_textos || [];

        if (textos.length === 0) {
          textos = [
            { idioma: 'pt-BR', nome: '', descricao: '', idioma_padrao: true }
          ];
        }

        return {
          id: c.id,
          visibilidade: c.visibilidade,
          ordem: c.ordem,
          textos,
        };
      });

      console.log('Critérios formatados:', criteriosFormatted);
      setCriterios(criteriosFormatted);
    } catch (error: any) {
      showToast('error', error.message || 'Erro ao carregar competência');
    } finally {
      setLoading(false);
    }
  };

  const addCriterio = () => {
    setCriterios([
      ...criterios,
      {
        visibilidade: 'todos',
        ordem: criterios.length,
        textos: [
          { idioma: 'pt-BR', nome: '', descricao: '', idioma_padrao: true },
        ],
      },
    ]);
  };

  const updateCriterio = (index: number, field: string, value: any) => {
    const newCriterios = [...criterios];
    newCriterios[index] = {
      ...newCriterios[index],
      [field]: value,
    };
    setCriterios(newCriterios);
  };

  const removeCriterio = (index: number) => {
    if (confirm('Tem certeza que deseja remover este critério?')) {
      setCriterios(criterios.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: FormEvent, createAnother = false) => {
    e.preventDefault();

    if (nome.trim().length < 2) {
      showToast('error', 'Nome deve ter no mínimo 2 caracteres');
      return;
    }

    const hasCriteriosSemNome = criterios.some((c) => {
      const textoPtBr = c.textos.find((t) => t.idioma === 'pt-BR');
      return !textoPtBr || !textoPtBr.nome.trim();
    });

    if (hasCriteriosSemNome) {
      showToast('error', 'Todos os critérios devem ter nome em Português');
      return;
    }

    try {
      setLoading(true);

      let savedCompetenciaId = competenciaId;

      if (isEditMode) {
        console.log('Modo edição: Atualizando competência', savedCompetenciaId);
        const { error: updateError } = await supabase
          .from('competencias')
          .update({ nome, fixo })
          .eq('id', savedCompetenciaId);

        if (updateError) throw updateError;

        console.log('Deletando critérios antigos...');
        const { error: deleteError } = await supabase
          .from('criterios')
          .delete()
          .eq('competencia_id', savedCompetenciaId);

        if (deleteError) {
          console.error('Erro ao deletar critérios antigos:', deleteError);
          throw deleteError;
        }
      } else {
        console.log('Modo criação: Inserindo nova competência');
        const { data: newComp, error: insertError } = await supabase
          .from('competencias')
          .insert({ nome, fixo, status: 'ativo' })
          .select()
          .maybeSingle();

        if (insertError) throw insertError;
        if (!newComp) throw new Error('Falha ao criar competência');

        savedCompetenciaId = newComp.id;
        console.log('Competência criada com ID:', savedCompetenciaId);
      }

      console.log('Salvando', criterios.length, 'critérios...');

      for (let i = 0; i < criterios.length; i++) {
        const criterio = criterios[i];

        console.log(`Salvando critério ${i + 1}:`, criterio);

        const { data: newCrit, error: critError } = await supabase
          .from('criterios')
          .insert({
            competencia_id: savedCompetenciaId,
            visibilidade: criterio.visibilidade,
            ordem: i,
          })
          .select()
          .maybeSingle();

        if (critError) {
          console.error('Erro ao salvar critério:', critError);
          throw critError;
        }
        if (!newCrit) {
          throw new Error('Falha ao criar critério');
        }

        console.log('Critério criado com ID:', newCrit.id);

        for (const texto of criterio.textos) {
          if (texto.nome.trim()) {
            console.log(`Salvando texto em ${texto.idioma} para critério ${newCrit.id}`);
            const { error: textoError } = await supabase
              .from('criterios_textos')
              .insert({
                criterio_id: newCrit.id,
                idioma: texto.idioma,
                nome: texto.nome,
                descricao: texto.descricao || '',
                idioma_padrao: texto.idioma === 'pt-BR',
              });

            if (textoError) {
              console.error('Erro ao salvar texto do critério:', textoError);
              throw textoError;
            }
          }
        }
      }

      console.log('Todos os critérios foram salvos com sucesso!');

      showToast('success', `Competência ${isEditMode ? 'atualizada' : 'criada'} com sucesso!`);

      if (createAnother) {
        setNome('');
        setFixo(false);
        setCriterios([]);
      } else {
        navigate('/competencias');
      }
    } catch (error: any) {
      showToast('error', error.message || 'Erro ao salvar competência');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header
        title={isEditMode ? 'Editar Competência' : 'Adicionar Competência'}
        action={
          <Button variant="ghost" icon={ArrowLeft} onClick={() => navigate('/competencias')}>
            Voltar
          </Button>
        }
      />

      <div className="p-6 max-w-4xl">
        <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Liderança"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-3">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={fixo}
                onChange={(e) => setFixo(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
            <div>
              <span className="text-sm font-medium text-gray-900">Fixo</span>
              <p className="text-xs text-gray-500">
                Catálogo corporativo padronizado. Edição restrita a administradores.
              </p>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">Critérios</label>
              <button
                type="button"
                onClick={addCriterio}
                className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center gap-1"
              >
                <Plus size={16} />
                Adicionar um novo item
              </button>
            </div>

            {criterios.length === 0 ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <p className="text-gray-500 mb-3">Vazio</p>
                <p className="text-sm text-gray-400 mb-4">
                  Nenhum critério cadastrado. Adicione itens para detalhar esta competência.
                </p>
                <button
                  type="button"
                  onClick={addCriterio}
                  className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center gap-1 mx-auto"
                >
                  <Plus size={16} />
                  Adicionar um novo item
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {criterios.map((criterio, index) => (
                  <CriterioItem
                    key={index}
                    index={index}
                    visibilidade={criterio.visibilidade}
                    textos={criterio.textos}
                    onUpdate={updateCriterio}
                    onRemove={removeCriterio}
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
