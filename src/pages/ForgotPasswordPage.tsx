import { useState } from 'react';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from '../utils/router';
import { Button } from '../components/Button';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();
  const { navigate } = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await resetPassword(email);

    if (error) {
      setError(error.message || 'Erro ao enviar email de recuperação.');
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-blue-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-8">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-8 h-8 text-yellow-500" />
              <div>
                <h1 className="text-2xl font-bold text-yellow-500">ascender</h1>
                <h2 className="text-2xl font-bold text-gray-800">online</h2>
              </div>
            </div>
          </div>

          {!success ? (
            <>
              <div className="mb-6">
                <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                  Recuperar Senha
                </h3>
                <p className="text-gray-600 text-sm">
                  Digite seu email e enviaremos instruções para redefinir sua senha.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
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

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="flex items-center gap-2 px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-full font-medium hover:bg-gray-50 transition-colors"
                  >
                    <ArrowLeft size={16} />
                    Voltar
                  </button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-8 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full font-medium transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Enviando...' : 'Enviar'}
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Email Enviado!
              </h3>
              <p className="text-gray-600 mb-6">
                Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full font-medium transition-colors"
              >
                Voltar ao Login
              </button>
            </div>
          )}
        </div>
      </div>

      <footer className="mt-8 text-center max-w-md">
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
