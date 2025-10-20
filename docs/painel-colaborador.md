# Painel de Colaborador

## Visão Geral

O painel de colaborador é acessível para usuários com `tipo_acesso = 'colaborador'`. Oferece acesso às próprias avaliações em modo somente leitura.

## Acesso

**Rota**: `/dashboard` e `/avaliacoes/:id`

**Autenticação**:
- Login via `/login`
- Verificação: `tipo_acesso = 'colaborador'`
- Tabela: `pessoas`

## Estrutura do Menu

### Menu Principal (Sidebar)
1. **Dashboard** - Visão geral das avaliações
2. **Minhas Avaliações** - Lista de todas as avaliações

## Funcionalidades Detalhadas

### 1. Dashboard (`/dashboard`)

#### Visão Geral
Painel personalizado com informações do próprio colaborador.

#### Informações do Perfil
- **Foto de perfil** (avatar)
- **Nome completo**
- **Email**
- **Função**
- **Empresa**
- **Grupos** que participa

#### Cards de Estatísticas
- **Total de Avaliações**: Número total de avaliações realizadas
- **Última Avaliação**: Data da avaliação mais recente
- **Próxima Avaliação**: Data prevista (se agendada)
- **Pontuação Média**: Média geral das avaliações

#### Gráficos de Evolução
- **Evolução ao Longo do Tempo**:
  - Gráfico de linha mostrando progresso
  - Pontuações por data
  - Tendência de crescimento

- **Competências**:
  - Gráfico radar ou barras
  - Pontuação média por competência
  - Comparação entre avaliações

- **Pontos Fortes**:
  - Lista das competências com melhor desempenho
  - Badges ou destaque visual

- **Áreas de Desenvolvimento**:
  - Competências com oportunidade de melhoria
  - Sugestões de ações (se disponível)

#### Avaliações Recentes
Lista das últimas avaliações:
- Data da avaliação
- Status
- Pontuação geral
- Botão "Ver detalhes"

#### Mensagens e Notificações
- Alertas de novas avaliações disponíveis
- Mensagens dos gestores (futuro)
- Lembretes de ações de desenvolvimento

---

### 2. Minhas Avaliações (`/avaliacoes` quando colaborador)

#### Listagem
- Cards ou tabela com todas as avaliações do colaborador
- Informações exibidas:
  - Data da avaliação
  - Modelo utilizado
  - Status (Rascunho/Finalizada)
  - Pontuação geral
  - Preview de competências
- Ordenação: Mais recente primeiro
- Filtro por período
- Busca por modelo ou data

#### Status das Avaliações
- **Rascunho**: Ainda sendo preenchida pelo administrador
  - Pode ser visualizada parcialmente
  - Alguns campos podem estar vazios
- **Finalizada**: Avaliação completa e fechada
  - Todos os dados disponíveis
  - Não pode ser alterada

---

### 3. Visualizar Avaliação (`/avaliacoes/:id`)

#### Modo Somente Leitura
Colaborador visualiza sua própria avaliação de forma completa e estruturada.

**Seções Visíveis**:

#### 3.1. Cabeçalho
- Nome do colaborador
- Data da avaliação
- Modelo utilizado
- Status da avaliação
- Pontuação geral destacada

#### 3.2. Informações Básicas
- **Dados Pessoais**:
  - Nome, email, função
  - Empresa e grupos
  - Avatar

- **Responsáveis**:
  - Psicóloga responsável (se houver)
  - Data de realização

#### 3.3. Competências Avaliadas
Para cada competência do modelo:

**Estrutura**:
- Nome da competência
- Descrição (se disponível)
- Lista de critérios avaliados

**Para cada Critério**:
- Nome do critério
- Descrição detalhada
- Pontuação recebida (0-10)
- Barra visual de progresso
- Observações específicas
- Badge de destaque (se pontuação alta)

**Visualização Controlada**:
- Apenas critérios com visibilidade "Todos" ou "Colaborador"
- Critérios marcados como "Gestor" ou "Avaliadores" são ocultos

**Média por Competência**:
- Cálculo automático da média dos critérios
- Indicador visual (cor verde/amarelo/vermelho)
- Comparação com avaliações anteriores (se houver)

#### 3.4. Gráficos Visuais
- **Gráfico Radar**: Visão geral de todas as competências
- **Gráfico de Barras**: Comparação entre competências
- **Evolução**: Se houver avaliações anteriores, mostra progresso

#### 3.5. Perguntas Personalizadas
Respostas às perguntas do modelo:

**Exibição**:
- Pergunta completa
- Descrição/contexto
- Resposta fornecida
- Formatação adequada ao tipo:
  - Texto: Formatação simples
  - Múltipla escolha: Opções selecionadas destacadas
  - Escala: Valor numérico com indicador visual
  - Data: Formato legível

**Visibilidade**:
- Apenas perguntas com visibilidade "Todos" ou "Colaborador"
- Perguntas marcadas como "Gestor" são ocultas

#### 3.6. Análise da Avaliação

**Pontos Fortes**:
- Texto formatado destacando competências e comportamentos positivos
- Rich text com formatação
- Pode incluir exemplos específicos

**Oportunidades de Melhoria**:
- Texto formatado com áreas de desenvolvimento
- Sugestões construtivas
- Plano de ação (se incluído)

**Observações Finais**:
- Comentários gerais sobre a avaliação
- Contexto adicional
- Próximos passos sugeridos

**Nota**: Os textos "Highlights da Psicóloga" podem estar visíveis ou ocultos dependendo da configuração de visibilidade.

#### 3.7. Histórico e Comparação
Se colaborador tiver múltiplas avaliações:
- Seletor para comparar com avaliações anteriores
- Diferenças destacadas (melhora/piora)
- Gráfico de evolução temporal

#### 3.8. Ações Disponíveis
- **Imprimir**: Versão para impressão da avaliação
- **Exportar PDF**: Download em PDF (futuro)
- **Compartilhar**: Link temporário (futuro)
- **Voltar**: Retorna à lista de avaliações

---

## Recursos Globais

### Header
- Logo do sistema
- Nome do colaborador
- Avatar
- Botão de logout

### Sidebar
- Menu de navegação simples
- Indicador da página atual
- Responsivo

### Notificações
- Badge de novas avaliações disponíveis
- Alertas de mensagens importantes

### Feedback Visual
- Loading states durante carregamento
- Mensagens de erro amigáveis
- Tooltips explicativos

## Permissões e Segurança

### Políticas RLS (Row Level Security)

#### Visualizar Próprias Avaliações
Colaborador pode ver apenas suas próprias avaliações:
```sql
CREATE POLICY "Colaboradores podem ver próprias avaliações"
  ON avaliacoes FOR SELECT
  TO authenticated
  USING (
    colaborador_id = (
      SELECT id FROM pessoas WHERE auth_user_id = auth.uid()
    )
  );
```

#### Acesso Restrito
```sql
-- Não pode ver avaliações de outros
-- Não pode editar nenhuma avaliação
-- Não pode criar novas avaliações
-- Não pode excluir avaliações
```

### Validações no Frontend
- Rotas protegidas com `PrivateRoute`
- Verificação de `tipo_acesso = 'colaborador'`
- UI sem botões de edição
- Tentativa de acessar dados de outros resulta em erro

### Limitações
- **Apenas leitura**: Colaborador não pode editar nada
- **Escopo limitado**: Apenas seus próprios dados
- **Visibilidade controlada**: Alguns campos ocultos por configuração
- **Sem acesso administrativo**: Não vê dados de outros usuários

## UX e Experiência do Usuário

### Princípios de Design
- **Clareza**: Informações apresentadas de forma clara
- **Empatia**: Linguagem encorajadora e construtiva
- **Transparência**: Explicações de como a avaliação funciona
- **Motivação**: Destaque de conquistas e progresso

### Elementos Visuais
- **Cores**:
  - Verde: Pontuações altas, pontos fortes
  - Amarelo: Áreas de atenção
  - Azul: Informações neutras
  - Vermelho: Usado com moderação, apenas para dados importantes

- **Ícones**:
  - Troféu: Pontos fortes
  - Alvo: Objetivos e metas
  - Gráfico: Evolução
  - Estrela: Destaques

- **Animações**:
  - Transições suaves
  - Loading elegante
  - Hover effects informativos

### Acessibilidade
- Contraste adequado
- Textos legíveis (tamanho mínimo 14px)
- Alternativas textuais para gráficos
- Navegação por teclado

### Responsividade
- Design mobile-first
- Adapta layout para tablets e desktops
- Gráficos redimensionáveis
- Menu colapsável em mobile

## Casos de Uso

### Caso 1: Visualizar Nova Avaliação
1. Colaborador faz login
2. Vê notificação de nova avaliação disponível
3. Clica em "Ver avaliação" no dashboard
4. Lê informações gerais
5. Revisa cada competência e pontuação
6. Lê análise completa com pontos fortes e oportunidades
7. Anota pontos para discutir com gestor
8. Pode imprimir para reunião

### Caso 2: Comparar Evolução
1. Colaborador acessa "Minhas Avaliações"
2. Vê histórico de avaliações
3. Abre avaliação mais recente
4. Ativa modo "Comparar"
5. Seleciona avaliação anterior
6. Visualiza gráfico de evolução
7. Identifica áreas de melhora
8. Celebra progressos alcançados

### Caso 3: Planejamento Pessoal
1. Colaborador acessa Dashboard
2. Revisa "Áreas de Desenvolvimento"
3. Acessa avaliação completa
4. Lê "Oportunidades de Melhoria"
5. Identifica ações específicas
6. Cria plano pessoal de desenvolvimento
7. Compartilha com gestor na reunião 1-on-1

## Boas Práticas de Comunicação

### Linguagem na Interface
- **Tom positivo**: Foco em desenvolvimento, não em falhas
- **Construtivo**: Sempre com sugestões de melhoria
- **Claro**: Sem jargões ou termos técnicos complexos
- **Respeitoso**: Tratamento profissional e empático

### Apresentação de Dados
- **Contexto**: Sempre explicar o que significa cada métrica
- **Benchmark**: Quando possível, mostrar referências
- **Evolução**: Destacar progressos ao longo do tempo
- **Ação**: Sugerir próximos passos quando relevante

### Feedback Construtivo
Ao apresentar áreas de melhoria:
- Focar em comportamentos, não em personalidade
- Incluir exemplos específicos quando possível
- Sugerir ações práticas de desenvolvimento
- Equilibrar com pontos fortes

## Melhorias Futuras

### Planejadas
1. **Plano de Desenvolvimento Individual (PDI)**:
   - Criação de metas baseadas na avaliação
   - Acompanhamento de progresso
   - Check-ins regulares

2. **Comentários e Notas**:
   - Colaborador pode adicionar comentários próprios
   - Diário de desenvolvimento
   - Reflexões sobre feedback recebido

3. **Recursos de Aprendizado**:
   - Sugestões de cursos baseadas em competências
   - Biblioteca de materiais
   - Vídeos e artigos relacionados

4. **Gamificação**:
   - Badges por conquistas
   - Níveis de competência
   - Desafios de desenvolvimento

5. **Integração Social**:
   - Compartilhar conquistas (opcional)
   - Mentoria peer-to-peer
   - Grupos de estudo

6. **Notificações Inteligentes**:
   - Lembretes de metas
   - Sugestões personalizadas
   - Celebração de marcos

7. **Exportação Avançada**:
   - PDF personalizado
   - Portfólio de competências
   - Currículo baseado em avaliações

### Em Análise
- Autoavaliação antes da avaliação formal
- Solicitação de feedback 360°
- IA para sugestões personalizadas
- Integração com LinkedIn Learning
- App mobile nativo
