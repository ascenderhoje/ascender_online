import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from '../utils/router';
import { supabase } from '../lib/supabase';
import { User, Eye } from 'lucide-react';

interface Pessoa {
  id: string;
  nome: string;
  email: string;
  funcao: string | null;
  avatar_url: string | null;
}

export function GestorPessoasPage() {
  const { pessoa } = useAuth();
  const { navigate } = useRouter();
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPessoas();
  }, [pessoa]);

  const loadPessoas = async () => {
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
        setPessoas([]);
        return;
      }

      const { data: pessoasGruposData, error: pessoasGruposError } = await supabase
        .from('pessoas_grupos')
        .select(`
          pessoa_id,
          pessoas (
            id,
            nome,
            email,
            funcao,
            avatar_url
          )
        `)
        .in('grupo_id', gruposIds);

      if (pessoasGruposError) throw pessoasGruposError;

      const pessoasSet = new Map<string, Pessoa>();
      (pessoasGruposData || []).forEach((item: any) => {
        if (item.pessoas && !pessoasSet.has(item.pessoas.id)) {
          pessoasSet.set(item.pessoas.id, {
            id: item.pessoas.id,
            nome: item.pessoas.nome,
            email: item.pessoas.email,
            funcao: item.pessoas.funcao,
            avatar_url: item.pessoas.avatar_url,
          });
        }
      });

      setPessoas(Array.from(pessoasSet.values()));
    } catch (error) {
      console.error('Erro ao carregar pessoas:', error);
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
      <div className="gradient-purple text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-4xl font-poppins font-bold">Pessoas</h1>
          <p className="text-ascender-purple-light mt-2 font-nunito text-lg">Membros da sua equipe</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {pessoas.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Nenhuma pessoa encontrada nos grupos que você gerencia.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nome
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Função
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pessoas.map((pessoa) => (
                    <tr key={pessoa.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {pessoa.avatar_url ? (
                              <img
                                className="h-10 w-10 rounded-full object-cover"
                                src={pessoa.avatar_url}
                                alt={pessoa.nome}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                                <span className="text-white font-medium text-sm">
                                  {pessoa.nome.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{pessoa.nome}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {pessoa.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {pessoa.funcao || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <button
                          onClick={() => navigate(`/gestor-pessoa/${pessoa.id}`)}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          Ver Avaliações
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
