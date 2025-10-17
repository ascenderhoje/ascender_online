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
  const { signIn, userType } = useAuth();
  const { navigate } = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: signInError } = await signIn(email, password);

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
      setTimeout(() => {
        if (userType === 'admin') {
          const redirectTo = sessionStorage.getItem('redirectAfterLogin') || '/dashboard';
          sessionStorage.removeItem('redirectAfterLogin');
          navigate(redirectTo);
        } else if (userType === 'pessoa') {
          navigate('/user-dashboard');
        }
      }, 100);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-blue-900 flex items-center justify-center p-4">
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

          <div className="mt-6 flex gap-3">
            <button
              onClick={() => navigate('/register')}
              disabled={loading}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-full font-medium transition-colors disabled:opacity-50"
            >
              Criar Conta
            </button>
            <button
              onClick={() => navigate('/forgot-password')}
              disabled={loading}
              className="px-6 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-full font-medium transition-colors disabled:opacity-50"
            >
              Esqueceu a senha?
            </button>
          </div>
        </div>

        <div className="hidden lg:block lg:w-1/2 bg-gradient-to-br from-blue-400 to-blue-600 relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center p-12">
            <svg
              viewBox="0 0 400 400"
              className="w-full h-full"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <pattern
                  id="grid"
                  width="40"
                  height="40"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 40 0 L 0 0 0 40"
                    fill="none"
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="1"
                  />
                </pattern>
              </defs>

              <rect width="400" height="400" fill="url(#grid)" />

              <g className="animate-[float_6s_ease-in-out_infinite]">
                <circle cx="100" cy="80" r="30" fill="rgba(255,255,255,0.2)" />
                <circle cx="100" cy="60" r="20" fill="rgba(59,130,246,0.6)" />
                <circle cx="90" cy="55" r="3" fill="white" />
                <circle cx="110" cy="55" r="3" fill="white" />
                <path d="M 85 70 Q 100 75 115 70" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
              </g>

              <g className="animate-[float_7s_ease-in-out_infinite_1s]">
                <circle cx="300" cy="100" r="35" fill="rgba(255,255,255,0.2)" />
                <ellipse cx="300" cy="95" rx="25" ry="30" fill="rgba(59,130,246,0.6)" />
                <circle cx="290" cy="90" r="3" fill="white" />
                <circle cx="310" cy="90" r="3" fill="white" />
                <path d="M 285 105 Q 300 110 315 105" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
              </g>

              <g className="animate-[float_8s_ease-in-out_infinite_2s]">
                <circle cx="200" cy="200" r="40" fill="rgba(255,255,255,0.2)" />
                <circle cx="200" cy="185" r="25" fill="rgba(59,130,246,0.6)" />
                <circle cx="188" cy="180" r="4" fill="white" />
                <circle cx="212" cy="180" r="4" fill="white" />
                <path d="M 185 200 Q 200 205 215 200" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
              </g>

              <g className="animate-[float_7.5s_ease-in-out_infinite_1.5s]">
                <circle cx="320" cy="280" r="32" fill="rgba(255,255,255,0.2)" />
                <circle cx="320" cy="270" r="22" fill="rgba(59,130,246,0.6)" />
                <circle cx="310" cy="265" r="3" fill="white" />
                <circle cx="330" cy="265" r="3" fill="white" />
                <path d="M 305 280 Q 320 285 335 280" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
              </g>

              <g className="animate-[float_6.5s_ease-in-out_infinite_0.5s]">
                <circle cx="80" cy="300" r="28" fill="rgba(255,255,255,0.2)" />
                <circle cx="80" cy="290" r="20" fill="rgba(59,130,246,0.6)" />
                <circle cx="72" cy="286" r="2.5" fill="white" />
                <circle cx="88" cy="286" r="2.5" fill="white" />
                <path d="M 68 300 Q 80 304 92 300" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
              </g>
            </svg>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  );
}
