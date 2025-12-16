import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from '../utils/router';
import { Button } from '../components/Button';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const { navigate } = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: signInError, userType: authenticatedUserType, pessoa: pessoaData } = await signIn(email, password);

    if (signInError) {
      if (signInError.message.includes('Invalid login credentials')) {
        setError('Email ou senha incorretos. Tente novamente.');
      } else if (signInError.message.includes('não encontrado ou inativo')) {
        setError('Acesso negado. Usuário não encontrado ou inativo.');
      } else {
        setError(signInError.message || 'Erro ao fazer login. Tente novamente.');
      }
      setLoading(false);
    } else {
      if (authenticatedUserType === 'admin') {
        const redirectTo = sessionStorage.getItem('redirectAfterLogin') || '/dashboard';
        sessionStorage.removeItem('redirectAfterLogin');
        navigate(redirectTo);
      } else if (authenticatedUserType === 'pessoa') {
        if (pessoaData?.tipo_acesso === 'gestor') {
          navigate('/gestor-dashboard');
        } else {
          navigate('/user-dashboard');
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-blue-900 flex flex-col items-center justify-center p-6 lg:p-8">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex">
        <div className="w-full lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-8 h-8 text-yellow-500" />
              <div>
                <h1 className="text-2xl font-bold text-yellow-500">ascender</h1>
                <h2 className="text-2xl font-bold text-gray-800">online</h2>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-3xl font-semibold text-gray-800 mb-1">
              Que bom ter você com a gente
            </h3>
            <Sparkles className="w-6 h-6 text-yellow-500" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-ascender-purple text-white p-4 rounded-t-lg">
              <h4 className="text-lg font-semibold">Login</h4>
            </div>

            <div className="space-y-4 border-2 border-ascender-purple border-t-0 rounded-b-lg p-6">
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="E-mail"
                  required
                  className="w-full px-4 py-3 border-2 border-ascender-purple-light rounded-lg focus:outline-none focus:border-ascender-purple transition-colors"
                  disabled={loading}
                />
              </div>

              <div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Senha"
                  required
                  className="w-full px-4 py-3 border-2 border-ascender-purple-light rounded-lg focus:outline-none focus:border-ascender-purple transition-colors"
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-2 bg-ascender-purple hover:bg-ascender-purple-dark text-white rounded-full font-medium transition-colors disabled:opacity-50"
                >
                  {loading ? 'Entrando...' : 'Entrar'}
                </Button>
              </div>
            </div>
          </form>

          <div className="mt-6 flex gap-3">
            <button
              onClick={() => navigate('/register')}
              disabled={loading}
              className="px-6 py-2 bg-ascender-yellow hover:bg-ascender-yellow-dark text-ascender-purple-dark rounded-full font-medium transition-colors disabled:opacity-50"
            >
              Criar Conta
            </button>
            <button
              onClick={() => navigate('/forgot-password')}
              disabled={loading}
              className="px-6 py-2 bg-ascender-purple-dark hover:bg-ascender-purple text-white rounded-full font-medium transition-colors disabled:opacity-50"
            >
              Esqueceu a senha?
            </button>
          </div>
        </div>

        <div className="hidden lg:block lg:w-1/2 bg-gradient-to-br from-ascender-purple to-ascender-purple-dark relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center p-12">
            <img
              src="/whatsapp_image_2025-12-09_at_15.57.40.jpeg"
              alt="Ascender Brand"
              className="max-w-full max-h-full object-contain animate-fade-in"
            />
          </div>
        </div>
      </div>

      <footer className="mt-8 text-center max-w-4xl">
        <p className="text-gray-400 text-sm font-sans mb-2">
          Você está no portal online de desenvolvimento de pessoas e gestão de times da Ascender. Chegou aqui por engano? Aproveita e vem{' '}
          <a href="https://www.ascenderhoje.com.br/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">conhecer um pouco mais sobre nós. Clique aqui.</a>
        </p>
        <p className="text-gray-500 text-xs font-sans">
          © Todos os Direitos Reservados 2021 | Ascender Hoje ✨
        </p>
      </footer>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fadeIn 0.8s ease-in;
        }
      `}</style>
    </div>
  );
}
