import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from '../utils/router';
import { supabase } from '../lib/supabase';
import { Search, TrendingUp, ListChecks } from 'lucide-react';

interface Pessoa {
  id: string;
  nome: string;
  email: string;
  funcao: string | null;
  avatar_url: string | null;
  tipo_acesso: string;
}

export function GestorPessoasPage() {
  const { pessoa } = useAuth();
  const { navigate } = useRouter();
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [filteredPessoas, setFilteredPessoas] = useState<Pessoa[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPessoas();
  }, [pessoa]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = pessoas.filter(p =>
        p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.funcao && p.funcao.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredPessoas(filtered);
    } else {
      setFilteredPessoas(pessoas);
    }
  }, [searchTerm, pessoas]);

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
        setFilteredPessoas([]);
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
            avatar_url,
            tipo_acesso
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
            tipo_acesso: item.pessoas.tipo_acesso,
          });
        }
      });

      const pessoasList = Array.from(pessoasSet.values());
      setPessoas(pessoasList);
      setFilteredPessoas(pessoasList);
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

  const getInitials = (nome: string) => {
    const names = nome.split(' ');
    if (names.length >= 2) {
      return `${names[0].charAt(0)}${names[1].charAt(0)}`.toUpperCase();
    }
    return nome.charAt(0).toUpperCase();
  };

  const getTipoAcessoLabel = (tipo: string) => {
    if (tipo === 'gestor') return 'Gestor';
    if (tipo === 'colaborador') return 'Colaborador';
    return tipo;
  };

  return (
    <div className="min-h-screen bg-ascender-neutral">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-poppins font-bold text-ascender-purple mb-6">Pessoas</h1>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por nome, e-mail ou função..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ascender-purple focus:border-transparent font-nunito"
            />
          </div>
        </div>

        {filteredPessoas.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center border border-gray-200">
            <p className="text-gray-500 font-nunito">
              {searchTerm ? 'Nenhuma pessoa encontrada com esse critério de busca.' : 'Nenhuma pessoa encontrada nos grupos que você gerencia.'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-ascender-purple text-white">
                    <th className="px-6 py-4 text-left text-sm font-poppins font-semibold">
                      Nome
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredPessoas.map((pessoaItem, index) => (
                    <tr key={pessoaItem.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex-shrink-0">
                              {pessoaItem.avatar_url ? (
                                <img
                                  className="h-12 w-12 rounded-full object-cover"
                                  src={pessoaItem.avatar_url}
                                  alt={pessoaItem.nome}
                                />
                              ) : (
                                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-ascender-yellow to-yellow-500 flex items-center justify-center shadow-md">
                                  <span className="text-white font-poppins font-bold text-sm">
                                    {getInitials(pessoaItem.nome)}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="text-base font-poppins font-semibold text-gray-900">{pessoaItem.nome}</div>
                              <div className="text-sm font-nunito text-gray-600">{getTipoAcessoLabel(pessoaItem.tipo_acesso)}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => navigate(`/gestor-pessoa/${pessoaItem.id}`)}
                              className="px-4 py-2 text-sm font-nunito text-ascender-purple hover:bg-ascender-purple-light/10 rounded-lg transition-colors"
                            >
                              Avaliações
                            </button>
                            <button
                              onClick={() => navigate(`/gestor-pessoa/${pessoaItem.id}?tab=pdi`)}
                              className="px-4 py-2 text-sm font-nunito text-ascender-purple hover:bg-ascender-purple-light/10 rounded-lg transition-colors flex items-center gap-1"
                            >
                              <TrendingUp size={16} />
                              Ver PDI
                            </button>
                            <button
                              onClick={() => navigate(`/gestor-pessoa/${pessoaItem.id}?tab=acoes`)}
                              className="px-4 py-2 text-sm font-nunito text-ascender-purple hover:bg-ascender-purple-light/10 rounded-lg transition-colors flex items-center gap-1"
                            >
                              <ListChecks size={16} />
                              Ver Ações
                            </button>
                          </div>
                        </div>
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
