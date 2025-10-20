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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Olá, {pessoa?.nome}!</h1>
              <p className="text-blue-100 mt-1">Bem-vindo ao painel do gestor</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <ClipboardList className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total de Avaliações</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalAvaliacoes}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Média de Notas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.mediaNotas.toFixed(1)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Ações Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/gestor-pessoas')}
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
            >
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">
                Ver Pessoas
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Acesse a lista de pessoas da sua equipe
              </p>
            </button>

            <button
              onClick={() => navigate('/gestor-avaliacoes')}
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
            >
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">
                Minhas Avaliações
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Visualize suas avaliações pessoais
              </p>
            </button>
          </div>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Sobre o painel do gestor</h3>
          <p className="text-blue-700">
            Como gestor, você tem acesso à visualização das pessoas que pertencem aos grupos sob sua gestão
            e pode acompanhar o desenvolvimento profissional de cada membro da equipe através das avaliações.
          </p>
        </div>
      </div>
    </div>
  );
}
