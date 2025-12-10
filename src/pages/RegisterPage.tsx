import { useState } from 'react';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { useRouter } from '../utils/router';
import { Button } from '../components/Button';

export function RegisterPage() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { navigate } = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('O registro público está desabilitado. Entre em contato com um administrador existente para criar sua conta através da página de Administradores.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden flex">
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
              Criar Nova Conta
            </h3>
            <p className="text-gray-600">Preencha os dados abaixo para se cadastrar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-blue-500 text-white p-4 rounded-t-lg">
              <h4 className="text-lg font-semibold">Cadastro</h4>
            </div>

            <div className="space-y-4 border-2 border-blue-500 border-t-0 rounded-b-lg p-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Completo
                </label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Digite seu nome completo"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                  disabled={loading || !!success}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  E-mail
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Digite seu e-mail"
                  required
                  className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                  disabled={loading || !!success}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Senha
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo de 6 caracteres"
                  required
                  minLength={6}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                  disabled={loading || !!success}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar Senha
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Digite a senha novamente"
                  required
                  minLength={6}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                  disabled={loading || !!success}
                />
              </div>


              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {success && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-600">{success}</p>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => navigate('/login')}
                  disabled={loading || !!success}
                  icon={ArrowLeft}
                >
                  Voltar
                </Button>
                <Button
                  type="submit"
                  disabled={loading || !!success}
                  className="flex-1 px-8 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full font-medium transition-colors disabled:opacity-50"
                >
                  {loading ? 'Criando conta...' : success ? 'Conta criada!' : 'Criar Conta'}
                </Button>
              </div>
            </div>
          </form>
        </div>

        <div className="hidden lg:block lg:w-1/2 bg-gradient-to-br from-cyan-400 to-blue-600 relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center p-12">
            <div className="text-center text-white space-y-6">
              <Sparkles className="w-24 h-24 mx-auto mb-6" />
              <h2 className="text-4xl font-bold">Bem-vindo!</h2>
              <p className="text-xl">Crie sua conta e comece a usar o sistema ascender online</p>
            </div>
          </div>
        </div>
      </div>

      <footer className="mt-8 text-center max-w-6xl">
        <p className="text-gray-400 text-sm font-sans mb-2">
          Você está no portal online de desenvolvimento de pessoas e gestão de times da Ascender. Chegou aqui por engano? Aproveita e vem{' '}
          <a href="#" className="text-blue-400 hover:text-blue-300 underline">conhecer um pouco mais sobre nós. Clique aqui.</a>
        </p>
        <p className="text-gray-500 text-xs font-sans">
          © Todos os Direitos Reservados 2021 | Ascender Hoje ✨
        </p>
      </footer>
    </div>
  );
}
