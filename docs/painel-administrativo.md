# Painel Administrativo

## Visão Geral

O painel administrativo é acessível apenas para usuários com `tipo_acesso = 'admin'`. Oferece controle completo sobre todos os recursos do sistema.

## Estrutura do Menu

### Menu Principal (Sidebar)
1. **Empresas** - Gerenciamento de empresas clientes
2. **Pessoas** - Cadastro e gestão de colaboradores
3. **Grupos** - Organização de equipes
4. **Competências** - Biblioteca de competências
5. **Modelos** - Templates de avaliação
6. **Avaliações** - Criação e gestão de avaliações
7. **Perfis** - Perfis de permissão (placeholder)
8. **Administradores** - Gestão de usuários admin

## Funcionalidades Detalhadas

### 1. Empresas (`/admin/empresas`)

#### Listagem
- Tabela com todas as empresas cadastradas
- Colunas: Nome, Cidade, Régua, Válido Até, Status, Ações
- Filtros e busca disponíveis
- Paginação automática

#### Criar/Editar Empresa
**Campos do formulário**:
- **Nome*** (obrigatório): Nome da empresa
- **Cidade**: Localização da empresa
- **Régua**: Escala de avaliação (valor numérico)
- **Válido Até**: Data de validade da licença
- **Avatar URL**: URL da logo da empresa
- **Ativo**: Status ativo/inativo

**Validações**:
- Nome é obrigatório
- Data de validade deve ser futura
- Régua deve ser número positivo

#### Ações
- **Editar**: Abre modal de edição
- **Excluir**: Remove empresa (com confirmação)
- **Visualizar**: Detalhes da empresa

---

### 2. Pessoas (`/admin/pessoas`)

#### Listagem
- Tabela com todos os colaboradores e gestores
- Colunas: Nome, Email, Função, Tipo de Acesso, Empresa, Grupos, Ações
- Badge colorido para tipo de acesso:
  - Admin: Roxo
  - Gestor: Azul
  - Colaborador: Verde
- Filtro por empresa
- Busca por nome ou email

#### Criar/Editar Pessoa
**Campos do formulário**:
- **Nome*** (obrigatório)
- **Email*** (obrigatório, único)
- **Idioma**: PT-BR, EN-US ou ES-ES
- **Gênero**: Masculino, Feminino, Outro, Prefiro não dizer
- **Empresa***: Seleção da empresa
- **Função**: Cargo na empresa
- **Tipo de Acesso***: Admin, Gestor ou Colaborador
- **Avatar URL**: Foto de perfil
- **Grupos**: Múltipla seleção de grupos
- **Ativo**: Status ativo/inativo

**Validações**:
- Email único no sistema
- Nome, email, empresa e tipo de acesso obrigatórios
- Email deve ser válido

#### Criação de Conta
Ao salvar uma nova pessoa:
1. Sistema cria usuário no Supabase Auth
2. Envia email de convite (opcional)
3. Vincula `auth_user_id` na tabela `pessoas`
4. Define `senha_definida = false`

#### Ações
- **Editar**: Abre modal de edição
- **Excluir**: Remove pessoa (com confirmação)
- **Redefinir Senha**: Envia email de recuperação

---

### 3. Grupos (`/admin/grupos`)

#### Listagem
- Tabela com todos os grupos
- Colunas: Nome, Empresa, Número de Membros, Gestores, Ações
- Lista de gestores como badges
- Filtro por empresa

#### Criar/Editar Grupo
**Campos do formulário**:
- **Nome*** (obrigatório)
- **Empresa***: Seleção da empresa
- **Gestores**: Múltipla seleção de pessoas (tipo gestor)
- **Membros**: Múltipla seleção de pessoas (tipo colaborador)

**Validações**:
- Nome e empresa obrigatórios
- Gestores devem ter `tipo_acesso = 'gestor'`
- Membros não podem ser gestores

#### Funcionalidade
- Grupos organizam colaboradores em equipes
- Cada grupo pode ter múltiplos gestores
- Gestores veem apenas avaliações de seus grupos
- Utilizado para hierarquia e permissões

#### Ações
- **Editar**: Abre modal de edição
- **Excluir**: Remove grupo (com confirmação)

---

### 4. Competências (`/admin/competencias`)

#### Listagem
- Cards com as competências cadastradas
- Cada card mostra:
  - Nome da competência
  - Status (Ativo/Arquivado)
  - Badge "Fixo" se competência é padrão do sistema
  - Número de critérios
  - Lista expandível de critérios
- Filtro por status
- Busca por nome

#### Criar/Editar Competência
**Campos do formulário**:
- **Nome*** (obrigatório)
- **Fixo**: Competência padrão do sistema (não editável por clientes)
- **Empresa**: Vincula a uma empresa específica (null = global)
- **Status**: Ativo ou Arquivado

**Critérios**:
Lista dinâmica de critérios de avaliação:
- **Nome do Critério*** (PT-BR)
- **Descrição do Critério** (PT-BR)
- **Visibilidade**:
  - Todos: Visível para todos
  - Gestor: Apenas gestores veem
  - Avaliadores: Apenas quem avalia
- **Ordem**: Posição na lista
- Botões: + Adicionar, - Remover

**Validações**:
- Nome da competência obrigatório
- Cada critério deve ter nome
- Ordem deve ser única

#### Internacionalização
Os textos dos critérios são salvos na tabela `criterios_textos`:
- `idioma`: 'pt-BR', 'en-US', 'es-ES'
- `idioma_padrao`: true para idioma principal
- Permite traduções futuras

#### Ações
- **Editar**: Abre modal de edição
- **Arquivar**: Muda status para arquivado
- **Excluir**: Remove competência (com confirmação)

---

### 5. Modelos (`/admin/modelos`)

#### Listagem
- Tabela com modelos de avaliação
- Colunas: Nome, Status, Empresa, Competências, Perguntas, Ações
- Badge de status:
  - Rascunho: Amarelo
  - Publicado: Verde
- Filtro por status e empresa

#### Criar/Editar Modelo
Formulário em múltiplas seções:

**Informações Básicas**:
- **Nome*** (obrigatório)
- **Status**: Rascunho ou Publicado
- **Empresa***: Vincula a uma empresa

**Competências**:
- Seleção múltipla de competências
- Reordenação por drag-and-drop (ordem)
- Preview dos critérios de cada competência
- Critérios são herdados da competência

**Perguntas Personalizadas**:
Lista dinâmica de perguntas customizadas:
- **Título da Pergunta*** (obrigatório)
- **Descrição**: Texto de ajuda
- **Tipo de Resposta**:
  - Texto curto
  - Texto longo (textarea)
  - Múltipla escolha (única)
  - Múltipla escolha (múltipla)
  - Escala numérica
  - Escala Likert
  - Data
  - Upload de arquivo
- **Opções**: Para perguntas de múltipla escolha
- **Obrigatório**: Campo obrigatório na avaliação
- **Visibilidade**: Colaborador, Gestor ou Todos
- **Ordem**: Posição na avaliação
- Botões: + Adicionar, - Remover

**Validações**:
- Nome e empresa obrigatórios
- Pelo menos uma competência deve ser selecionada
- Perguntas de múltipla escolha devem ter opções
- Títulos de perguntas obrigatórios

#### Funcionalidade
- Modelos definem estrutura das avaliações
- Apenas modelos publicados podem ser usados
- Modelos em rascunho podem ser editados livremente
- Ao publicar, modelo não pode ser deletado se houver avaliações

#### Ações
- **Editar**: Abre formulário de edição
- **Publicar**: Muda status para publicado
- **Excluir**: Remove modelo (apenas se sem avaliações)
- **Duplicar**: Cria cópia do modelo

---

### 6. Avaliações (`/admin/avaliacoes`)

#### Listagem
- Tabela com todas as avaliações
- Colunas: Colaborador, Email, Empresa, Data, Modelo, Status, Ações
- Badge de status:
  - Rascunho: Amarelo
  - Finalizada: Verde
- Filtros:
  - Por empresa
  - Por status
  - Por data
  - Por colaborador
- Busca por nome ou email

#### Criar Nova Avaliação
**Campos do formulário inicial**:
- **Colaborador***: Seleção do colaborador
- **Empresa***: Seleção da empresa
- **Modelo***: Seleção do modelo de avaliação
- **Data da Avaliação***: Data de realização
- **Psicóloga Responsável**: Administrador responsável

Após criar, abre o formulário completo de avaliação.

#### Editar/Preencher Avaliação
Interface dividida em seções:

**Informações do Colaborador**:
- Nome, email, função
- Empresa e grupos
- Não editável

**Competências e Critérios**:
Para cada competência do modelo:
- Lista de critérios com:
  - Nome e descrição do critério
  - Campo numérico para pontuação (0-10)
  - Campo de texto para observações
  - Visibilidade do critério indicada

**Perguntas Personalizadas**:
Campos dinâmicos baseados no tipo:
- Texto: Input ou textarea
- Múltipla escolha: Radio buttons ou checkboxes
- Escala: Slider numérico
- Data: Date picker
- Upload: File input

**Textos da Avaliação**:
Campos multilíngues (PT-BR por padrão):
- **Pontos Fortes**: Rich text editor
- **Oportunidades de Melhoria**: Rich text editor
- **Highlights da Psicóloga**: Rich text editor

**Observações Finais**:
- Campo de texto livre para anotações gerais

**Validações**:
- Todos os critérios devem ter pontuação
- Perguntas obrigatórias devem ser respondidas
- Status pode ser alterado apenas após preenchimento completo

#### Sistema de Lock (Edição Simultânea)
Quando um administrador abre uma avaliação para edição:
1. Sistema registra `editing_user_id` e `editing_started_at`
2. Outros administradores veem aviso: "Sendo editada por [Nome]"
3. Lock expira após 30 minutos de inatividade
4. Administrador pode "forçar edição" se necessário

#### Visualizar Avaliação (`/admin/avaliacoes/:id/view`)
Modo somente leitura:
- Todas as informações da avaliação
- Pontuações e gráficos (futuro)
- Respostas às perguntas
- Textos formatados
- Botão para imprimir/exportar PDF (futuro)

#### Ações
- **Visualizar**: Abre em modo leitura
- **Editar**: Abre formulário de edição
- **Excluir**: Remove avaliação (com confirmação)
- **Exportar**: Gera PDF (futuro)

---

### 7. Perfis (`/admin/perfis`)

**Status**: Placeholder - Funcionalidade futura

Planejamento:
- Perfis de permissão customizados
- Definir o que cada tipo de usuário pode fazer
- Granularidade fina de permissões

---

### 8. Administradores (`/admin/administradores`)

#### Listagem
- Tabela com todos os administradores
- Colunas: Nome, Email, Telefone, Tipo, Empresas, Status, Ações
- Badges de tipo:
  - Administrador: Badge roxo
  - Psicóloga: Badge rosa
- Lista de empresas vinculadas
- Filtro por status

#### Criar/Editar Administrador
**Campos do formulário**:
- **Nome*** (obrigatório)
- **Email*** (obrigatório, único)
- **Telefone**: Número de contato
- **É Administrador**: Checkbox
- **É Psicóloga**: Checkbox
- **Empresa Padrão**: Empresa principal
- **Empresas Vinculadas**: Múltipla seleção
- **Avatar URL**: Foto de perfil
- **Ativo**: Status ativo/inativo

**Validações**:
- Email único no sistema
- Pelo menos um tipo (Administrador ou Psicóloga)
- Se tiver empresas vinculadas, deve ter empresa padrão

#### Funcionalidade
- Administradores têm acesso total ao sistema
- Psicólogas podem ser designadas para avaliações
- Empresas vinculadas definem quais dados podem acessar
- Multi-tenancy: um admin pode gerenciar várias empresas

#### Ações
- **Editar**: Abre modal de edição
- **Excluir**: Remove administrador (com confirmação)
- **Redefinir Senha**: Envia email de recuperação

---

## Recursos Globais

### Header
- Logo do sistema (canto superior esquerdo)
- Nome do usuário logado
- Avatar do usuário
- Botão de logout

### Sidebar
- Menu de navegação com ícones
- Indicador visual da página atual
- Responsivo (colapsa em mobile)

### Toasts (Notificações)
Sistema de feedback visual:
- **Sucesso**: Verde - "Salvo com sucesso"
- **Erro**: Vermelho - "Erro ao salvar"
- **Aviso**: Amarelo - "Atenção"
- **Info**: Azul - "Informação"

### Modais de Confirmação
- Título da ação
- Mensagem de confirmação
- Botões: Cancelar (cinza) e Confirmar (vermelho)
- Usado para ações destrutivas (excluir)

### Tabelas
Componente reutilizável com:
- Cabeçalhos clicáveis para ordenação
- Paginação automática
- Busca integrada
- Filtros por coluna
- Ações por linha (editar, excluir, etc)
- Loading states
- Empty states

### Formulários
Padrões consistentes:
- Labels claras
- Campos obrigatórios marcados com *
- Validação em tempo real
- Mensagens de erro específicas
- Botões de ação no rodapé (Cancelar, Salvar)
- Loading durante submit

## Permissões e Segurança

### Validações no Frontend
- Tipo de acesso verificado em todas as rotas
- Redirecionamento automático se não autorizado
- UI adaptada ao tipo de usuário

### Validações no Backend (RLS)
- Políticas restritivas por padrão
- Administradores podem acessar dados de suas empresas
- Queries automáticas filtram por empresa
- Logs de auditoria (futuro)

## Navegação

### Rotas Principais
- `/admin` - Redirect para /admin/empresas
- `/admin/empresas` - Lista de empresas
- `/admin/pessoas` - Lista de pessoas
- `/admin/grupos` - Lista de grupos
- `/admin/competencias` - Lista de competências
- `/admin/modelos` - Lista de modelos
- `/admin/avaliacoes` - Lista de avaliações
- `/admin/avaliacoes/new` - Nova avaliação
- `/admin/avaliacoes/:id` - Editar avaliação
- `/admin/avaliacoes/:id/view` - Visualizar avaliação
- `/admin/perfis` - Perfis (placeholder)
- `/admin/administradores` - Lista de administradores

### Breadcrumbs
Cada página mostra o caminho de navegação no topo.
