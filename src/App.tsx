import { RouterProvider, Route, useRouter } from './utils/router';
import { Layout } from './components/Layout';
import { UserLayout } from './components/UserLayout';
import { ToastProvider } from './components/Toast';
import { AuthProvider } from './contexts/AuthContext';
import { PrivateRoute } from './components/PrivateRoute';
import { AdminRoute } from './components/AdminRoute';
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
import { UserDashboardPage } from './pages/UserDashboardPage';

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
          <Route path="/login">
            <LoginPage />
          </Route>
          <Route path="/register">
            <RegisterPage />
          </Route>
          <Route path="/forgot-password">
            <ForgotPasswordPage />
          </Route>

          <Route path="/user-dashboard">
            <PrivateRoute>
              <UserLayout>
                <UserDashboardPage />
              </UserLayout>
            </PrivateRoute>
          </Route>

          <Layout>
            <Route path="/">
              <AdminRoute>
                <HomePage />
              </AdminRoute>
            </Route>
            <Route path="/dashboard">
              <AdminRoute>
                <HomePage />
              </AdminRoute>
            </Route>
            <Route path="/perfil">
              <AdminRoute>
                <PerfilPage />
              </AdminRoute>
            </Route>
            <Route path="/empresas">
              <AdminRoute>
                <EmpresasPage />
              </AdminRoute>
            </Route>
            <Route path="/pessoas">
              <AdminRoute>
                <PessoasPage />
              </AdminRoute>
            </Route>
            <Route path="/grupos">
              <AdminRoute>
                <GruposPage />
              </AdminRoute>
            </Route>
            <Route path="/perfis">
              <AdminRoute>
                <PerfisPage />
              </AdminRoute>
            </Route>
            <Route path="/competencias">
              <AdminRoute>
                <CompetenciasPage />
              </AdminRoute>
            </Route>
            <Route path="/competencias/new">
              <AdminRoute>
                <CompetenciaFormPage />
              </AdminRoute>
            </Route>
            <Route path="/competencias/:id/edit">
              <AdminRoute>
                <CompetenciaFormPageWrapper />
              </AdminRoute>
            </Route>
            <Route path="/modelos">
              <AdminRoute>
                <ModelosPage />
              </AdminRoute>
            </Route>
            <Route path="/modelos/new">
              <AdminRoute>
                <ModeloFormPage />
              </AdminRoute>
            </Route>
            <Route path="/modelos/:id/edit">
              <AdminRoute>
                <ModeloFormPageWrapper />
              </AdminRoute>
            </Route>
            <Route path="/avaliacoes">
              <AdminRoute>
                <AvaliacoesPage />
              </AdminRoute>
            </Route>
            <Route path="/avaliacoes/new">
              <AdminRoute>
                <AvaliacaoFormPage />
              </AdminRoute>
            </Route>
            <Route path="/avaliacoes/:id/edit">
              <AdminRoute>
                <AvaliacaoFormPageWrapper />
              </AdminRoute>
            </Route>
            <Route path="/pdi">
              <AdminRoute>
                <PlaceholderPage
                  title="PDI"
                  description="Módulo de Plano de Desenvolvimento Individual em desenvolvimento"
                />
              </AdminRoute>
            </Route>
            <Route path="/administradores">
              <AdminRoute>
                <AdministradoresPage />
              </AdminRoute>
            </Route>
            <Route path="/administradores/new">
              <AdminRoute>
                <AdministradorFormPage />
              </AdminRoute>
            </Route>
            <Route path="/administradores/:id/edit">
              <AdminRoute>
                <AdministradorFormPageWrapper />
              </AdminRoute>
            </Route>
          </Layout>
        </RouterProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
