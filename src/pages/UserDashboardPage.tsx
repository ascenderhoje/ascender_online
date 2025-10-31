import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from '../utils/router';
import { supabase } from '../lib/supabase';
import { ClipboardList, TrendingUp, User, Calendar, Eye } from 'lucide-react';

interface Avaliacao {
  id: string;
  data_avaliacao: string;
  status: string;
  observacoes: string | null;
  modelo: {
    nome: string;
  } | null;
  psicologa: {
    nome: string;
  } | null;
}

export function UserDashboardPage() {
  const { pessoa } = useAuth();
  const { navigate } = useRouter();
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAvaliacoes();
  }, [pessoa]);

  const loadAvaliacoes = async () => {
    if (!pessoa) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('avaliacoes')
        .select(`
          id,
          data_avaliacao,
          status,
          observacoes,
          modelos_avaliacao (
            nome
          ),
          psicologa:administradores!psicologa_responsavel_id (
            nome
          )
        `)
        .eq('colaborador_id', pessoa.id)
        .eq('status', 'finalizada')
        .order('data_avaliacao', { ascending: false });

      if (error) throw error;

      const formattedData = (data || []).map((item: any) => ({
        id: item.id,
        data_avaliacao: item.data_avaliacao,
        status: item.status,
        observacoes: item.observacoes,
        modelo: item.modelos_avaliacao ? { nome: item.modelos_avaliacao.nome } : null,
        psicologa: item.psicologa ? { nome: item.psicologa.nome } : null,
      }));

      setAvaliacoes(formattedData);
    } catch (error) {
      console.error('Erro ao carregar avaliações:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'concluida':
        return 'bg-green-100 text-green-700';
      case 'em_andamento':
        return 'bg-blue-100 text-blue-700';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-700';
      case 'atrasada':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'concluida':
        return 'Concluída';
      case 'em_andamento':
        return 'Em Andamento';
      case 'pendente':
        return 'Pendente';
      case 'atrasada':
        return 'Atrasada';
      case 'rascunho':
        return 'Rascunho';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
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
              <p className="text-ascender-purple-light mt-2 font-nunito text-lg">Bem-vindo ao seu painel de desenvolvimento</p>
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
                <p className="text-sm text-gray-600 font-nunito">Avaliações Disponíveis</p>
                <p className="text-3xl font-poppins font-bold text-ascender-purple">{avaliacoes.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6 border border-ascender-yellow/20 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-ascender-yellow/20 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-7 h-7 text-ascender-yellow-dark" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-nunito">Finalizadas</p>
                <p className="text-3xl font-poppins font-bold text-ascender-yellow-dark">
                  {avaliacoes.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md border border-ascender-purple-light/20">
          <div className="px-6 py-5 border-b border-ascender-purple-light/20">
            <h2 className="text-2xl font-poppins font-semibold text-ascender-purple">Minhas Avaliações</h2>
          </div>

          {avaliacoes.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <ClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 font-nunito">Você ainda não possui avaliações registradas.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-ascender-purple-light/10">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-nunito font-semibold text-ascender-purple uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-nunito font-semibold text-ascender-purple uppercase tracking-wider">
                      Psicóloga
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-nunito font-semibold text-ascender-purple uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {avaliacoes.map((avaliacao) => (
                    <tr key={avaliacao.id} className="hover:bg-ascender-purple-light/5 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-nunito text-gray-900">
                        {formatDate(avaliacao.data_avaliacao)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-nunito text-gray-900">
                        {avaliacao.psicologa?.nome || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <button
                          onClick={() => navigate(`/user-avaliacao/${avaliacao.id}`)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-ascender-purple text-white rounded-xl hover:bg-ascender-purple-dark transition-colors font-nunito font-medium"
                        >
                          <Eye className="w-4 h-4" />
                          Visualizar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-8 bg-ascender-purple-light/10 border border-ascender-purple-light/30 rounded-2xl p-6">
          <h3 className="text-lg font-poppins font-semibold text-ascender-purple mb-3">Sobre suas avaliações</h3>
          <p className="text-gray-700 font-nunito leading-relaxed">
            Este é o seu espaço para acompanhar todas as avaliações de competências realizadas.
            Aqui você pode visualizar seu histórico, verificar o status de avaliações em andamento
            e acompanhar seu desenvolvimento profissional ao longo do tempo.
          </p>
        </div>
      </div>
    </div>
  );
}
