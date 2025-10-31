import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from '../utils/router';
import { supabase } from '../lib/supabase';
import { ClipboardList, TrendingUp, User } from 'lucide-react';

interface DashboardStats {
  totalAvaliacoes: number;
  mediaNotas: number;
}

export function GestorDashboardPage() {
  const { pessoa } = useAuth();
  const { navigate } = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalAvaliacoes: 0,
    mediaNotas: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [pessoa]);

  const loadStats = async () => {
    if (!pessoa) return;

    try {
      setLoading(true);

      const { data: avaliacoesData, error: avaliacoesError } = await supabase
        .from('avaliacoes')
        .select('id, status')
        .eq('colaborador_id', pessoa.id);

      if (avaliacoesError) throw avaliacoesError;

      const totalAvaliacoes = avaliacoesData?.length || 0;

      const { data: pontuacoesData, error: pontuacoesError } = await supabase
        .from('avaliacoes_competencias')
        .select('pontuacao')
        .in('avaliacao_id', (avaliacoesData || []).map(a => a.id));

      if (pontuacoesError) throw pontuacoesError;

      const pontuacoes = pontuacoesData?.map(p => Number(p.pontuacao)) || [];
      const mediaNotas = pontuacoes.length > 0
        ? pontuacoes.reduce((acc, val) => acc + val, 0) / pontuacoes.length
        : 0;

      setStats({
        totalAvaliacoes,
        mediaNotas,
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-ascender-neutral flex items-center justify-center">
        <p className="text-gray-500 font-nunito">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ascender-neutral">
      <div className="gradient-purple text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-20 w-32 h-32 rounded-full bg-ascender-yellow"></div>
          <div className="absolute bottom-10 left-20 w-24 h-24 rounded-full bg-ascender-purple-light"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg">
              <User className="w-12 h-12 text-ascender-purple" />
            </div>
            <div>
              <h1 className="text-4xl font-poppins font-bold">Olá, {pessoa?.nome}!</h1>
              <p className="text-ascender-purple-light mt-2 font-nunito text-lg">Bem-vindo ao painel do gestor</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-md p-6 border border-ascender-purple-light/20 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-ascender-purple-light/20 rounded-xl flex items-center justify-center">
                <ClipboardList className="w-7 h-7 text-ascender-purple" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-nunito">Total de Avaliações</p>
                <p className="text-3xl font-poppins font-bold text-ascender-purple">{stats.totalAvaliacoes}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6 border border-ascender-yellow/20 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-ascender-yellow/20 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-7 h-7 text-ascender-yellow-dark" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-nunito">Média de Notas</p>
                <p className="text-3xl font-poppins font-bold text-ascender-yellow-dark">
                  {stats.mediaNotas.toFixed(1)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6 border border-ascender-purple-light/20">
          <h2 className="text-2xl font-poppins font-semibold text-ascender-purple mb-6">Ações Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/gestor-pessoas')}
              className="p-6 border-2 border-ascender-purple-light/30 rounded-2xl hover:border-ascender-purple hover:bg-ascender-purple-light/10 transition-all text-left group"
            >
              <h3 className="font-poppins font-semibold text-gray-900 group-hover:text-ascender-purple text-lg">
                Ver Pessoas
              </h3>
              <p className="text-sm font-nunito text-gray-600 mt-2">
                Acesse a lista de pessoas da sua equipe
              </p>
            </button>

            <button
              onClick={() => navigate('/gestor-avaliacoes')}
              className="p-6 border-2 border-ascender-purple-light/30 rounded-2xl hover:border-ascender-purple hover:bg-ascender-purple-light/10 transition-all text-left group"
            >
              <h3 className="font-poppins font-semibold text-gray-900 group-hover:text-ascender-purple text-lg">
                Minhas Avaliações
              </h3>
              <p className="text-sm font-nunito text-gray-600 mt-2">
                Visualize suas avaliações pessoais
              </p>
            </button>
          </div>
        </div>

        <div className="mt-6 bg-ascender-purple-light/10 border border-ascender-purple-light/30 rounded-2xl p-6">
          <h3 className="text-lg font-poppins font-semibold text-ascender-purple mb-3">Sobre o painel do gestor</h3>
          <p className="text-gray-700 font-nunito leading-relaxed">
            Como gestor, você tem acesso à visualização das pessoas que pertencem aos grupos sob sua gestão
            e pode acompanhar o desenvolvimento profissional de cada membro da equipe através das avaliações.
          </p>
        </div>
      </div>
    </div>
  );
}
