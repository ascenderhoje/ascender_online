# Design System e Diretrizes

## Visão Geral

O sistema utiliza um design moderno, limpo e profissional, focado em usabilidade e experiência do usuário. Este documento detalha as diretrizes de design e a estrutura visual de cada página.

## Princípios de Design

### 1. Clareza e Simplicidade
- Interface limpa sem elementos desnecessários
- Hierarquia visual clara
- Informações organizadas de forma lógica
- Ações primárias destacadas

### 2. Consistência
- Componentes reutilizáveis
- Padrões visuais consistentes
- Nomenclatura padronizada
- Comportamentos previsíveis

### 3. Acessibilidade
- Contraste adequado (WCAG AA)
- Textos legíveis (mínimo 14px)
- Navegação por teclado
- Feedback visual claro

### 4. Responsividade
- Mobile-first approach
- Breakpoints bem definidos
- Layouts adaptativos
- Touch-friendly em mobile

## Sistema de Cores

### Paleta Principal

#### Cores Neutras (Base)
```css
/* Backgrounds */
--bg-primary: #FFFFFF      /* Fundo principal */
--bg-secondary: #F9FAFB    /* Fundo secundário */
--bg-tertiary: #F3F4F6     /* Fundo terciário */

/* Borders */
--border-light: #E5E7EB    /* Bordas sutis */
--border-medium: #D1D5DB   /* Bordas médias */
--border-dark: #9CA3AF     /* Bordas escuras */

/* Text */
--text-primary: #111827    /* Texto principal */
--text-secondary: #6B7280  /* Texto secundário */
--text-tertiary: #9CA3AF   /* Texto terciário */
--text-disabled: #D1D5DB   /* Texto desabilitado */
```

#### Cores de Ação

**Azul (Primary)** - Ações principais e links
```css
--blue-50: #EFF6FF
--blue-100: #DBEAFE
--blue-500: #3B82F6   /* Primary */
--blue-600: #2563EB   /* Hover */
--blue-700: #1D4ED8   /* Active */
```

**Verde (Success)** - Sucesso e confirmações
```css
--green-50: #F0FDF4
--green-100: #DCFCE7
--green-500: #22C55E  /* Success */
--green-600: #16A34A  /* Hover */
--green-700: #15803D  /* Active */
```

**Vermelho (Danger)** - Erros e exclusões
```css
--red-50: #FEF2F2
--red-100: #FEE2E2
--red-500: #EF4444    /* Danger */
--red-600: #DC2626    /* Hover */
--red-700: #B91C1C    /* Active */
```

**Amarelo (Warning)** - Avisos e atenção
```css
--yellow-50: #FEFCE8
--yellow-100: #FEF9C3
--yellow-500: #EAB308  /* Warning */
--yellow-600: #CA8A04  /* Hover */
--yellow-700: #A16207  /* Active */
```

#### Cores de Tipo de Usuário

**Roxo (Admin)** - Administradores
```css
--purple-100: #F3E8FF
--purple-500: #A855F7
--purple-600: #9333EA
```

**Azul (Gestor)** - Gestores
```css
--blue-100: #DBEAFE
--blue-500: #3B82F6
--blue-600: #2563EB
```

**Verde (Colaborador)** - Colaboradores
```css
--green-100: #DCFCE7
--green-500: #22C55E
--green-600: #16A34A
```

**Rosa (Psicóloga)** - Psicólogas
```css
--pink-100: #FCE7F3
--pink-500: #EC4899
--pink-600: #DB2777
```

### Uso de Cores

#### Backgrounds
- **Página**: `#F9FAFB` (cinza muito claro)
- **Cards/Modais**: `#FFFFFF` (branco)
- **Hover em listas**: `#F3F4F6` (cinza claro)
- **Inputs**: `#FFFFFF` com borda `#E5E7EB`

#### Textos
- **Títulos principais**: `#111827` (preto suave)
- **Textos corpo**: `#374151` (cinza escuro)
- **Textos secundários**: `#6B7280` (cinza médio)
- **Placeholders**: `#9CA3AF` (cinza claro)

#### Botões
- **Primary**: Background azul `#3B82F6`, texto branco
- **Secondary**: Background branco, borda azul, texto azul
- **Danger**: Background vermelho `#EF4444`, texto branco
- **Ghost**: Background transparente, texto cinza escuro

#### Estados
- **Hover**: Escurece 1 tom
- **Active**: Escurece 2 tons
- **Disabled**: Opacidade 50%, cursor not-allowed
- **Focus**: Ring azul 2px

## Tipografia

### Fonte
**Inter** (via Tailwind CSS default)
- Fallback: system-ui, -apple-system, sans-serif

### Escala de Tamanhos
```css
--text-xs: 12px    /* Textos auxiliares */
--text-sm: 14px    /* Textos pequenos */
--text-base: 16px  /* Texto padrão */
--text-lg: 18px    /* Textos destacados */
--text-xl: 20px    /* Títulos pequenos */
--text-2xl: 24px   /* Títulos médios */
--text-3xl: 30px   /* Títulos grandes */
--text-4xl: 36px   /* Títulos principais */
```

### Pesos
```css
--font-normal: 400   /* Textos normais */
--font-medium: 500   /* Destaque leve */
--font-semibold: 600 /* Títulos e botões */
--font-bold: 700     /* Títulos principais */
```

### Line Height
```css
--leading-tight: 1.25   /* Títulos */
--leading-normal: 1.5   /* Corpo de texto */
--leading-relaxed: 1.75 /* Textos longos */
```

### Hierarquia Tipográfica

#### H1 - Título Principal
- Tamanho: `30px` (text-3xl)
- Peso: `700` (bold)
- Cor: `#111827`
- Uso: Título da página

#### H2 - Título de Seção
- Tamanho: `24px` (text-2xl)
- Peso: `600` (semibold)
- Cor: `#111827`
- Uso: Seções principais

#### H3 - Subtítulo
- Tamanho: `20px` (text-xl)
- Peso: `600` (semibold)
- Cor: `#374151`
- Uso: Subsções

#### Body - Texto Padrão
- Tamanho: `16px` (text-base)
- Peso: `400` (normal)
- Cor: `#374151`
- Line height: `1.5`

#### Small - Texto Pequeno
- Tamanho: `14px` (text-sm)
- Peso: `400` (normal)
- Cor: `#6B7280`
- Uso: Legendas, metadados

## Espaçamento

### Sistema de 8px
Base: `8px` (0.5rem)

```css
--space-1: 4px    (0.5)
--space-2: 8px    (1)
--space-3: 12px   (1.5)
--space-4: 16px   (2)
--space-5: 20px   (2.5)
--space-6: 24px   (3)
--space-8: 32px   (4)
--space-10: 40px  (5)
--space-12: 48px  (6)
--space-16: 64px  (8)
--space-20: 80px  (10)
```

### Aplicação
- **Entre elementos**: 16px (space-4)
- **Entre seções**: 32px (space-8)
- **Padding de cards**: 24px (space-6)
- **Padding de inputs**: 12px vertical, 16px horizontal
- **Margem de títulos**: 24px abaixo

## Componentes

### 1. Botões

#### Primary Button
```tsx
<button className="bg-blue-500 hover:bg-blue-600 active:bg-blue-700
                   text-white font-semibold px-4 py-2 rounded-lg
                   transition-colors duration-200
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                   disabled:opacity-50 disabled:cursor-not-allowed">
  Texto do Botão
</button>
```

**Uso**: Ações principais (Salvar, Criar, Confirmar)

#### Secondary Button
```tsx
<button className="bg-white hover:bg-gray-50
                   text-gray-700 font-semibold px-4 py-2 rounded-lg
                   border border-gray-300
                   transition-colors duration-200
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
  Texto do Botão
</button>
```

**Uso**: Ações secundárias (Cancelar, Voltar)

#### Danger Button
```tsx
<button className="bg-red-500 hover:bg-red-600
                   text-white font-semibold px-4 py-2 rounded-lg
                   transition-colors duration-200
                   focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">
  Excluir
</button>
```

**Uso**: Ações destrutivas (Excluir, Remover)

#### Icon Button
```tsx
<button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
  <Icon className="w-5 h-5 text-gray-600" />
</button>
```

**Uso**: Ações com ícone apenas (Editar, Excluir, Fechar)

### 2. Inputs

#### Text Input
```tsx
<div className="space-y-2">
  <label className="block text-sm font-medium text-gray-700">
    Nome *
  </label>
  <input
    type="text"
    className="w-full px-4 py-2 border border-gray-300 rounded-lg
               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
               placeholder:text-gray-400
               disabled:bg-gray-100 disabled:cursor-not-allowed"
    placeholder="Digite o nome"
  />
</div>
```

#### Select
```tsx
<select className="w-full px-4 py-2 border border-gray-300 rounded-lg
                   bg-white
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
  <option value="">Selecione...</option>
  <option value="1">Opção 1</option>
</select>
```

#### Textarea
```tsx
<textarea
  rows={4}
  className="w-full px-4 py-2 border border-gray-300 rounded-lg
             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
             resize-none"
  placeholder="Digite aqui..."
/>
```

#### Checkbox
```tsx
<label className="flex items-center space-x-2 cursor-pointer">
  <input
    type="checkbox"
    className="w-4 h-4 text-blue-500 border-gray-300 rounded
               focus:ring-blue-500"
  />
  <span className="text-sm text-gray-700">Opção</span>
</label>
```

### 3. Cards

#### Card Padrão
```tsx
<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
  <h3 className="text-xl font-semibold text-gray-900 mb-4">
    Título do Card
  </h3>
  <p className="text-gray-600">
    Conteúdo do card
  </p>
</div>
```

#### Card com Hover
```tsx
<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6
                hover:shadow-md transition-shadow duration-200 cursor-pointer">
  Conteúdo
</div>
```

### 4. Badges

#### Status Badge
```tsx
{/* Sucesso */}
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full
                 text-xs font-medium bg-green-100 text-green-800">
  Ativo
</span>

{/* Aviso */}
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full
                 text-xs font-medium bg-yellow-100 text-yellow-800">
  Rascunho
</span>

{/* Info */}
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full
                 text-xs font-medium bg-blue-100 text-blue-800">
  Gestor
</span>
```

### 5. Tabelas

```tsx
<div className="overflow-x-auto">
  <table className="min-w-full divide-y divide-gray-200">
    <thead className="bg-gray-50">
      <tr>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Nome
        </th>
      </tr>
    </thead>
    <tbody className="bg-white divide-y divide-gray-200">
      <tr className="hover:bg-gray-50 transition-colors">
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          Dados
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

### 6. Modais

```tsx
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
  <div className="bg-white rounded-lg shadow-xl max-w-lg w-full m-4">
    {/* Header */}
    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
      <h3 className="text-xl font-semibold text-gray-900">
        Título do Modal
      </h3>
      <button className="text-gray-400 hover:text-gray-600">
        <X className="w-5 h-5" />
      </button>
    </div>

    {/* Body */}
    <div className="px-6 py-4">
      Conteúdo
    </div>

    {/* Footer */}
    <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 rounded-b-lg">
      <button className="secondary">Cancelar</button>
      <button className="primary">Confirmar</button>
    </div>
  </div>
</div>
```

### 7. Toasts (Notificações)

```tsx
{/* Sucesso */}
<div className="fixed top-4 right-4 z-50
                bg-white rounded-lg shadow-lg border-l-4 border-green-500
                p-4 flex items-center gap-3">
  <CheckCircle className="w-5 h-5 text-green-500" />
  <span className="text-gray-900">Operação realizada com sucesso!</span>
</div>

{/* Erro */}
<div className="fixed top-4 right-4 z-50
                bg-white rounded-lg shadow-lg border-l-4 border-red-500
                p-4 flex items-center gap-3">
  <XCircle className="w-5 h-5 text-red-500" />
  <span className="text-gray-900">Ocorreu um erro!</span>
</div>
```

## Layout Padrão

### Estrutura Geral

```
┌────────────────────────────────────────┐
│           Header (64px)                │
├──────────┬─────────────────────────────┤
│          │                             │
│ Sidebar  │     Conteúdo Principal      │
│ (256px)  │                             │
│          │                             │
│          │                             │
└──────────┴─────────────────────────────┘
```

### Header
- Altura: `64px`
- Background: `#FFFFFF`
- Border bottom: `1px solid #E5E7EB`
- Padding: `0 24px`
- Shadow: `0 1px 3px rgba(0,0,0,0.1)`

**Estrutura**:
```tsx
<header className="h-16 bg-white border-b border-gray-200 shadow-sm">
  <div className="h-full px-6 flex items-center justify-between">
    {/* Logo */}
    <div className="flex items-center gap-3">
      <img src="/logo.svg" alt="Logo" className="h-8" />
      <h1 className="text-xl font-bold text-gray-900">Sistema</h1>
    </div>

    {/* User Menu */}
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-600">Nome do Usuário</span>
      <img src="/avatar.jpg" className="w-8 h-8 rounded-full" />
    </div>
  </div>
</header>
```

### Sidebar
- Largura: `256px` (desktop), full width (mobile)
- Background: `#FFFFFF`
- Border right: `1px solid #E5E7EB`
- Padding: `24px 16px`

**Estrutura**:
```tsx
<aside className="w-64 bg-white border-r border-gray-200 h-full">
  <nav className="px-4 py-6 space-y-2">
    {/* Menu Item Ativo */}
    <a className="flex items-center gap-3 px-3 py-2 rounded-lg
                  bg-blue-50 text-blue-600 font-medium">
      <Icon className="w-5 h-5" />
      <span>Dashboard</span>
    </a>

    {/* Menu Item Inativo */}
    <a className="flex items-center gap-3 px-3 py-2 rounded-lg
                  text-gray-600 hover:bg-gray-50 transition-colors">
      <Icon className="w-5 h-5" />
      <span>Pessoas</span>
    </a>
  </nav>
</aside>
```

### Conteúdo Principal
- Padding: `32px 40px`
- Max-width: `1400px` (centrado)
- Background: `#F9FAFB`

**Estrutura**:
```tsx
<main className="flex-1 bg-gray-50 p-8">
  <div className="max-w-7xl mx-auto">
    {/* Cabeçalho da Página */}
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-gray-900">
        Título da Página
      </h1>
      <p className="text-gray-600 mt-2">
        Descrição ou breadcrumb
      </p>
    </div>

    {/* Conteúdo */}
    <div className="space-y-6">
      {/* Cards, tabelas, formulários... */}
    </div>
  </div>
</main>
```

## Design de Páginas Específicas

### 1. Página de Login

**Layout**:
- Centralizado vertical e horizontalmente
- Card branco sobre fundo gradiente
- Logo no topo
- Formulário simples

**Estrutura**:
```tsx
<div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100
                flex items-center justify-center p-4">
  <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
    {/* Logo */}
    <div className="text-center mb-8">
      <img src="/logo.svg" className="h-12 mx-auto mb-4" />
      <h1 className="text-2xl font-bold text-gray-900">
        Bem-vindo
      </h1>
      <p className="text-gray-600 mt-1">
        Faça login para continuar
      </p>
    </div>

    {/* Form */}
    <form className="space-y-4">
      {/* Inputs */}
    </form>

    {/* Links */}
    <div className="mt-4 text-center">
      <a href="/forgot-password"
         className="text-sm text-blue-600 hover:text-blue-700">
        Esqueceu sua senha?
      </a>
    </div>
  </div>
</div>
```

**Características**:
- Fundo: Gradiente azul claro
- Card: Branco, sombra grande, cantos arredondados (16px)
- Inputs: Focus ring azul
- Botão: Azul, largura total

### 2. Dashboard (Admin/Gestor/Colaborador)

**Layout**:
- Grid de cards de estatísticas no topo
- Gráficos em grade 2 colunas
- Lista de atividades recentes

**Estrutura**:
```tsx
<div className="space-y-6">
  {/* Stats Grid */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">Total de Avaliações</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">124</p>
        </div>
        <div className="p-3 bg-blue-50 rounded-lg">
          <FileText className="w-6 h-6 text-blue-600" />
        </div>
      </div>
    </div>
  </div>

  {/* Charts */}
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Gráfico
      </h3>
      {/* Chart component */}
    </div>
  </div>

  {/* Recent Activity */}
  <div className="bg-white rounded-lg shadow-sm border border-gray-200">
    <div className="px-6 py-4 border-b border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900">
        Atividades Recentes
      </h3>
    </div>
    <div className="divide-y divide-gray-200">
      {/* Activity items */}
    </div>
  </div>
</div>
```

**Características**:
- Cards de estatísticas: Ícone colorido no canto
- Gráficos: Padding generoso, título destacado
- Responsivo: 1 coluna mobile, 4 colunas desktop

### 3. Listagens (Empresas, Pessoas, Grupos, etc)

**Layout**:
- Cabeçalho com título e botão de criar
- Barra de busca e filtros
- Tabela com ações por linha
- Paginação no rodapé

**Estrutura**:
```tsx
<div className="space-y-6">
  {/* Header */}
  <div className="flex items-center justify-between">
    <div>
      <h1 className="text-3xl font-bold text-gray-900">Pessoas</h1>
      <p className="text-gray-600 mt-1">
        Gerencie colaboradores e gestores
      </p>
    </div>
    <button className="primary flex items-center gap-2">
      <Plus className="w-5 h-5" />
      Adicionar Pessoa
    </button>
  </div>

  {/* Filters */}
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
    <div className="flex gap-4">
      <input
        type="search"
        placeholder="Buscar por nome ou email..."
        className="flex-1"
      />
      <select className="w-48">
        <option>Todas as empresas</option>
      </select>
    </div>
  </div>

  {/* Table */}
  <div className="bg-white rounded-lg shadow-sm border border-gray-200">
    <table className="min-w-full">
      {/* ... */}
    </table>
  </div>

  {/* Pagination */}
  <div className="flex items-center justify-between">
    <p className="text-sm text-gray-600">
      Mostrando 1-10 de 45
    </p>
    <div className="flex gap-2">
      <button className="px-3 py-1 border rounded">Anterior</button>
      <button className="px-3 py-1 bg-blue-500 text-white rounded">1</button>
      <button className="px-3 py-1 border rounded">2</button>
      <button className="px-3 py-1 border rounded">Próximo</button>
    </div>
  </div>
</div>
```

**Características**:
- Header: Flex com título à esquerda, botão à direita
- Filtros: Card separado, inputs inline
- Tabela: Hover em linhas, ações alinhadas à direita
- Paginação: Números clicáveis, botão ativo destacado

### 4. Formulários (Criar/Editar)

**Layout Modal**:
- Modal centralizado, largura máxima 800px
- Header com título e botão fechar
- Body com formulário em grid
- Footer com botões de ação

**Estrutura**:
```tsx
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
  <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full m-4 max-h-[90vh] overflow-hidden flex flex-col">
    {/* Header */}
    <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
      <h2 className="text-xl font-semibold text-gray-900">
        Adicionar Pessoa
      </h2>
      <button className="text-gray-400 hover:text-gray-600">
        <X className="w-5 h-5" />
      </button>
    </div>

    {/* Body */}
    <div className="flex-1 overflow-y-auto px-6 py-6">
      <form className="space-y-6">
        {/* Campos em grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label>Nome *</label>
            <input type="text" />
          </div>
          <div>
            <label>Email *</label>
            <input type="email" />
          </div>
        </div>

        {/* Campos full width */}
        <div>
          <label>Função</label>
          <input type="text" />
        </div>
      </form>
    </div>

    {/* Footer */}
    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
      <button className="secondary">Cancelar</button>
      <button className="primary">Salvar</button>
    </div>
  </div>
</div>
```

**Características**:
- Campos relacionados agrupados
- Grid 2 colunas em desktop, 1 em mobile
- Labels sempre visíveis
- Campos obrigatórios marcados com *
- Footer fixo no bottom

### 5. Visualização de Avaliação

**Layout**:
- Cabeçalho com info do colaborador
- Seções colapsáveis ou separadas por cards
- Gráficos visuais de pontuação
- Textos formatados com rich text

**Estrutura**:
```tsx
<div className="space-y-6">
  {/* Header */}
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <div className="flex items-center gap-4">
      <img src="/avatar.jpg" className="w-16 h-16 rounded-full" />
      <div className="flex-1">
        <h2 className="text-2xl font-bold text-gray-900">Nome do Colaborador</h2>
        <p className="text-gray-600">Função • Data da avaliação</p>
      </div>
      <div className="text-right">
        <p className="text-sm text-gray-600">Pontuação Geral</p>
        <p className="text-3xl font-bold text-blue-600">8.5</p>
      </div>
    </div>
  </div>

  {/* Competências */}
  <div className="bg-white rounded-lg shadow-sm border border-gray-200">
    <div className="px-6 py-4 border-b border-gray-200">
      <h3 className="text-xl font-semibold text-gray-900">Competências</h3>
    </div>

    <div className="p-6 space-y-6">
      {/* Para cada competência */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          Nome da Competência
        </h4>

        {/* Critérios */}
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700">Nome do Critério</p>
              <p className="text-xs text-gray-500">Descrição</p>
            </div>
            <div className="w-32">
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{width: '85%'}}></div>
                </div>
                <span className="text-sm font-semibold text-gray-900 w-8">8.5</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  {/* Análise */}
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h4 className="text-lg font-semibold text-gray-900 mb-4">
        Pontos Fortes
      </h4>
      <div className="prose prose-sm text-gray-600">
        {/* Rich text content */}
      </div>
    </div>

    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h4 className="text-lg font-semibold text-gray-900 mb-4">
        Oportunidades de Melhoria
      </h4>
      <div className="prose prose-sm text-gray-600">
        {/* Rich text content */}
      </div>
    </div>
  </div>
</div>
```

**Características**:
- Header destacado com foto e pontuação geral
- Critérios com barras de progresso visuais
- Textos formatados legíveis
- Grid 2 colunas para pontos fortes/melhorias

## Responsividade

### Breakpoints
```css
/* Mobile */
@media (min-width: 640px) { /* sm */ }

/* Tablet */
@media (min-width: 768px) { /* md */ }

/* Desktop */
@media (min-width: 1024px) { /* lg */ }

/* Large Desktop */
@media (min-width: 1280px) { /* xl */ }
```

### Comportamento por Dispositivo

#### Mobile (< 768px)
- Sidebar vira menu hamburguer
- Grid de 4 colunas vira 1 coluna
- Tabelas com scroll horizontal
- Modais ocupam 100% da altura
- Padding reduzido (16px)
- Font-size ligeiramente menor

#### Tablet (768px - 1024px)
- Grid de 4 colunas vira 2 colunas
- Sidebar colapsável
- Modais com largura máxima
- Padding normal (24px)

#### Desktop (> 1024px)
- Layout completo
- Sidebar sempre visível
- Grid em múltiplas colunas
- Hover effects habilitados
- Padding generoso (32px)

## Animações e Transições

### Princípios
- **Sutis**: Não distrair do conteúdo
- **Rápidas**: 150-300ms
- **Propósito**: Indicar mudança de estado

### Transições Padrão
```css
/* Cores e backgrounds */
transition: background-color 200ms ease, color 200ms ease;

/* Transformações */
transition: transform 200ms ease;

/* Opacidade */
transition: opacity 200ms ease;

/* Sombras */
transition: box-shadow 200ms ease;

/* Múltiplas */
transition: all 200ms ease;
```

### Exemplos

#### Hover em Botão
```tsx
<button className="transition-colors duration-200 hover:bg-blue-600">
  Botão
</button>
```

#### Aparecer/Desaparecer Modal
```tsx
/* Fade in */
<div className="animate-fadeIn">Modal</div>

/* Slide up */
<div className="animate-slideUp">Toast</div>
```

#### Loading State
```tsx
<div className="animate-pulse bg-gray-200 h-10 w-full rounded"></div>
```

## Ícones

### Biblioteca
**Lucide React** - Ícones consistentes e modernos

### Tamanhos Padrão
- **XS**: `w-4 h-4` (16px) - Textos pequenos
- **SM**: `w-5 h-5` (20px) - Botões, menu
- **MD**: `w-6 h-6` (24px) - Cards, títulos
- **LG**: `w-8 h-8` (32px) - Featured icons
- **XL**: `w-12 h-12` (48px) - Empty states

### Uso
```tsx
import { User, Settings, LogOut } from 'lucide-react';

<User className="w-5 h-5 text-gray-600" />
```

### Ícones Comuns
- **Menu**: `Menu`
- **Fechar**: `X`
- **Adicionar**: `Plus`
- **Editar**: `Edit`, `Pencil`
- **Excluir**: `Trash2`
- **Buscar**: `Search`
- **Filtro**: `Filter`
- **Configurações**: `Settings`
- **Usuário**: `User`, `Users`
- **Empresa**: `Building2`
- **Grupo**: `Users`
- **Avaliação**: `FileText`, `ClipboardCheck`
- **Competência**: `Award`, `Target`
- **Dashboard**: `LayoutDashboard`
- **Sucesso**: `CheckCircle`
- **Erro**: `XCircle`
- **Aviso**: `AlertTriangle`
- **Info**: `Info`

## Estados Vazios (Empty States)

### Estrutura
```tsx
<div className="text-center py-12">
  <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
    <Icon className="w-12 h-12 text-gray-400" />
  </div>
  <h3 className="text-lg font-semibold text-gray-900 mb-2">
    Nenhum item encontrado
  </h3>
  <p className="text-gray-600 mb-6">
    Comece criando seu primeiro item
  </p>
  <button className="primary">
    Criar Novo
  </button>
</div>
```

## Loading States

### Skeleton
```tsx
<div className="animate-pulse space-y-4">
  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
  <div className="h-4 bg-gray-200 rounded"></div>
  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
</div>
```

### Spinner
```tsx
<div className="flex items-center justify-center py-12">
  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
</div>
```

## Acessibilidade

### Checklist
- [ ] Contraste mínimo 4.5:1 para texto normal
- [ ] Contraste mínimo 3:1 para texto grande
- [ ] Todos os inputs têm labels
- [ ] Botões têm aria-label quando só ícone
- [ ] Focus visível em todos os elementos interativos
- [ ] Navegação por teclado funcional
- [ ] Mensagens de erro são anunciadas
- [ ] Imagens têm alt text
- [ ] Modais têm role="dialog"
- [ ] Estrutura HTML semântica

## Boas Práticas

### DOs
✅ Usar componentes reutilizáveis
✅ Manter consistência visual
✅ Fornecer feedback visual
✅ Validar formulários
✅ Indicar campos obrigatórios
✅ Usar loading states
✅ Mostrar mensagens de erro claras
✅ Testar em diferentes tamanhos de tela

### DON'Ts
❌ Usar cores aleatórias
❌ Misturar estilos de componentes
❌ Esquecer estados de loading
❌ Ignorar responsividade
❌ Usar textos genéricos de erro
❌ Sobrecarregar interface
❌ Esquecer de empty states
❌ Negligenciar acessibilidade

## Diretrizes para Novas Páginas

Ao criar uma nova página, siga este checklist:

1. **Layout Base**
   - [ ] Usar o layout padrão (Header + Sidebar + Main)
   - [ ] Adicionar título e descrição da página
   - [ ] Definir breadcrumb se necessário

2. **Cabeçalho**
   - [ ] Título H1 descritivo
   - [ ] Subtítulo ou breadcrumb
   - [ ] Ação primária (se aplicável)

3. **Conteúdo**
   - [ ] Cards brancos sobre fundo cinza
   - [ ] Espaçamento consistente (space-6)
   - [ ] Responsive grid quando aplicável

4. **Componentes**
   - [ ] Usar componentes da biblioteca
   - [ ] Manter padrões de botões
   - [ ] Aplicar badges corretamente

5. **Estados**
   - [ ] Loading state
   - [ ] Empty state
   - [ ] Error state
   - [ ] Success feedback

6. **Responsividade**
   - [ ] Testar em mobile
   - [ ] Testar em tablet
   - [ ] Testar em desktop
   - [ ] Grid adapta colunas

7. **Acessibilidade**
   - [ ] Labels em inputs
   - [ ] Focus visível
   - [ ] Contraste adequado
   - [ ] Navegação por teclado

8. **Consistência**
   - [ ] Cores do design system
   - [ ] Tipografia padronizada
   - [ ] Espaçamentos do sistema
   - [ ] Ícones do Lucide React
