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
    <div className="min-h-screen bg-ascender-neutral flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-ascender-yellow/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '0s' }}></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-ascender-purple/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-ascender-purple-light/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Main content */}
      <div className="w-full max-w-md relative z-10 animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2.5 mb-1">
            <Sparkles className="w-8 h-8 text-ascender-yellow animate-pulse" />
            <div className="text-left">
              <h1 className="text-2xl font-bold font-poppins text-ascender-yellow leading-tight">ascender</h1>
              <h2 className="text-xl font-bold font-poppins text-gray-800 leading-tight">online</h2>
            </div>
          </div>
          <p className="text-gray-700 text-sm mt-1.5 font-nunito">
            Desenvolvimento de pessoas e gestão de times
          </p>
        </div>

        {/* Login card */}
        <div className="bg-ascender-purple/5 backdrop-blur-xl rounded-2xl shadow-2xl shadow-ascender-purple/10 border border-ascender-purple/10 p-6 transition-all duration-300 hover:shadow-ascender-purple/20">
          <div className="mb-4 text-center">
            <h3 className="text-xl font-semibold font-poppins text-ascender-purple mb-1">
              Bem-vindo de volta!
            </h3>
            <p className="text-gray-600 text-sm font-nunito">
              Entre com suas credenciais para continuar
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email input */}
            <div className="group">
              <label className="block text-sm font-medium text-gray-700 mb-1.5 font-nunito">
                E-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-ascender-purple transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="w-full pl-12 pr-4 py-3 bg-white/80 border border-ascender-purple/15 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-ascender-purple/30 focus:border-ascender-purple transition-all duration-300 font-nunito"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password input */}
            <div className="group">
              <label className="block text-sm font-medium text-gray-700 mb-1.5 font-nunito">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-ascender-purple transition-colors" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-12 pr-4 py-3 bg-white/80 border border-ascender-purple/15 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-ascender-purple/30 focus:border-ascender-purple transition-all duration-300 font-nunito"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="p-3 bg-red-50/80 border border-red-200/50 rounded-xl backdrop-blur-sm animate-shake">
                <p className="text-sm text-red-600 font-nunito">{error}</p>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-ascender-yellow to-ascender-yellow-dark hover:from-ascender-yellow-dark hover:to-ascender-yellow text-gray-900 font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-ascender-yellow/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 font-poppins"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-gray-900/20 border-t-gray-900 rounded-full animate-spin"></div>
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
          <div className="mt-4 flex flex-col gap-2 items-center">
            <button
              onClick={() => navigate('/forgot-password')}
              disabled={loading}
              className="text-sm text-gray-600 hover:text-ascender-purple transition-colors disabled:opacity-50 font-nunito"
            >
              Esqueceu sua senha?
            </button>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 font-nunito">Não tem uma conta?</span>
              <button
                onClick={() => navigate('/register')}
                disabled={loading}
                className="text-sm text-ascender-purple hover:text-ascender-purple-dark font-semibold transition-colors disabled:opacity-50 font-nunito"
              >
                Criar conta
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 text-center">
          <p className="text-gray-600 text-xs font-nunito">
            © 2025 Ascender Hoje. Todos os direitos reservados.
          </p>
          <p className="text-gray-600 text-xs font-nunito mt-2">
            Quer conhecer melhor a Ascender Hoje?
          </p>
          <a
            href="https://www.ascenderhoje.com.br/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-ascender-purple hover:text-ascender-purple-dark text-xs font-nunito transition-colors"
          >
            Clique aqui para visitar nosso site.
          </a>
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
