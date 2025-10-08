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

    const { error } = await signIn(email, password);

    if (error) {
      setError(error.message || 'Erro ao fazer login. Verifique suas credenciais.');
      setLoading(false);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
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
          <div className="bg-blue-500 text-white p-4 rounded-t-lg">
            <h4 className="text-lg font-semibold">Login</h4>
          </div>

          <div className="space-y-4 border-2 border-blue-500 border-t-0 rounded-b-lg p-6">
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="E-mail"
                required
                className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
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
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
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
                className="px-8 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full font-medium transition-colors disabled:opacity-50"
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>
            </div>
          </div>
        </form>

        <div className="mt-6">
          <button
            onClick={() => navigate('/forgot-password')}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full font-medium transition-colors"
          >
            Esqueceu a senha?
          </button>
        </div>
      </div>
    </div>
  );
}
