import { useState } from 'react';
import { Sparkles, Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from '../utils/router';

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-ascender-yellow/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '0s' }}></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-ascender-purple/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Main content */}
      <div className="w-full max-w-md relative z-10 animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-2">
            <Sparkles className="w-10 h-10 text-ascender-yellow animate-pulse" />
            <div className="text-left">
              <h1 className="text-3xl font-bold font-poppins text-ascender-yellow">ascender</h1>
              <h2 className="text-2xl font-bold font-poppins text-white">online</h2>
            </div>
          </div>
          <p className="text-slate-300 text-sm mt-3 font-nunito">
            Desenvolvimento de pessoas e gestão de times
          </p>
        </div>

        {/* Login card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8 transition-all duration-300 hover:shadow-ascender-yellow/20">
          <div className="mb-6 text-center">
            <h3 className="text-2xl font-semibold font-poppins text-white mb-2">
              Bem-vindo de volta!
            </h3>
            <p className="text-slate-300 text-sm font-nunito">
              Entre com suas credenciais para continuar
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email input */}
            <div className="group">
              <label className="block text-sm font-medium text-slate-300 mb-2 font-nunito">
                E-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-ascender-yellow transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-ascender-yellow/50 focus:border-ascender-yellow/50 transition-all duration-300 font-nunito"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password input */}
            <div className="group">
              <label className="block text-sm font-medium text-slate-300 mb-2 font-nunito">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-ascender-yellow transition-colors" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-ascender-yellow/50 focus:border-ascender-yellow/50 transition-all duration-300 font-nunito"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl backdrop-blur-sm animate-shake">
                <p className="text-sm text-red-300 font-nunito">{error}</p>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-ascender-yellow to-ascender-yellow-dark hover:from-ascender-yellow-dark hover:to-ascender-yellow text-slate-900 font-semibold py-3.5 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-ascender-yellow/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 font-poppins"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-slate-900/20 border-t-slate-900 rounded-full animate-spin"></div>
                  Entrando...
                </>
              ) : (
                <>
                  Entrar
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Secondary actions */}
          <div className="mt-6 flex flex-col gap-3 items-center">
            <button
              onClick={() => navigate('/forgot-password')}
              disabled={loading}
              className="text-sm text-slate-300 hover:text-ascender-yellow transition-colors disabled:opacity-50 font-nunito"
            >
              Esqueceu sua senha?
            </button>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400 font-nunito">Não tem uma conta?</span>
              <button
                onClick={() => navigate('/register')}
                disabled={loading}
                className="text-sm text-ascender-yellow hover:text-ascender-yellow-dark font-semibold transition-colors disabled:opacity-50 font-nunito"
              >
                Criar conta
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-slate-400 text-xs font-nunito">
            © 2025 Ascender Hoje. Todos os direitos reservados.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0); }
          33% { transform: translate(30px, -30px); }
          66% { transform: translate(-20px, 20px); }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
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
        .animate-fade-in {
          animation: fadeIn 0.6s ease-out;
        }
        .animate-float {
          animation: float 20s ease-in-out infinite;
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}
