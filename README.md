# Ascender RH

Sistema completo de gestão de recursos humanos para avaliação de competências, gerenciamento de pessoas e desenvolvimento organizacional.

## Sobre o Sistema

**Ascender RH** é uma plataforma web moderna desenvolvida para facilitar a gestão de recursos humanos em empresas de todos os tamanhos. O sistema oferece ferramentas completas para:

- **Gestão de Empresas**: Cadastro e gerenciamento de múltiplas empresas
- **Gestão de Pessoas**: Controle completo de colaboradores com histórico e informações detalhadas
- **Grupos Organizacionais**: Organização de equipes e departamentos
- **Perfis Comportamentais**: Definição e aplicação de perfis para avaliações
- **Competências**: Biblioteca de competências técnicas e comportamentais customizáveis
- **Modelos de Avaliação**: Criação de modelos personalizados com critérios e perguntas
- **Avaliações 360°**: Processo completo de avaliação de desempenho
- **PDI (Plano de Desenvolvimento Individual)**: Acompanhamento e planejamento de desenvolvimento profissional
- **Gestão de Administradores**: Controle de acesso e permissões
- **Portal do Colaborador**: Interface dedicada para colaboradores visualizarem suas avaliações
- **Portal do Gestor**: Dashboard para gestores acompanharem suas equipes

## Tecnologias Utilizadas

### Frontend
- **React 18** - Biblioteca JavaScript para interfaces de usuário
- **TypeScript** - Superset JavaScript com tipagem estática
- **Vite** - Build tool e dev server ultrarrápido
- **Tailwind CSS** - Framework CSS utility-first para estilização
- **Lucide React** - Biblioteca de ícones moderna e consistente

### Backend & Banco de Dados
- **Supabase** - Plataforma completa de backend (PostgreSQL, Auth, Storage, Edge Functions)
- **PostgreSQL** - Banco de dados relacional robusto
- **Row Level Security (RLS)** - Segurança nativa no banco de dados
- **Supabase Auth** - Sistema de autenticação com email/senha

### Arquitetura
- **Single Page Application (SPA)** - Navegação rápida sem recarregamento de página
- **Client-side Routing** - Roteamento customizado e otimizado
- **Context API** - Gerenciamento de estado global
- **Componentização** - Arquitetura modular e reutilizável
- **Multi-tenant** - Suporte para múltiplas empresas com isolamento de dados

## Estrutura do Projeto

```
ascender-rh/
├── src/
│   ├── components/          # Componentes reutilizáveis
│   │   ├── AdminRoute.tsx       # Proteção de rotas administrativas
│   │   ├── Button.tsx           # Botão reutilizável
│   │   ├── ConfirmModal.tsx     # Modal de confirmação
│   │   ├── CriterioItem.tsx     # Item de critério de avaliação
│   │   ├── Header.tsx           # Cabeçalho do sistema
│   │   ├── Layout.tsx           # Layout administrativo
│   │   ├── Modal.tsx            # Modal genérico
│   │   ├── PerguntaPersonalizadaItem.tsx  # Item de pergunta customizada
│   │   ├── PrivateRoute.tsx     # Proteção de rotas autenticadas
│   │   ├── RichTextEditor.tsx   # Editor de texto rico
│   │   ├── Sidebar.tsx          # Menu lateral administrativo
│   │   ├── Table.tsx            # Tabela reutilizável
│   │   ├── Toast.tsx            # Notificações toast
│   │   ├── UserLayout.tsx       # Layout para colaboradores/gestores
│   │   ├── UserSidebar.tsx      # Menu lateral para usuários
│   │   └── Forms/               # Formulários específicos
│   │       ├── EmpresaForm.tsx
│   │       ├── GrupoForm.tsx
│   │       └── PessoaForm.tsx
│   │
│   ├── contexts/            # Context API para estado global
│   │   └── AuthContext.tsx      # Contexto de autenticação
│   │
│   ├── lib/                 # Configurações de bibliotecas
│   │   └── supabase.ts          # Cliente Supabase
│   │
│   ├── pages/               # Páginas da aplicação
│   │   ├── AdministradorFormPage.tsx    # Formulário de administradores
│   │   ├── AdministradoresPage.tsx      # Lista de administradores
│   │   ├── AvaliacaoFormPage.tsx        # Formulário de avaliação
│   │   ├── AvaliacoesPage.tsx           # Lista de avaliações
│   │   ├── CompetenciaFormPage.tsx      # Formulário de competências
│   │   ├── CompetenciasPage.tsx         # Lista de competências
│   │   ├── EmpresasPage.tsx             # Lista de empresas
│   │   ├── ForgotPasswordPage.tsx       # Recuperação de senha
│   │   ├── GestorAvaliacoesPage.tsx     # Avaliações (visão gestor)
│   │   ├── GestorDashboardPage.tsx      # Dashboard do gestor
│   │   ├── GestorPessoaDetailPage.tsx   # Detalhes da pessoa (gestor)
│   │   ├── GestorPessoasPage.tsx        # Lista de pessoas (gestor)
│   │   ├── GruposPage.tsx               # Lista de grupos
│   │   ├── HomePage.tsx                 # Dashboard administrativo
│   │   ├── LoginPage.tsx                # Página de login
│   │   ├── ModeloFormPage.tsx           # Formulário de modelos
│   │   ├── ModelosPage.tsx              # Lista de modelos
│   │   ├── PerfilPage.tsx               # Perfil do usuário
│   │   ├── PerfisPage.tsx               # Lista de perfis comportamentais
│   │   ├── PessoasPage.tsx              # Lista de pessoas
│   │   ├── PlaceholderPage.tsx          # Página placeholder
│   │   ├── RegisterPage.tsx             # Página de registro
│   │   ├── UserAvaliacaoViewPage.tsx    # Visualização de avaliação (colaborador)
│   │   └── UserDashboardPage.tsx        # Dashboard do colaborador
│   │
│   ├── types/               # Definições TypeScript
│   │   └── index.ts
│   │
│   ├── utils/               # Utilitários
│   │   └── router.tsx           # Sistema de roteamento customizado
│   │
│   ├── App.tsx              # Componente raiz
│   ├── main.tsx             # Entry point
│   └── index.css            # Estilos globais
│
├── supabase/
│   ├── functions/           # Edge Functions (serverless)
│   │   ├── admin-users/         # Gerenciamento de usuários admin
│   │   └── user-management/     # Gerenciamento de usuários
│   └── migrations/          # Migrações do banco de dados
│
├── .env                     # Variáveis de ambiente
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** (versão 18 ou superior) - [Download](https://nodejs.org/)
- **npm** (geralmente vem com o Node.js)
- **Git** (opcional, para clonar o repositório)

## Instalação

### 1. Clone o Repositório

```bash
git clone <url-do-repositorio>
cd ascender-rh
```

### 2. Instale as Dependências

```bash
npm install
```

### 3. Configure as Variáveis de Ambiente

O arquivo `.env` já está configurado com as credenciais do Supabase:

```env
VITE_SUPABASE_URL=https://futvtqpggmscnnokqjda.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Nota**: Em produção, use suas próprias credenciais do Supabase.

### 4. Execute o Servidor de Desenvolvimento

```bash
npm run dev
```

O aplicativo estará disponível em: `http://localhost:5173`

### 5. Build para Produção

Para criar uma versão otimizada para produção:

```bash
npm run build
```

Os arquivos otimizados serão gerados na pasta `dist/`.

### 6. Preview da Build de Produção

Para testar a build de produção localmente:

```bash
npm run preview
```

## Scripts Disponíveis

```bash
npm run dev        # Inicia o servidor de desenvolvimento
npm run build      # Cria a build de produção
npm run preview    # Preview da build de produção
npm run lint       # Executa o linter (ESLint)
npm run typecheck  # Verifica erros de tipo TypeScript
```

## Banco de Dados

### Estrutura Principal

O sistema utiliza PostgreSQL via Supabase com as seguintes tabelas principais:

#### Tabelas de Cadastro
- **empresas** - Dados das empresas clientes
- **pessoas** - Colaboradores e funcionários (com campo `auth_user_id` para integração com Supabase Auth)
- **grupos** - Equipes e departamentos
- **grupos_gestores** - Gestores responsáveis por grupos
- **pessoas_grupos** - Relacionamento pessoas ↔ grupos

#### Tabelas de Avaliação
- **perfis** - Perfis comportamentais
- **competencias** - Competências técnicas e comportamentais
- **modelos_avaliacao** - Templates de avaliação
- **criterios_avaliacao** - Critérios dos modelos
- **perguntas_personalizadas** - Perguntas customizadas
- **avaliacoes** - Processos de avaliação
- **respostas_avaliacoes** - Respostas das avaliações
- **textos_avaliacoes** - Textos descritivos e feedback

#### Tabelas de Administração
- **administradores** - Usuários do sistema com permissões (com campo `auth_user_id`)

### Segurança (Row Level Security)

Todas as tabelas possuem políticas RLS (Row Level Security) configuradas para garantir que:

#### Para Administradores
- Acesso completo aos dados através das policies
- Verificação via `get_admin_user_id_from_auth()` que valida se o usuário autenticado é um administrador

#### Para Colaboradores
- Acesso apenas às suas próprias avaliações finalizadas
- Verificação via `get_pessoa_id_from_auth()` que mapeia o `auth.uid()` para o ID da pessoa
- Políticas específicas:
  - **avaliacoes**: `"Employees can read own finalized evaluations"` - permite leitura de avaliações finalizadas onde `colaborador_id = get_pessoa_id_from_auth()`
  - **competencias_avaliacoes**: Acesso às competências das avaliações do colaborador
  - **criterios_avaliacoes**: Acesso aos critérios das competências das avaliações do colaborador
  - **respostas_avaliacoes**: Acesso às respostas das avaliações do colaborador
  - **textos_avaliacoes**: Acesso aos textos das avaliações do colaborador

#### Para Gestores
- Acesso aos dados das pessoas do seu grupo
- Acesso às avaliações dos membros da equipe
- Verificação de vínculo através da tabela `grupos_gestores`

### Funções Helper

O sistema utiliza funções PostgreSQL para facilitar as verificações de segurança:

- **get_pessoa_id_from_auth()** - Retorna o ID da pessoa baseado no `auth.uid()` do usuário autenticado
- **get_admin_user_id_from_auth()** - Retorna o ID do administrador baseado no `auth.uid()` do usuário autenticado

### Migrações

As migrações do banco de dados estão organizadas em:
```
supabase/migrations/
├── 20251003135425_remove_pessoas_auth_constraint.sql
├── 20251003135652_allow_public_access_development.sql
├── 20251003142128_create_competencias_modelos_schema.sql
├── 20251003143716_update_perguntas_personalizadas_structure.sql
├── 20251003144102_make_tipo_resposta_optional.sql
├── 20251003144137_make_titulo_descricao_optional.sql
├── 20251003144357_create_avaliacoes_administradores_schema.sql
├── 20251003150506_create_grupos_gestores_table.sql
├── 20251003150852_fix_grupos_gestores_rls_policies.sql
├── 20251003150906_fix_pessoas_grupos_rls_policies.sql
├── 20251007191220_add_empresa_id_to_grupos.sql
├── 20251008125639_create_avaliacoes_responses_schema.sql
├── 20251008131026_add_avaliacoes_basic_fields.sql
├── 20251008132103_add_editing_lock_to_avaliacoes.sql
├── 20251008132805_fix_avaliacoes_editing_constraint_name.sql
├── 20251008135843_setup_auth_integration.sql
├── 20251008140000_setup_auth_integration.sql
├── 20251008140100_update_rls_policies_for_auth.sql
├── 20251008142530_create_auth_user_helper_function.sql
├── 20251010174928_update_avaliacoes_status_constraint.sql
├── 20251010181119_fix_avaliacoes_editing_user_reference.sql
├── 20251017132112_add_auth_to_pessoas.sql
└── 20251020122204_add_employee_evaluation_access_policies.sql
```

## Rotas e Navegação

O sistema possui três tipos principais de rotas:

### Rotas Públicas (Sem Autenticação)
- `/login` - Página de login
- `/register` - Registro de novos usuários
- `/forgot-password` - Recuperação de senha

### Rotas de Colaborador (Requer Autenticação)
- `/user-dashboard` - Dashboard do colaborador com avaliações disponíveis
- `/user-avaliacao/:id` - Visualização detalhada de uma avaliação finalizada

### Rotas de Gestor (Requer Autenticação + Permissão de Gestor)
- `/gestor-dashboard` - Dashboard do gestor com visão geral da equipe
- `/gestor-pessoas` - Lista de pessoas da equipe do gestor
- `/gestor-pessoa/:id` - Detalhes de uma pessoa específica
- `/gestor-avaliacoes` - Avaliações da equipe

### Rotas Administrativas (Requer Autenticação + Permissão de Admin)
- `/` ou `/dashboard` - Dashboard administrativo com estatísticas gerais
- `/perfil` - Perfil do usuário logado
- `/empresas` - Gestão de empresas
- `/pessoas` - Gestão de pessoas/colaboradores
- `/grupos` - Gestão de grupos e departamentos
- `/perfis` - Gestão de perfis comportamentais
- `/competencias` - Gestão de competências
- `/competencias/new` - Criar nova competência
- `/competencias/:id` - Editar competência existente
- `/modelos` - Gestão de modelos de avaliação
- `/modelos/new` - Criar novo modelo
- `/modelos/:id` - Editar modelo existente
- `/avaliacoes` - Gestão de avaliações
- `/avaliacoes/new` - Criar nova avaliação
- `/avaliacoes/:id` - Editar avaliação existente
- `/pdi` - Planos de Desenvolvimento Individual (placeholder)
- `/administradores` - Gestão de administradores
- `/administradores/new` - Criar novo administrador
- `/administradores/:id` - Editar administrador existente

## Funcionalidades Principais

### 1. Dashboard Administrativo
- Visão geral com estatísticas de empresas, pessoas, grupos e avaliações
- Cards informativos com contadores em tempo real
- Atividades recentes
- Ações rápidas para cadastros
- Navegação intuitiva para todas as seções

### 2. Sistema de Autenticação
- Login com email e senha via Supabase Auth
- Registro de novos usuários
- Recuperação de senha
- Sessões persistentes
- Proteção de rotas por permissão (Admin, Gestor, Colaborador)
- Logout seguro

### 3. Gestão de Empresas
- Cadastro completo de empresas clientes
- CNPJ, razão social, nome fantasia
- Endereço completo e contatos
- Status ativo/inativo
- Listagem com pesquisa e filtros
- Edição e exclusão de registros

### 4. Gestão de Pessoas
- Cadastro detalhado de colaboradores
- CPF, data de nascimento, foto
- Vinculação com empresa e grupos
- Histórico e informações profissionais
- Integração com sistema de autenticação
- Associação de usuário auth com pessoa
- Listagem com pesquisa e filtros

### 5. Grupos e Departamentos
- Criação de equipes e departamentos
- Associação de pessoas aos grupos
- Definição de gestores por grupo
- Vinculação com empresas
- Hierarquia organizacional
- Gestão de membros

### 6. Perfis Comportamentais
- Criação de perfis personalizados
- Descrição de características
- Aplicação em avaliações
- Reutilização em múltiplos contextos

### 7. Competências
- Biblioteca de competências técnicas e comportamentais
- Descrições detalhadas com rich text editor
- Níveis de proficiência
- Reutilização em múltiplos modelos
- Criação e edição com interface intuitiva
- Critérios de avaliação personalizados

### 8. Modelos de Avaliação
- Templates personalizados de avaliação
- Seleção de competências da biblioteca
- Critérios de avaliação com escalas customizadas
- Perguntas personalizadas (múltipla escolha, texto livre, escala Likert)
- Vinculação com competências
- Editor visual com prévia
- Clonagem de modelos existentes

### 9. Avaliações 360°
- Criação de processos de avaliação baseados em modelos
- Seleção de colaborador a ser avaliado
- Definição de psicóloga responsável
- Aplicação de modelos pré-configurados
- Coleta estruturada de respostas
- Sistema de bloqueio para edições concorrentes
- Status de avaliação (rascunho, em_andamento, finalizada)
- Observações e feedbacks

### 10. Portal do Colaborador
- **Dashboard do Colaborador** (`/user-dashboard`)
  - Visualização de todas as avaliações finalizadas
  - Cards com informações da avaliação
  - Data de realização
  - Psicóloga responsável
  - Botão para visualizar detalhes
  - Interface limpa e focada

- **Visualização de Avaliação** (`/user-avaliacao/:id`)
  - Acesso apenas às avaliações finalizadas do próprio colaborador
  - Visualização completa de competências avaliadas
  - Critérios e pontuações recebidas
  - Respostas a perguntas personalizadas
  - Feedback da psicóloga
  - Observações gerais
  - Impossibilidade de edição (somente leitura)
  - Segurança garantida por RLS policies

### 11. Portal do Gestor
- **Dashboard do Gestor** (`/gestor-dashboard`)
  - Visão geral da equipe
  - Estatísticas de desempenho
  - Avaliações pendentes e finalizadas
  - Acesso rápido aos membros da equipe

- **Gestão de Pessoas** (`/gestor-pessoas`)
  - Lista de todos os membros da equipe do gestor
  - Informações básicas de cada pessoa
  - Acesso aos detalhes individuais
  - Histórico de avaliações

- **Detalhes da Pessoa** (`/gestor-pessoa/:id`)
  - Informações completas do colaborador
  - Histórico de avaliações
  - PDI (Plano de Desenvolvimento Individual)
  - Competências desenvolvidas

- **Avaliações da Equipe** (`/gestor-avaliacoes`)
  - Todas as avaliações da equipe
  - Filtros por período e status
  - Comparativos de desempenho
  - Análises de desenvolvimento

### 12. Administradores
- Gestão de usuários do sistema
- Permissões diferenciadas (administrador, psicóloga)
- Controle de acesso por tipo
- Vinculação com Supabase Auth
- Criação via Edge Function para segurança
- Listagem e edição de administradores

## Segurança e Controle de Acesso

### Níveis de Permissão

1. **Administrador**
   - Acesso total ao sistema
   - Gestão de empresas, pessoas, grupos
   - Criação de modelos e avaliações
   - Gestão de outros administradores
   - Acesso a relatórios e estatísticas

2. **Gestor**
   - Acesso aos dados da sua equipe
   - Visualização de avaliações dos membros
   - Acompanhamento de desenvolvimento
   - Sem permissão para editar modelos ou competências

3. **Colaborador**
   - Acesso apenas às próprias avaliações finalizadas
   - Visualização em modo somente leitura
   - Dashboard pessoal simplificado
   - Sem acesso a dados de outros colaboradores

### Proteção de Rotas

- **PrivateRoute**: Verifica apenas se o usuário está autenticado
- **AdminRoute**: Verifica autenticação + permissão de administrador
- Redirecionamento automático para login se não autenticado
- Redirecionamento para dashboard apropriado baseado em permissão

### Row Level Security (RLS)

Todas as operações no banco são protegidas por policies RLS que:
- Validam o usuário autenticado via `auth.uid()`
- Verificam permissões através de funções helper
- Isolam dados por empresa (multi-tenant)
- Impedem acesso não autorizado mesmo com SQL direto
- Garantem que colaboradores só vejam suas próprias avaliações

## Acesso ao Sistema

### Login como Administrador

Para acessar o sistema como administrador:
1. Acesse `/login`
2. Use as credenciais de um administrador cadastrado
3. Será redirecionado para `/dashboard`

### Login como Colaborador

Para acessar como colaborador:
1. Acesse `/login`
2. Use as credenciais vinculadas à pessoa
3. Será redirecionado para `/user-dashboard`

### Primeiro Acesso

No primeiro acesso, é necessário:
1. Ter um administrador cadastrado via Edge Function
2. Criar empresas e pessoas
3. Vincular auth_user_id às pessoas para acesso de colaborador
4. Finalizar avaliações para visualização no portal do colaborador

## Desenvolvimento

### Padrões de Código

- **Componentes**: Use PascalCase para componentes React
- **Arquivos**: Use PascalCase para arquivos de componentes (.tsx)
- **Funções**: Use camelCase para funções e métodos
- **Constantes**: Use UPPER_SNAKE_CASE para constantes
- **TypeScript**: Sempre defina tipos explícitos
- **ESLint**: Execute `npm run lint` antes de commit

### Convenções de Componentes

```typescript
interface ComponentProps {
  title: string;
  onAction: () => void;
}

export const Component = ({ title, onAction }: ComponentProps) => {
  const [state, setState] = useState<Type>();
  const { navigate } = useRouter();

  const handleClick = () => {
    // lógica
  };

  return (
    <div>
      {/* JSX */}
    </div>
  );
};
```

### Estilização com Tailwind

O projeto usa Tailwind CSS para estilização. Principais classes utilizadas:

- **Layout**: `flex`, `grid`, `space-y-4`, `gap-6`
- **Cores**: `bg-white`, `text-slate-900`, `border-slate-200`
- **Tipografia**: `text-lg`, `font-semibold`, `text-center`
- **Espaçamento**: `p-4`, `px-6`, `py-3`, `m-4`
- **Responsividade**: `sm:`, `md:`, `lg:`, `xl:`
- **Estados**: `hover:`, `focus:`, `active:`, `disabled:`

### Trabalhando com Supabase

```typescript
// Queries básicas
const { data, error } = await supabase
  .from('tabela')
  .select('*')
  .eq('campo', valor)
  .maybeSingle();

// Inserts
const { data, error } = await supabase
  .from('tabela')
  .insert({ campo: valor })
  .select()
  .single();

// Updates
const { error } = await supabase
  .from('tabela')
  .update({ campo: novoValor })
  .eq('id', id);

// Deletes
const { error } = await supabase
  .from('tabela')
  .delete()
  .eq('id', id);
```

### Debugging de RLS Policies

Se encontrar problemas de acesso:

1. Verifique se o usuário está autenticado: `console.log(await supabase.auth.getUser())`
2. Verifique se o `auth_user_id` está preenchido na tabela pessoas/administradores
3. Teste a função helper no SQL Editor: `SELECT get_pessoa_id_from_auth()`
4. Verifique os logs do console do navegador (F12)
5. Revise as policies RLS no Supabase Dashboard

## Edge Functions

### admin-users
Gerencia a criação de usuários administradores via Supabase Auth, garantindo que apenas administradores possam criar novos usuários com permissões.

### user-management
Gerencia operações relacionadas a usuários do sistema, incluindo sincronização entre auth.users e as tabelas de pessoas/administradores.

## Deploy

### Opções de Deploy

1. **Vercel** (Recomendado)
   ```bash
   npm install -g vercel
   vercel
   ```

2. **Netlify**
   ```bash
   npm install -g netlify-cli
   netlify deploy --prod
   ```

3. **Docker**
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm install
   COPY . .
   RUN npm run build
   EXPOSE 5173
   CMD ["npm", "run", "preview"]
   ```

### Variáveis de Ambiente em Produção

Certifique-se de configurar:
- `VITE_SUPABASE_URL` - URL do seu projeto Supabase
- `VITE_SUPABASE_ANON_KEY` - Chave anônima do Supabase

### Checklist de Deploy

- [ ] Configurar variáveis de ambiente
- [ ] Executar todas as migrações no Supabase
- [ ] Verificar policies RLS ativas
- [ ] Testar fluxo de autenticação
- [ ] Criar primeiro usuário administrador via Edge Function
- [ ] Testar acesso de colaborador
- [ ] Validar proteção de rotas
- [ ] Verificar logs de erro

## Suporte e Contribuição

### Reportar Problemas

Para reportar bugs ou solicitar funcionalidades, abra uma issue no repositório.

### Contribuir

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## Troubleshooting

### Problema: "Avaliação não encontrada"
**Causa**: As RLS policies podem estar bloqueando o acesso ou o `auth_user_id` não está vinculado corretamente.

**Solução**:
1. Verifique se a pessoa tem `auth_user_id` preenchido
2. Confirme que a avaliação está com status 'finalizada'
3. Verifique os logs do console para erros específicos
4. Execute `SELECT get_pessoa_id_from_auth()` no SQL Editor enquanto logado

### Problema: Erro 400 no Supabase
**Causa**: Conflito entre filtros manuais na query e políticas RLS.

**Solução**: As RLS policies já filtram automaticamente os dados. Evite adicionar filtros redundantes como `.eq('colaborador_id', pessoa?.id)`.

### Problema: Usuário não consegue fazer login
**Causa**: Usuário pode não existir no Supabase Auth ou não estar vinculado a uma pessoa/administrador.

**Solução**:
1. Verifique se o email existe em auth.users
2. Confirme que o `auth_user_id` está preenchido na tabela correspondente
3. Use a Edge Function para criar administradores corretamente

## Licença

Este projeto é proprietário e confidencial.

## Contato

Para dúvidas ou suporte, entre em contato com a equipe de desenvolvimento.

---

**Versão**: 1.0.0
**Última atualização**: Outubro 2025
