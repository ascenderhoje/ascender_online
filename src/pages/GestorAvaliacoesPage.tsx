import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from '../utils/router';
import { supabase } from '../lib/supabase';
import { ClipboardList, Eye, Calendar } from 'lucide-react';

interface Avaliacao {
  id: string;
  data_avaliacao: string;
  status: string;
  observacoes: string | null;
  psicologa: {
    nome: string;
  } | null;
  modelo: {
    nome: string;
  } | null;
}

export function GestorAvaliacoesPage() {
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
          psicologa:administradores!psicologa_responsavel_id (
            nome
          ),
          modelo:modelos_avaliacao (
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
        psicologa: item.psicologa ? { nome: item.psicologa.nome } : null,
        modelo: item.modelo ? { nome: item.modelo.nome } : null,
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
      case 'finalizada':
        return 'bg-green-100 text-green-700';
      case 'em_andamento':
        return 'bg-ascender-purple-light/20 text-ascender-purple';
      case 'pendente':
        return 'bg-ascender-yellow/20 text-ascender-yellow-dark';
      case 'atrasada':
        return 'bg-red-100 text-red-700';
      case 'rascunho':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'concluida':
        return 'Concluída';
      case 'finalizada':
        return 'Finalizada';
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ascender-neutral">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {avaliacoes.length === 0 ? (
          <div className="gradient-purple text-white rounded-3xl p-8 mb-6">
            <h1 className="text-3xl font-poppins font-bold mb-2">Ainda não há avaliações cadastradas</h1>
            <p className="text-lg font-nunito">
              Aqui você sempre poderá visualizar a última avaliação realizada 😊
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h1 className="text-3xl font-poppins font-bold text-ascender-purple">Minhas Avaliações</h1>
              <p className="text-gray-600 font-nunito mt-1">Acompanhe suas avaliações pessoais</p>
            </div>

            <div className="bg-white rounded-2xl shadow-md border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-poppins font-semibold text-ascender-purple">Suas Avaliações</h2>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-nunito">
                        Data
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-nunito">
                        Modelo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-nunito">
                        Psicóloga
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-nunito">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider font-nunito">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {avaliacoes.map((avaliacao) => (
                      <tr key={avaliacao.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900 font-nunito">
                            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                            {formatDate(avaliacao.data_avaliacao)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-nunito">
                          {avaliacao.modelo?.nome || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-nunito">
                          {avaliacao.psicologa?.nome || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 text-xs font-medium font-nunito rounded-full ${getStatusColor(avaliacao.status)}`}>
                            {getStatusLabel(avaliacao.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          <button
                            onClick={() => navigate(`/user-avaliacao/${avaliacao.id}`)}
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-ascender-purple text-white rounded-lg hover:bg-ascender-purple-dark transition-colors font-nunito"
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
            </div>

            <div className="mt-6 bg-ascender-purple-light/10 border border-ascender-purple-light/30 rounded-2xl p-6">
              <h3 className="text-lg font-poppins font-semibold text-ascender-purple mb-2">Sobre suas avaliações</h3>
              <p className="text-gray-700 font-nunito">
                Aqui você pode visualizar todas as avaliações de competências que foram realizadas
                por psicólogas responsáveis. Clique em "Visualizar" para ver os detalhes completos
                de cada avaliação.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
