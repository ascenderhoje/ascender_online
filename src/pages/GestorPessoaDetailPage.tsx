import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from '../utils/router';
import { supabase } from '../lib/supabase';
import { ArrowLeft, User, ClipboardList, Eye, Calendar } from 'lucide-react';
import { Button } from '../components/Button';

interface Pessoa {
  id: string;
  nome: string;
  email: string;
  funcao: string | null;
  avatar_url: string | null;
}

interface Avaliacao {
  id: string;
  data_avaliacao: string;
  status: string;
  psicologa: {
    nome: string;
  } | null;
  modelo: {
    nome: string;
  } | null;
}

export function GestorPessoaDetailPage() {
  const { params, navigate } = useRouter();
  const { pessoa: gestorPessoa } = useAuth();
  const [pessoa, setPessoa] = useState<Pessoa | null>(null);
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    if (params.id) {
      checkAccessAndLoadData(params.id);
    }
  }, [params.id, gestorPessoa]);

  const checkAccessAndLoadData = async (pessoaId: string) => {
    if (!gestorPessoa) return;

    try {
      setLoading(true);

      const { data: gruposGestorData, error: gruposError } = await supabase
        .from('grupos_gestores')
        .select('grupo_id')
        .eq('pessoa_id', gestorPessoa.id);

      if (gruposError) throw gruposError;

      const gruposIds = (gruposGestorData || []).map(g => g.grupo_id);

      if (gruposIds.length === 0) {
        setHasAccess(false);
        return;
      }

      const { data: pessoaGrupoData, error: pessoaGrupoError } = await supabase
        .from('pessoas_grupos')
        .select('pessoa_id')
        .eq('pessoa_id', pessoaId)
        .in('grupo_id', gruposIds)
        .maybeSingle();

      if (pessoaGrupoError) throw pessoaGrupoError;

      if (!pessoaGrupoData) {
        setHasAccess(false);
        return;
      }

      setHasAccess(true);

      const { data: pessoaData, error: pessoaError } = await supabase
        .from('pessoas')
        .select('id, nome, email, funcao, avatar_url')
        .eq('id', pessoaId)
        .maybeSingle();

      if (pessoaError) throw pessoaError;

      if (!pessoaData) {
        navigate('/gestor-pessoas');
        return;
      }

      setPessoa(pessoaData);

      const { data: avaliacoesData, error: avaliacoesError } = await supabase
        .from('avaliacoes')
        .select(`
          id,
          data_avaliacao,
          status,
          psicologa:administradores!psicologa_responsavel_id (
            nome
          ),
          modelo:modelos_avaliacao (
            nome
          )
        `)
        .eq('colaborador_id', pessoaId)
        .order('data_avaliacao', { ascending: false });

      if (avaliacoesError) throw avaliacoesError;

      const formattedAvaliacoes = (avaliacoesData || []).map((item: any) => ({
        id: item.id,
        data_avaliacao: item.data_avaliacao,
        status: item.status,
        psicologa: item.psicologa ? { nome: item.psicologa.nome } : null,
        modelo: item.modelo ? { nome: item.modelo.nome } : null,
      }));

      setAvaliacoes(formattedAvaliacoes);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
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
      case 'rascunho':
        return 'Rascunho';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'concluida':
      case 'finalizada':
        return 'bg-green-100 text-green-700';
      case 'em_andamento':
        return 'bg-blue-100 text-blue-700';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-700';
      case 'rascunho':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Carregando...</p>
      </div>
    );
  }

  if (!hasAccess || !pessoa) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Você não tem acesso a esta pessoa.</p>
          <Button onClick={() => navigate('/gestor-pessoas')}>
            Voltar para Pessoas
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Button
            variant="secondary"
            onClick={() => navigate('/gestor-pessoas')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 h-16 w-16">
              {pessoa.avatar_url ? (
                <img
                  className="h-16 w-16 rounded-full object-cover"
                  src={pessoa.avatar_url}
                  alt={pessoa.nome}
                />
              ) : (
                <div className="h-16 w-16 rounded-full bg-blue-500 flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{pessoa.nome}</h1>
              <p className="text-gray-600 mt-1">{pessoa.email}</p>
              {pessoa.funcao && (
                <p className="text-sm text-gray-500 mt-1">{pessoa.funcao}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Avaliações</h2>
          </div>

          {avaliacoes.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <ClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhuma avaliação registrada para esta pessoa.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Modelo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Psicóloga
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {avaliacoes.map((avaliacao) => (
                    <tr key={avaliacao.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          {formatDate(avaliacao.data_avaliacao)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {avaliacao.modelo?.nome || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {avaliacao.psicologa?.nome || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(avaliacao.status)}`}>
                          {getStatusLabel(avaliacao.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <button
                          onClick={() => navigate(`/user-avaliacao/${avaliacao.id}`)}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
      </div>
    </div>
  );
}
