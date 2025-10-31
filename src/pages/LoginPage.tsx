import { useState } from 'react';
import { Sparkles, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from '../utils/router';
import { Button } from '../components/Button';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-ascender-neutral-light flex items-center justify-center p-4 animate-fadeIn">
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-xl overflow-hidden flex animate-slideUp">
        <div className="w-full lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-ascender-yellow rounded-full p-2">
                <Sparkles className="w-8 h-8 text-ascender-purple" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-ascender-yellow font-poppins">ascender</h1>
                <h2 className="text-2xl font-bold text-ascender-purple font-poppins">online</h2>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-4xl font-bold text-gray-800 mb-3 font-poppins leading-tight">
              Que bom ter você
              <br />
              <span className="text-ascender-purple">com a gente</span>
            </h3>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-ascender-yellow" />
              <p className="text-gray-600 font-nunito">Faça login para continuar</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="bg-gradient-to-r from-ascender-purple to-ascender-purple-dark text-white p-5 rounded-t-2xl shadow-md">
              <h4 className="text-xl font-semibold font-poppins">Login</h4>
            </div>

            <div className="space-y-5 border-2 border-ascender-purple/20 border-t-0 rounded-b-2xl p-8 bg-white shadow-sm">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-nunito">E-mail</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-ascender-purple focus:ring-2 focus:ring-ascender-purple/20 transition-all duration-200 font-nunito"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-nunito">Senha</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Digite sua senha"
                    required
                    className="w-full px-4 py-3.5 pr-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-ascender-purple focus:ring-2 focus:ring-ascender-purple/20 transition-all duration-200 font-nunito"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-ascender-purple transition-colors"
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg animate-shake">
                  <p className="text-sm text-red-700 font-nunito">{error}</p>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-10 py-3.5 bg-gradient-to-r from-ascender-purple to-ascender-purple-dark hover:shadow-lg hover:scale-105 text-white rounded-full font-semibold transition-all duration-200 disabled:opacity-50 disabled:hover:scale-100 font-poppins"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Entrando...
                    </span>
                  ) : 'Entrar'}
                </button>
              </div>
            </div>
          </form>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate('/register')}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-ascender-yellow hover:bg-ascender-yellow-dark hover:shadow-md text-ascender-purple-dark rounded-full font-semibold transition-all duration-200 disabled:opacity-50 font-poppins"
            >
              Criar Conta
            </button>
            <button
              onClick={() => navigate('/forgot-password')}
              disabled={loading}
              className="flex-1 px-6 py-3 border-2 border-ascender-purple text-ascender-purple hover:bg-ascender-purple hover:text-white rounded-full font-semibold transition-all duration-200 disabled:opacity-50 font-poppins"
            >
              Esqueceu a senha?
            </button>
          </div>
        </div>

        <div className="hidden lg:block lg:w-1/2 bg-gradient-to-br from-ascender-purple to-ascender-purple-dark relative overflow-hidden">
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
                <circle cx="100" cy="60" r="20" fill="rgba(255,199,0,0.6)" />
                <circle cx="90" cy="55" r="3" fill="white" />
                <circle cx="110" cy="55" r="3" fill="white" />
                <path d="M 85 70 Q 100 75 115 70" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
              </g>

              <g className="animate-[float_7s_ease-in-out_infinite_1s]">
                <circle cx="300" cy="100" r="35" fill="rgba(255,255,255,0.2)" />
                <ellipse cx="300" cy="95" rx="25" ry="30" fill="rgba(200,168,233,0.6)" />
                <circle cx="290" cy="90" r="3" fill="white" />
                <circle cx="310" cy="90" r="3" fill="white" />
                <path d="M 285 105 Q 300 110 315 105" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
              </g>

              <g className="animate-[float_8s_ease-in-out_infinite_2s]">
                <circle cx="200" cy="200" r="40" fill="rgba(255,255,255,0.2)" />
                <circle cx="200" cy="185" r="25" fill="rgba(255,199,0,0.6)" />
                <circle cx="188" cy="180" r="4" fill="white" />
                <circle cx="212" cy="180" r="4" fill="white" />
                <path d="M 185 200 Q 200 205 215 200" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
              </g>

              <g className="animate-[float_7.5s_ease-in-out_infinite_1.5s]">
                <circle cx="320" cy="280" r="32" fill="rgba(255,255,255,0.2)" />
                <circle cx="320" cy="270" r="22" fill="rgba(200,168,233,0.6)" />
                <circle cx="310" cy="265" r="3" fill="white" />
                <circle cx="330" cy="265" r="3" fill="white" />
                <path d="M 305 280 Q 320 285 335 280" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
              </g>

              <g className="animate-[float_6.5s_ease-in-out_infinite_0.5s]">
                <circle cx="80" cy="300" r="28" fill="rgba(255,255,255,0.2)" />
                <circle cx="80" cy="290" r="20" fill="rgba(255,199,0,0.6)" />
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
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.6s ease-out;
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}
