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

### Arquitetura
- **Single Page Application (SPA)** - Navegação rápida sem recarregamento de página
- **Client-side Routing** - Roteamento customizado e otimizado
- **Context API** - Gerenciamento de estado global
- **Componentização** - Arquitetura modular e reutilizável

## Estrutura do Projeto

```
ascender-rh/
├── src/
│   ├── components/          # Componentes reutilizáveis
│   │   ├── Button.tsx
│   │   ├── Header.tsx
│   │   ├── Layout.tsx
│   │   ├── Modal.tsx
│   │   ├── PrivateRoute.tsx
│   │   ├── RichTextEditor.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Table.tsx
│   │   ├── Toast.tsx
│   │   └── Forms/           # Formulários específicos
│   │       ├── EmpresaForm.tsx
│   │       ├── GrupoForm.tsx
│   │       └── PessoaForm.tsx
│   │
│   ├── contexts/            # Context API para estado global
│   │   └── AuthContext.tsx
│   │
│   ├── lib/                 # Configurações de bibliotecas
│   │   └── supabase.ts
│   │
│   ├── pages/               # Páginas da aplicação
│   │   ├── HomePage.tsx
│   │   ├── EmpresasPage.tsx
│   │   ├── PessoasPage.tsx
│   │   ├── GruposPage.tsx
│   │   ├── PerfisPage.tsx
│   │   ├── CompetenciasPage.tsx
│   │   ├── CompetenciaFormPage.tsx
│   │   ├── ModelosPage.tsx
│   │   ├── ModeloFormPage.tsx
│   │   ├── AvaliacoesPage.tsx
│   │   ├── AvaliacaoFormPage.tsx
│   │   ├── AdministradoresPage.tsx
│   │   ├── AdministradorFormPage.tsx
│   │   ├── PerfilPage.tsx
│   │   └── PlaceholderPage.tsx
│   │
│   ├── types/               # Definições TypeScript
│   │   └── index.ts
│   │
│   ├── utils/               # Utilitários
│   │   └── router.tsx
│   │
│   ├── App.tsx              # Componente raiz
│   ├── main.tsx             # Entry point
│   └── index.css            # Estilos globais
│
├── supabase/
│   ├── functions/           # Edge Functions (serverless)
│   │   └── admin-users/
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
- **pessoas** - Colaboradores e funcionários
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

#### Tabelas de Administração
- **administradores** - Usuários do sistema com permissões

### Segurança (Row Level Security)

Todas as tabelas possuem políticas RLS (Row Level Security) configuradas para garantir que:
- Apenas usuários autenticados possam acessar dados
- Usuários só possam ver/editar dados de sua empresa
- Administradores tenham acesso total aos dados

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
├── 20251008135843_20251008140000_setup_auth_integration.sql
├── 20251008140000_setup_auth_integration.sql
├── 20251008140100_update_rls_policies_for_auth.sql
└── 20251008142530_create_auth_user_helper_function.sql
```

## Funcionalidades Principais

### 1. Dashboard
- Visão geral com estatísticas de empresas, pessoas, grupos e avaliações
- Atividades recentes
- Ações rápidas para cadastros

### 2. Gestão de Empresas
- Cadastro completo de empresas clientes
- CNPJ, razão social, nome fantasia
- Endereço completo e contatos
- Status ativo/inativo

### 3. Gestão de Pessoas
- Cadastro detalhado de colaboradores
- CPF, data de nascimento, foto
- Vinculação com empresa e grupos
- Histórico e informações profissionais

### 4. Grupos
- Criação de equipes e departamentos
- Associação de pessoas aos grupos
- Definição de gestores
- Vinculação com empresas

### 5. Perfis Comportamentais
- Criação de perfis personalizados
- Descrição de características
- Aplicação em avaliações

### 6. Competências
- Biblioteca de competências técnicas e comportamentais
- Descrições detalhadas com rich text editor
- Níveis de proficiência
- Reutilização em múltiplos modelos

### 7. Modelos de Avaliação
- Templates personalizados de avaliação
- Critérios de avaliação com escalas
- Perguntas customizadas (múltipla escolha, texto, etc.)
- Vinculação com competências

### 8. Avaliações 360°
- Criação de processos de avaliação
- Seleção de avaliadores (superior, pares, subordinados)
- Aplicação de modelos
- Coleta de respostas
- Relatórios e análises

### 9. Administradores
- Gestão de usuários do sistema
- Permissões (administrador, psicóloga)
- Controle de acesso

## Acesso ao Sistema

**Modo de Desenvolvimento**: O sistema está configurado para acesso direto sem autenticação, entrando automaticamente com um usuário administrativo padrão.

**Usuário Padrão (Dev)**:
- Nome: Administrador
- Email: admin@sistema.com
- Permissões: Administrador completo

**Nota**: Em produção, implemente autenticação completa via Supabase Auth.

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
// Exemplo de estrutura de componente
interface ComponentProps {
  title: string;
  onAction: () => void;
}

export const Component = ({ title, onAction }: ComponentProps) => {
  // Estados
  const [state, setState] = useState<Type>();

  // Hooks
  const { navigate } = useRouter();

  // Handlers
  const handleClick = () => {
    // lógica
  };

  // Render
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

## Suporte e Contribuição

### Reportar Problemas

Para reportar bugs ou solicitar funcionalidades, abra uma issue no repositório.

### Contribuir

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## Licença

Este projeto é proprietário e confidencial.

## Contato

Para dúvidas ou suporte, entre em contato com a equipe de desenvolvimento.

---

**Versão**: 1.0.0
**Última atualização**: Outubro 2025
