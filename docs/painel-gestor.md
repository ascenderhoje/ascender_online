# Painel de Gestor

## Visão Geral

O painel de gestor é acessível para usuários com `tipo_acesso = 'gestor'`. Oferece visualização das avaliações e dados dos colaboradores sob sua responsabilidade.

## Acesso

**Rota**: `/gestor/*`

**Autenticação**:
- Login via `/login`
- Verificação: `tipo_acesso = 'gestor'`
- Tabela: `pessoas`

## Estrutura do Menu

### Menu Principal (Sidebar)
1. **Dashboard** - Visão geral da equipe
2. **Minha Equipe** - Lista de colaboradores
3. **Avaliações** - Lista de avaliações da equipe

## Funcionalidades Detalhadas

### 1. Dashboard (`/gestor/dashboard`)

#### Visão Geral
Painel com métricas e informações resumidas da equipe.

#### Cards de Estatísticas
- **Total de Colaboradores**: Número de membros da equipe
- **Avaliações Pendentes**: Avaliações em rascunho
- **Avaliações Concluídas**: Avaliações finalizadas
- **Média Geral**: Média de pontuação da equipe

#### Gráficos e Visualizações
- **Evolução Temporal**: Gráfico de linha com avaliações ao longo do tempo
- **Por Competência**: Radar ou barra com médias por competência
- **Top Performers**: Lista dos colaboradores com melhor desempenho
- **Áreas de Melhoria**: Competências com menor pontuação

#### Atividades Recentes
Lista das últimas ações:
- Avaliações finalizadas
- Novos membros na equipe
- Atualizações de status

---

### 2. Minha Equipe (`/gestor/pessoas`)

#### Listagem
- Cards ou tabela com colaboradores dos grupos gerenciados
- Informações exibidas:
  - Nome do colaborador
  - Email
  - Função
  - Grupo(s)
  - Última avaliação
  - Status da última avaliação
- Busca por nome ou email
- Filtro por grupo

#### Visualizar Colaborador (`/gestor/pessoas/:id`)

**Informações Pessoais**:
- Nome completo
- Email
- Função
- Grupos
- Data de admissão (se disponível)
- Avatar

**Histórico de Avaliações**:
- Lista cronológica de todas as avaliações
- Para cada avaliação:
  - Data
  - Modelo utilizado
  - Status
  - Pontuação geral
  - Link para visualizar detalhes

**Gráficos de Evolução**:
- Evolução de competências ao longo do tempo
- Comparação com média do grupo
- Pontos fortes destacados
- Áreas de desenvolvimento

**Ações Disponíveis**:
- Visualizar avaliações completas
- Exportar histórico (futuro)
- Enviar mensagem/feedback (futuro)

#### Restrições
- Gestor NÃO pode:
  - Editar dados do colaborador
  - Criar ou editar avaliações
  - Excluir colaboradores
  - Alterar grupos

---

### 3. Avaliações (`/gestor/avaliacoes`)

#### Listagem
- Tabela com todas as avaliações dos grupos gerenciados
- Colunas:
  - Colaborador
  - Data da avaliação
  - Modelo
  - Status
  - Pontuação geral
  - Ações
- Filtros:
  - Por colaborador
  - Por status (rascunho/finalizada)
  - Por período
  - Por grupo
- Busca por nome do colaborador

#### Visualizar Avaliação (`/gestor/avaliacoes/:id`)

**Modo Somente Leitura**:
O gestor pode ver todas as informações da avaliação, mas não pode editar.

**Seções Visíveis**:

1. **Informações do Colaborador**:
   - Nome, email, função
   - Empresa e grupos
   - Data da avaliação

2. **Competências e Pontuações**:
   - Para cada competência:
     - Nome da competência
     - Lista de critérios com pontuações
     - Observações (se visibilidade permitir)
   - Gráfico visual (radar ou barras)
   - Média por competência

3. **Respostas às Perguntas**:
   - Perguntas personalizadas do modelo
   - Respostas do colaborador
   - Apenas perguntas com visibilidade "Gestor" ou "Todos"

4. **Análise da Avaliação**:
   - **Pontos Fortes**: Texto formatado
   - **Oportunidades de Melhoria**: Texto formatado
   - **Highlights**: Apenas se visibilidade permitir

5. **Observações Finais**:
   - Anotações gerais (se visibilidade permitir)

**Controle de Visibilidade**:
- Critérios marcados como "Avaliadores" não são exibidos
- Perguntas marcadas como "Colaborador" não são exibidas
- Highlights da Psicóloga podem ser ocultos

**Ações Disponíveis**:
- Imprimir avaliação (futuro)
- Exportar PDF (futuro)
- Voltar à lista

#### Restrições
- Gestor NÃO pode:
  - Criar novas avaliações
  - Editar avaliações existentes
  - Excluir avaliações
  - Alterar status de avaliações
  - Ver dados de colaboradores fora de seus grupos

---

## Recursos Globais

### Header
- Logo do sistema
- Nome do gestor logado
- Avatar
- Botão de logout

### Sidebar
- Menu de navegação
- Indicador da página atual
- Responsivo (colapsa em mobile)

### Notificações
- Badge de novas avaliações finalizadas
- Alertas de atividades importantes

### Filtros e Busca
- Barra de busca persistente
- Filtros contextuais por página
- Salvamento de preferências de filtro

## Permissões e Segurança

### Políticas RLS (Row Level Security)

#### Visualizar Pessoas
Gestor pode ver apenas pessoas dos grupos que gerencia:
```sql
CREATE POLICY "Gestores podem ver membros de seus grupos"
  ON pessoas FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT pg.pessoa_id
      FROM pessoas_grupos pg
      JOIN grupos_gestores gg ON pg.grupo_id = gg.grupo_id
      WHERE gg.pessoa_id = (
        SELECT id FROM pessoas WHERE auth_user_id = auth.uid()
      )
    )
  );
```

#### Visualizar Avaliações
Gestor pode ver avaliações dos colaboradores de seus grupos:
```sql
CREATE POLICY "Gestores podem ver avaliações de seus grupos"
  ON avaliacoes FOR SELECT
  TO authenticated
  USING (
    colaborador_id IN (
      SELECT pg.pessoa_id
      FROM pessoas_grupos pg
      JOIN grupos_gestores gg ON pg.grupo_id = gg.grupo_id
      WHERE gg.pessoa_id = (
        SELECT id FROM pessoas WHERE auth_user_id = auth.uid()
      )
    )
  );
```

### Validações no Frontend
- Rotas protegidas com `PrivateRoute`
- Verificação de `tipo_acesso = 'gestor'`
- UI sem botões de edição ou exclusão
- Redirecionamento automático se não autorizado

### Limitações
- **Sem permissão de escrita**: Gestor só pode ler dados
- **Escopo limitado**: Apenas seus grupos
- **Visibilidade controlada**: Alguns campos podem ser ocultos
- **Sem acesso admin**: Não pode gerenciar sistema

## Navegação

### Rotas Principais
- `/gestor/dashboard` - Dashboard do gestor
- `/gestor/pessoas` - Lista da equipe
- `/gestor/pessoas/:id` - Detalhes do colaborador
- `/gestor/avaliacoes` - Lista de avaliações
- `/gestor/avaliacoes/:id` - Visualizar avaliação

### Breadcrumbs
Cada página mostra o caminho de navegação.

## Casos de Uso

### Caso 1: Revisar Nova Avaliação
1. Gestor faz login
2. Vê notificação de nova avaliação finalizada
3. Acessa "Avaliações"
4. Clica em "Visualizar" na avaliação
5. Revisa todas as competências e pontuações
6. Lê análise completa
7. Pode imprimir ou exportar para reunião 1-on-1

### Caso 2: Acompanhar Evolução de Colaborador
1. Gestor acessa "Minha Equipe"
2. Busca por nome do colaborador
3. Clica no colaborador
4. Visualiza histórico de avaliações
5. Compara gráficos de evolução
6. Identifica padrões e tendências
7. Prepara feedback para próxima reunião

### Caso 3: Análise da Equipe
1. Gestor acessa Dashboard
2. Visualiza métricas gerais
3. Identifica competências com baixa média
4. Acessa avaliações específicas
5. Compara desempenho entre membros
6. Planeja treinamentos ou ações de desenvolvimento

## UX e Usabilidade

### Princípios de Design
- **Simplicidade**: Interface limpa e intuitiva
- **Foco em dados**: Visualizações claras e objetivas
- **Responsividade**: Funciona em todos os dispositivos
- **Feedback visual**: Loading states e confirmações

### Acessibilidade
- Contraste adequado de cores
- Textos legíveis
- Navegação por teclado
- Labels descritivos

### Performance
- Carregamento otimizado
- Paginação de listas longas
- Cache de dados frequentes
- Lazy loading de imagens

## Melhorias Futuras

### Planejadas
1. **Notificações em tempo real**: Push notifications
2. **Exportação avançada**: Excel, PDF customizado
3. **Comentários**: Adicionar notas em avaliações
4. **Comparações**: Benchmarking entre equipes
5. **Metas**: Definir e acompanhar objetivos
6. **Relatórios**: Reports automáticos periódicos
7. **Integração**: Calendário para reuniões de feedback
8. **Mobile App**: Aplicativo nativo iOS/Android

### Em Análise
- Sistema de badges/conquistas
- Gamificação de desenvolvimento
- IA para sugestões de desenvolvimento
- Integração com sistemas de RH
