import { RouterProvider, Route, useRouter } from './utils/router';
import { Layout } from './components/Layout';
import { ToastProvider } from './components/Toast';
import { AuthProvider } from './contexts/AuthContext';
import { PrivateRoute } from './components/PrivateRoute';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { HomePage } from './pages/HomePage';
import { EmpresasPage } from './pages/EmpresasPage';
import { PessoasPage } from './pages/PessoasPage';
import { GruposPage } from './pages/GruposPage';
import { PerfisPage } from './pages/PerfisPage';
import { CompetenciasPage } from './pages/CompetenciasPage';
import { CompetenciaFormPage } from './pages/CompetenciaFormPage';
import { ModelosPage } from './pages/ModelosPage';
import { ModeloFormPage } from './pages/ModeloFormPage';
import { AvaliacoesPage } from './pages/AvaliacoesPage';
import { AvaliacaoFormPage } from './pages/AvaliacaoFormPage';
import { AdministradoresPage } from './pages/AdministradoresPage';
import { AdministradorFormPage } from './pages/AdministradorFormPage';
import { PlaceholderPage } from './pages/PlaceholderPage';
import { PerfilPage } from './pages/PerfilPage';

const CompetenciaFormPageWrapper = () => {
  const { params } = useRouter();
  return <CompetenciaFormPage competenciaId={params.id} />;
};

const ModeloFormPageWrapper = () => {
  const { params } = useRouter();
  return <ModeloFormPage modeloId={params.id} />;
};

const AvaliacaoFormPageWrapper = () => {
  const { params } = useRouter();
  return <AvaliacaoFormPage avaliacaoId={params.id} />;
};

const AdministradorFormPageWrapper = () => {
  const { params } = useRouter();
  return <AdministradorFormPage administradorId={params.id} />;
};

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <RouterProvider>
          <Route path="/">
            <LoginPage />
          </Route>
          <Route path="/login">
            <LoginPage />
          </Route>
          <Route path="/register">
            <RegisterPage />
          </Route>
          <Route path="/forgot-password">
            <ForgotPasswordPage />
          </Route>
          <Layout>
            <Route path="/dashboard">
              <PrivateRoute>
                <HomePage />
              </PrivateRoute>
            </Route>
            <Route path="/perfil">
              <PrivateRoute>
                <PerfilPage />
              </PrivateRoute>
            </Route>
            <Route path="/empresas">
              <PrivateRoute>
                <EmpresasPage />
              </PrivateRoute>
            </Route>
            <Route path="/pessoas">
              <PrivateRoute>
                <PessoasPage />
              </PrivateRoute>
            </Route>
            <Route path="/grupos">
              <PrivateRoute>
                <GruposPage />
              </PrivateRoute>
            </Route>
            <Route path="/perfis">
              <PrivateRoute>
                <PerfisPage />
              </PrivateRoute>
            </Route>
            <Route path="/competencias">
              <PrivateRoute>
                <CompetenciasPage />
              </PrivateRoute>
            </Route>
            <Route path="/competencias/new">
              <PrivateRoute>
                <CompetenciaFormPage />
              </PrivateRoute>
            </Route>
            <Route path="/competencias/:id/edit">
              <PrivateRoute>
                <CompetenciaFormPageWrapper />
              </PrivateRoute>
            </Route>
            <Route path="/modelos">
              <PrivateRoute>
                <ModelosPage />
              </PrivateRoute>
            </Route>
            <Route path="/modelos/new">
              <PrivateRoute>
                <ModeloFormPage />
              </PrivateRoute>
            </Route>
            <Route path="/modelos/:id/edit">
              <PrivateRoute>
                <ModeloFormPageWrapper />
              </PrivateRoute>
            </Route>
            <Route path="/avaliacoes">
              <PrivateRoute>
                <AvaliacoesPage />
              </PrivateRoute>
            </Route>
            <Route path="/avaliacoes/new">
              <PrivateRoute>
                <AvaliacaoFormPage />
              </PrivateRoute>
            </Route>
            <Route path="/avaliacoes/:id/edit">
              <PrivateRoute>
                <AvaliacaoFormPageWrapper />
              </PrivateRoute>
            </Route>
            <Route path="/pdi">
              <PrivateRoute>
                <PlaceholderPage
                  title="PDI"
                  description="Módulo de Plano de Desenvolvimento Individual em desenvolvimento"
                />
              </PrivateRoute>
            </Route>
            <Route path="/administradores">
              <PrivateRoute>
                <AdministradoresPage />
              </PrivateRoute>
            </Route>
            <Route path="/administradores/new">
              <PrivateRoute>
                <AdministradorFormPage />
              </PrivateRoute>
            </Route>
            <Route path="/administradores/:id/edit">
              <PrivateRoute>
                <AdministradorFormPageWrapper />
              </PrivateRoute>
            </Route>
          </Layout>
        </RouterProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
