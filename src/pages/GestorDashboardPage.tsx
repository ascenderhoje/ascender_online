import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from '../utils/router';
import { supabase } from '../lib/supabase';
import { Users, Sparkles } from 'lucide-react';

interface DashboardStats {
  totalAvaliacoes: number;
  mediaPontuacao: number;
  pdisCompletos: number;
  pdisEmAndamento: number;
  pdisAtrasados: number;
}

export function GestorDashboardPage() {
  const { pessoa } = useAuth();
  const { navigate } = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalAvaliacoes: 0,
    mediaPontuacao: 0,
    pdisCompletos: 0,
    pdisEmAndamento: 0,
    pdisAtrasados: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [pessoa]);

  const loadStats = async () => {
    if (!pessoa) return;

    try {
      setLoading(true);

      const { data: gruposGestorData, error: gruposError } = await supabase
        .from('grupos_gestores')
        .select('grupo_id')
        .eq('pessoa_id', pessoa.id);

      if (gruposError) throw gruposError;

      const gruposIds = (gruposGestorData || []).map(g => g.grupo_id);

      if (gruposIds.length === 0) {
        setStats({
          totalAvaliacoes: 0,
          mediaPontuacao: 0,
          pdisCompletos: 0,
          pdisEmAndamento: 0,
          pdisAtrasados: 0,
        });
        setLoading(false);
        return;
      }

      const { data: pessoasGruposData, error: pessoasGruposError } = await supabase
        .from('pessoas_grupos')
        .select('pessoa_id')
        .in('grupo_id', gruposIds);

      if (pessoasGruposError) throw pessoasGruposError;

      const colaboradoresIds = [...new Set((pessoasGruposData || []).map(pg => pg.pessoa_id))];

      if (colaboradoresIds.length === 0) {
        setStats({
          totalAvaliacoes: 0,
          mediaPontuacao: 0,
          pdisCompletos: 0,
          pdisEmAndamento: 0,
          pdisAtrasados: 0,
        });
        setLoading(false);
        return;
      }

      const { data: avaliacoesData, error: avaliacoesError } = await supabase
        .from('avaliacoes')
        .select('id, colaborador_id, status')
        .in('colaborador_id', colaboradoresIds)
        .eq('status', 'finalizada');

      if (avaliacoesError) throw avaliacoesError;

      const totalAvaliacoes = avaliacoesData?.length || 0;
      const avaliacoesIds = (avaliacoesData || []).map(a => a.id);

      let mediaPontuacao = 0;
      if (avaliacoesIds.length > 0) {
        const { data: pontuacoesData, error: pontuacoesError } = await supabase
          .from('avaliacoes_competencias')
          .select('pontuacao')
          .in('avaliacao_id', avaliacoesIds);

        if (pontuacoesError) throw pontuacoesError;

        const pontuacoes = (pontuacoesData || []).map(p => Number(p.pontuacao));
        if (pontuacoes.length > 0) {
          mediaPontuacao = pontuacoes.reduce((acc, val) => acc + val, 0) / pontuacoes.length;
        }
      }

      const { data: pdiContentsData } = await supabase
        .from('pdi_user_contents')
        .select('id, status, planned_due_date')
        .in('user_id', colaboradoresIds);

      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      let pdisCompletos = 0;
      let pdisEmAndamento = 0;
      let pdisAtrasados = 0;

      (pdiContentsData || []).forEach((pdi: any) => {
        if (pdi.status === 'concluido') {
          pdisCompletos++;
        } else if (pdi.status === 'em_andamento') {
          if (pdi.planned_due_date) {
            const dueDate = new Date(pdi.planned_due_date);
            dueDate.setHours(0, 0, 0, 0);
            if (dueDate < hoje) {
              pdisAtrasados++;
            } else {
              pdisEmAndamento++;
            }
          } else {
            pdisEmAndamento++;
          }
        }
      });

      setStats({
        totalAvaliacoes,
        mediaPontuacao,
        pdisCompletos,
        pdisEmAndamento,
        pdisAtrasados,
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMediaLabel = (media: number): string => {
    if (media >= 4.5) return 'Excelente';
    if (media >= 3.5) return 'Bom';
    if (media >= 2.5) return 'Regular';
    if (media >= 1.5) return 'Baixo';
    return 'Muito Baixo';
  };

  const getMediaColor = (media: number): string => {
    if (media >= 4.5) return 'text-green-600';
    if (media >= 3.5) return 'text-blue-600';
    if (media >= 2.5) return 'text-yellow-600';
    if (media >= 1.5) return 'text-orange-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-ascender-neutral flex items-center justify-center">
        <p className="text-gray-500 font-nunito">Carregando...</p>
      </div>
    );
  }

  const progressPercentage = stats.mediaPontuacao > 0 ? (stats.mediaPontuacao / 5) * 100 : 0;

  return (
    <div className="min-h-screen bg-ascender-neutral">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="gradient-purple text-white rounded-3xl p-8 mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-20">
            <div className="relative">
              <Sparkles className="absolute top-4 right-12 w-12 h-12" />
              <Sparkles className="absolute top-12 right-24 w-8 h-8" />
              <div className="w-48 h-48 rounded-full bg-white/10 blur-3xl"></div>
            </div>
          </div>
          <div className="relative z-10">
            <h1 className="text-4xl font-poppins font-bold mb-4">
              Olá, {pessoa?.nome?.split(' ')[0]} :)
            </h1>
            <p className="text-lg font-nunito mb-2">
              Aqui você terá acesso ao desenvolvimento de cada colaborador que faz parte da sua equipe, além de acompanhar, gerenciar e dar muito feedback! 🚀
            </p>
            <p className="text-base font-nunito mt-4 font-semibold">
              Um sistema mais completo para você e sua equipe!
            </p>
            <p className="text-base font-nunito mt-2">
              Você está pronto para essa jornada?
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-ascender-purple-light/30 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-ascender-purple" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600 font-nunito">Você tem</p>
                <p className="text-2xl font-poppins font-bold text-ascender-purple">
                  {stats.totalAvaliacoes} avaliações
                </p>
                <p className="text-sm text-gray-600 font-nunito">disponíveis de colaboradores.</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm text-gray-600 font-nunito">Na média geral, seu time ficou com pontuação de</p>
                <span className={`text-2xl font-poppins font-bold ${getMediaColor(stats.mediaPontuacao)}`}>
                  {stats.mediaPontuacao.toFixed(2)}
                </span>
              </div>
              <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full rounded-full"
                  style={{
                    width: `${progressPercentage}%`,
                    background: 'linear-gradient(90deg, #EF4444 0%, #F97316 20%, #EAB308 40%, #22C55E 60%, #3B82F6 100%)',
                  }}
                />
              </div>
              <div className="flex justify-end mt-2">
                <span className={`text-sm font-nunito font-semibold ${getMediaColor(stats.mediaPontuacao)}`}>
                  ({getMediaLabel(stats.mediaPontuacao)})
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-8 text-white">
            <h3 className="text-lg font-poppins font-semibold mb-2">PDIs Completos</h3>
            <p className="text-6xl font-poppins font-bold">{stats.pdisCompletos}</p>
          </div>

          <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-2xl shadow-lg p-8 text-white">
            <h3 className="text-lg font-poppins font-semibold mb-2">PDIs Aguardando / Em execução</h3>
            <p className="text-6xl font-poppins font-bold">{stats.pdisEmAndamento}</p>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-lg p-8 text-white">
            <h3 className="text-lg font-poppins font-semibold mb-2">PDIs em Atraso</h3>
            <p className="text-6xl font-poppins font-bold">{stats.pdisAtrasados}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
