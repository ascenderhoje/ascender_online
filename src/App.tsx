import { RouterProvider, Route } from './utils/router';
import { Layout } from './components/Layout';
import { ToastProvider } from './components/Toast';
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

function App() {
  return (
    <ToastProvider>
      <RouterProvider>
        <Layout>
        <Route path="/">
          <HomePage />
        </Route>
        <Route path="/empresas">
          <EmpresasPage />
        </Route>
        <Route path="/pessoas">
          <PessoasPage />
        </Route>
        <Route path="/grupos">
          <GruposPage />
        </Route>
        <Route path="/perfis">
          <PerfisPage />
        </Route>
        <Route path="/competencias">
          <CompetenciasPage />
        </Route>
        <Route path="/competencias/new">
          <CompetenciaFormPage />
        </Route>
        <Route path="/competencias/:id/edit">
          <CompetenciaFormPage competenciaId={window.location.pathname.split('/')[2]} />
        </Route>
        <Route path="/modelos">
          <ModelosPage />
        </Route>
        <Route path="/modelos/new">
          <ModeloFormPage />
        </Route>
        <Route path="/modelos/:id/edit">
          <ModeloFormPage modeloId={window.location.pathname.split('/')[2]} />
        </Route>
        <Route path="/avaliacoes">
          <AvaliacoesPage />
        </Route>
        <Route path="/avaliacoes/new">
          <AvaliacaoFormPage />
        </Route>
        <Route path="/avaliacoes/:id/edit">
          <AvaliacaoFormPage avaliacaoId={window.location.pathname.split('/')[2]} />
        </Route>
        <Route path="/pdi">
          <PlaceholderPage
            title="PDI"
            description="Módulo de Plano de Desenvolvimento Individual em desenvolvimento"
          />
        </Route>
        <Route path="/administradores">
          <AdministradoresPage />
        </Route>
        <Route path="/administradores/new">
          <AdministradorFormPage />
        </Route>
        <Route path="/administradores/:id/edit">
          <AdministradorFormPage administradorId={window.location.pathname.split('/')[2]} />
        </Route>
      </Layout>
    </RouterProvider>
    </ToastProvider>
  );
}

export default App;
