# Estrutura do Banco de Dados

## Visão Geral

O sistema utiliza PostgreSQL via Supabase com Row Level Security (RLS) ativado em todas as tabelas para garantir segurança e isolamento de dados.

## Diagrama de Relacionamentos

```
empresas
├── pessoas
│   ├── avaliacoes (como colaborador)
│   ├── pessoas_grupos
│   └── grupos_gestores
├── grupos
│   ├── pessoas_grupos
│   └── grupos_gestores
├── competencias
│   ├── criterios
│   │   └── criterios_textos
│   └── modelos_competencias
├── modelos_avaliacao
│   ├── modelos_competencias
│   ├── perguntas_personalizadas
│   │   └── perguntas_personalizadas_textos
│   └── avaliacoes
└── administradores
    ├── avaliacoes (como psicologa ou editor)
    └── administradores_empresas

avaliacoes
├── avaliacoes_competencias
├── avaliacoes_respostas
└── avaliacoes_textos
```

## Tabelas Principais

### 1. empresas
Cadastro de empresas clientes.

**Campos**:
- `id` (uuid, PK): Identificador único
- `nome` (text, NOT NULL): Nome da empresa
- `cidade` (text): Localização
- `regua` (int, default 0): Escala de avaliação
- `valido_ate` (date): Validade da licença
- `avatar_url` (text): Logo da empresa
- `ativo` (boolean, default true): Status
- `created_at` (timestamptz): Data de criação
- `updated_at` (timestamptz): Última atualização

**Relacionamentos**:
- 1:N com `pessoas`
- 1:N com `grupos`
- 1:N com `competencias`
- 1:N com `modelos_avaliacao`
- 1:N com `avaliacoes`

---

### 2. pessoas
Colaboradores e gestores do sistema.

**Campos**:
- `id` (uuid, PK): Identificador único
- `nome` (text, NOT NULL): Nome completo
- `email` (text, UNIQUE, NOT NULL): Email único
- `idioma` (text, default 'pt-BR'): Idioma preferido
- `genero` (text): Gênero
- `empresa_id` (uuid, FK): Empresa vinculada
- `funcao` (text): Cargo/função
- `avatar_url` (text): Foto de perfil
- `tipo_acesso` (text, NOT NULL): 'admin', 'gestor' ou 'colaborador'
- `auth_user_id` (uuid, UNIQUE, FK): Vínculo com auth.users
- `senha_definida` (boolean, default false): Se senha foi configurada
- `ultimo_login` (timestamptz): Data do último acesso
- `ativo` (boolean, default true): Status
- `created_at` (timestamptz): Data de criação
- `updated_at` (timestamptz): Última atualização

**Constraints**:
- `CHECK (tipo_acesso IN ('admin', 'gestor', 'colaborador'))`

**Relacionamentos**:
- N:1 com `empresas`
- 1:1 com `auth.users` (Supabase Auth)
- N:M com `grupos` (via `pessoas_grupos`)
- N:M como gestor (via `grupos_gestores`)
- 1:N com `avaliacoes` (como colaborador)

---

### 3. grupos
Organização de colaboradores em equipes.

**Campos**:
- `id` (uuid, PK): Identificador único
- `nome` (text, NOT NULL): Nome do grupo
- `empresa_id` (uuid, FK): Empresa vinculada
- `created_at` (timestamptz): Data de criação
- `updated_at` (timestamptz): Última atualização

**Relacionamentos**:
- N:1 com `empresas`
- N:M com `pessoas` (via `pessoas_grupos`)
- N:M com gestores (via `grupos_gestores`)

---

### 4. pessoas_grupos
Tabela de associação entre pessoas e grupos.

**Campos**:
- `pessoa_id` (uuid, PK, FK): Referência à pessoa
- `grupo_id` (uuid, PK, FK): Referência ao grupo
- `created_at` (timestamptz): Data de criação

**Chave Primária Composta**: (`pessoa_id`, `grupo_id`)

---

### 5. grupos_gestores
Gestores responsáveis por grupos.

**Campos**:
- `grupo_id` (uuid, PK, FK): Referência ao grupo
- `pessoa_id` (uuid, PK, FK): Referência ao gestor
- `created_at` (timestamptz): Data de criação

**Chave Primária Composta**: (`grupo_id`, `pessoa_id`)

**Constraint Implícita**: `pessoa_id` deve ter `tipo_acesso = 'gestor'`

---

### 6. competencias
Biblioteca de competências avaliáveis.

**Campos**:
- `id` (uuid, PK): Identificador único
- `nome` (text, NOT NULL): Nome da competência
- `fixo` (boolean, default false): Se é padrão do sistema
- `empresa_id` (uuid, FK, nullable): Empresa (null = global)
- `status` (text, default 'ativo'): 'ativo' ou 'arquivado'
- `created_at` (timestamptz): Data de criação
- `updated_at` (timestamptz): Última atualização

**Constraints**:
- `CHECK (status IN ('ativo', 'arquivado'))`

**Relacionamentos**:
- N:1 com `empresas` (opcional)
- 1:N com `criterios`
- N:M com `modelos_avaliacao` (via `modelos_competencias`)

---

### 7. criterios
Critérios de avaliação de competências.

**Campos**:
- `id` (uuid, PK): Identificador único
- `competencia_id` (uuid, FK, NOT NULL): Competência relacionada
- `visibilidade` (text, default 'todos'): Quem pode ver
- `ordem` (int, default 0): Ordem de exibição
- `created_at` (timestamptz): Data de criação
- `updated_at` (timestamptz): Última atualização

**Constraints**:
- `CHECK (visibilidade IN ('todos', 'gestor', 'avaliadores'))`

**Relacionamentos**:
- N:1 com `competencias`
- 1:N com `criterios_textos` (internacionalização)
- 1:N com `avaliacoes_competencias`

---

### 8. criterios_textos
Textos multilíngues dos critérios.

**Campos**:
- `id` (uuid, PK): Identificador único
- `criterio_id` (uuid, FK, NOT NULL): Critério relacionado
- `idioma` (text, NOT NULL): 'pt-BR', 'en-US', 'es-ES'
- `nome` (text, NOT NULL): Nome do critério
- `descricao` (text): Descrição detalhada
- `idioma_padrao` (boolean, default false): Se é o idioma principal

**Constraints**:
- `CHECK (idioma IN ('pt-BR', 'en-US', 'es-ES'))`
- UNIQUE (`criterio_id`, `idioma`)

**Relacionamentos**:
- N:1 com `criterios`

---

### 9. modelos_avaliacao
Templates de avaliação.

**Campos**:
- `id` (uuid, PK): Identificador único
- `nome` (text, NOT NULL): Nome do modelo
- `status` (text, default 'rascunho'): 'rascunho' ou 'publicado'
- `empresa_id` (uuid, FK): Empresa vinculada
- `created_at` (timestamptz): Data de criação
- `updated_at` (timestamptz): Última atualização

**Constraints**:
- `CHECK (status IN ('rascunho', 'publicado'))`

**Relacionamentos**:
- N:1 com `empresas`
- N:M com `competencias` (via `modelos_competencias`)
- 1:N com `perguntas_personalizadas`
- 1:N com `avaliacoes`

---

### 10. modelos_competencias
Associação entre modelos e competências.

**Campos**:
- `modelo_id` (uuid, PK, FK): Referência ao modelo
- `competencia_id` (uuid, PK, FK): Referência à competência
- `ordem` (int, default 0): Ordem de exibição

**Chave Primária Composta**: (`modelo_id`, `competencia_id`)

---

### 11. perguntas_personalizadas
Perguntas customizadas dos modelos.

**Campos**:
- `id` (uuid, PK): Identificador único
- `modelo_id` (uuid, FK, NOT NULL): Modelo relacionado
- `tipo_resposta` (text): Tipo da pergunta
- `titulo` (text): Título da pergunta (depreciado, usar textos)
- `descricao` (text): Descrição (depreciado, usar textos)
- `obrigatorio` (boolean, default false): Se é obrigatória
- `ordem` (int, default 0): Ordem de exibição
- `opcoes` (jsonb, default '[]'): Opções para múltipla escolha
- `visibilidade` (text, default 'todos'): Quem pode ver
- `created_at` (timestamptz): Data de criação

**Constraints**:
```sql
CHECK (tipo_resposta IN (
  'texto',
  'texto_longo',
  'multipla_escolha_unica',
  'multipla_escolha_multipla',
  'escala_numerica',
  'escala_likert',
  'data',
  'upload'
))

CHECK (visibilidade IN ('colaborador', 'gestor', 'todos'))
```

**Relacionamentos**:
- N:1 com `modelos_avaliacao`
- 1:N com `perguntas_personalizadas_textos`
- 1:N com `avaliacoes_respostas`

---

### 12. perguntas_personalizadas_textos
Textos multilíngues das perguntas.

**Campos**:
- `id` (uuid, PK): Identificador único
- `pergunta_id` (uuid, FK, NOT NULL): Pergunta relacionada
- `idioma` (text, NOT NULL): Código do idioma
- `titulo` (text, NOT NULL): Título da pergunta
- `descricao` (text, default ''): Descrição/ajuda
- `idioma_padrao` (boolean, default false): Se é o idioma principal
- `created_at` (timestamptz): Data de criação
- `updated_at` (timestamptz): Última atualização

**Relacionamentos**:
- N:1 com `perguntas_personalizadas`

---

### 13. administradores
Usuários administradores do sistema.

**Campos**:
- `id` (uuid, PK): Identificador único
- `nome` (text, NOT NULL): Nome completo
- `email` (text, UNIQUE, NOT NULL): Email único
- `telefone` (text): Telefone de contato
- `ativo` (boolean, default true): Status
- `e_administrador` (boolean, default false): Se é admin
- `e_psicologa` (boolean, default false): Se é psicóloga
- `empresa_padrao_id` (uuid, FK): Empresa principal
- `avatar_url` (text): Foto de perfil
- `auth_user_id` (uuid, UNIQUE, FK): Vínculo com auth.users
- `ultimo_login` (timestamptz): Data do último acesso
- `created_at` (timestamptz): Data de criação
- `updated_at` (timestamptz): Última atualização

**Relacionamentos**:
- 1:1 com `auth.users`
- N:1 com `empresas` (empresa padrão)
- N:M com `empresas` (via `administradores_empresas`)
- 1:N com `avaliacoes` (como psicóloga ou editor)

---

### 14. administradores_empresas
Empresas vinculadas a administradores.

**Campos**:
- `id` (uuid, PK): Identificador único
- `administrador_id` (uuid, FK): Referência ao admin
- `empresa_id` (uuid, FK): Referência à empresa
- `created_at` (timestamptz): Data de criação

**Unique**: (`administrador_id`, `empresa_id`)

---

### 15. avaliacoes
Avaliações realizadas.

**Campos**:
- `id` (uuid, PK): Identificador único
- `data_avaliacao` (date, NOT NULL): Data da avaliação
- `empresa_id` (uuid, FK, NOT NULL): Empresa
- `colaborador_id` (uuid, FK, NOT NULL): Colaborador avaliado
- `modelo_id` (uuid, FK): Modelo utilizado
- `psicologa_responsavel_id` (uuid, FK): Psicóloga responsável
- `colaborador_email` (text): Email do colaborador (cache)
- `status` (text, default 'rascunho'): Status da avaliação
- `observacoes` (text): Observações gerais
- `editing_user_id` (uuid, FK): Quem está editando
- `editing_user_name` (text): Nome de quem edita (cache)
- `editing_started_at` (timestamptz): Início da edição
- `created_at` (timestamptz): Data de criação
- `updated_at` (timestamptz): Última atualização

**Constraints**:
- `CHECK (status IN ('rascunho', 'finalizada'))`

**Relacionamentos**:
- N:1 com `empresas`
- N:1 com `pessoas` (colaborador)
- N:1 com `modelos_avaliacao`
- N:1 com `administradores` (psicóloga e editor)
- 1:N com `avaliacoes_competencias`
- 1:N com `avaliacoes_respostas`
- 1:N com `avaliacoes_textos`

---

### 16. avaliacoes_competencias
Pontuações dos critérios de cada avaliação.

**Campos**:
- `id` (uuid, PK): Identificador único
- `avaliacao_id` (uuid, FK, NOT NULL): Avaliação relacionada
- `competencia_id` (uuid, FK, NOT NULL): Competência avaliada
- `criterio_id` (uuid, FK, NOT NULL): Critério pontuado
- `pontuacao` (numeric): Pontuação (0-10)
- `observacoes` (text): Comentários sobre o critério
- `created_at` (timestamptz): Data de criação
- `updated_at` (timestamptz): Última atualização

**Relacionamentos**:
- N:1 com `avaliacoes`
- N:1 com `competencias`
- N:1 com `criterios`

---

### 17. avaliacoes_respostas
Respostas às perguntas personalizadas.

**Campos**:
- `id` (uuid, PK): Identificador único
- `avaliacao_id` (uuid, FK, NOT NULL): Avaliação relacionada
- `pergunta_id` (uuid, FK, NOT NULL): Pergunta respondida
- `resposta_texto` (text): Resposta em texto
- `resposta_opcoes` (jsonb, default '[]'): Opções selecionadas
- `resposta_numero` (numeric): Resposta numérica
- `resposta_data` (date): Resposta em data
- `created_at` (timestamptz): Data de criação
- `updated_at` (timestamptz): Última atualização

**Relacionamentos**:
- N:1 com `avaliacoes`
- N:1 com `perguntas_personalizadas`

---

### 18. avaliacoes_textos
Textos multilíngues das avaliações.

**Campos**:
- `id` (uuid, PK): Identificador único
- `avaliacao_id` (uuid, FK, NOT NULL): Avaliação relacionada
- `idioma` (text, NOT NULL): Código do idioma
- `oportunidades_melhoria` (text, default ''): Áreas a melhorar
- `pontos_fortes` (text, default ''): Pontos positivos
- `highlights_psicologa` (text, default ''): Destaques da psicóloga
- `idioma_padrao` (boolean, default false): Se é o idioma principal
- `created_at` (timestamptz): Data de criação
- `updated_at` (timestamptz): Última atualização

**Constraints**:
- `CHECK (idioma IN ('pt-BR', 'en-US', 'es-ES'))`

**Relacionamentos**:
- N:1 com `avaliacoes`

---

### 19. perfis
Perfis de permissão (futuro).

**Campos**:
- `id` (uuid, PK): Identificador único
- `nome` (text, NOT NULL): Nome do perfil
- `descricao` (text): Descrição
- `permissoes` (jsonb, default '{}'): Objeto JSON de permissões
- `created_at` (timestamptz): Data de criação
- `updated_at` (timestamptz): Última atualização

**Status**: Placeholder - não implementado

---

## Índices

### Índices Principais
```sql
-- Busca de pessoas por email
CREATE INDEX idx_pessoas_email ON pessoas(email);
CREATE INDEX idx_pessoas_auth_user_id ON pessoas(auth_user_id);

-- Busca de administradores
CREATE INDEX idx_administradores_email ON administradores(email);
CREATE INDEX idx_administradores_auth_user_id ON administradores(auth_user_id);

-- Avaliações por colaborador
CREATE INDEX idx_avaliacoes_colaborador ON avaliacoes(colaborador_id);

-- Avaliações por empresa e data
CREATE INDEX idx_avaliacoes_empresa_data ON avaliacoes(empresa_id, data_avaliacao DESC);

-- Competências de modelos
CREATE INDEX idx_modelos_competencias_modelo ON modelos_competencias(modelo_id);

-- Critérios por competência
CREATE INDEX idx_criterios_competencia ON criterios(competencia_id);

-- Grupos de pessoas
CREATE INDEX idx_pessoas_grupos_pessoa ON pessoas_grupos(pessoa_id);
CREATE INDEX idx_pessoas_grupos_grupo ON pessoas_grupos(grupo_id);

-- Gestores de grupos
CREATE INDEX idx_grupos_gestores_pessoa ON grupos_gestores(pessoa_id);
CREATE INDEX idx_grupos_gestores_grupo ON grupos_gestores(grupo_id);
```

---

## Row Level Security (RLS)

### Princípios
1. **Restritivo por padrão**: Todas as tabelas têm RLS habilitado
2. **Autenticação obrigatória**: Apenas usuários autenticados
3. **Segregação por empresa**: Dados isolados por empresa
4. **Hierarquia respeitada**: Gestores veem apenas seus grupos

### Políticas Principais

#### Administradores - Acesso Total
```sql
-- Administradores podem ver dados de empresas vinculadas
CREATE POLICY "Admins can view company data"
  ON pessoas FOR SELECT
  TO authenticated
  USING (
    empresa_id IN (
      SELECT empresa_id
      FROM administradores_empresas
      WHERE administrador_id = (
        SELECT id FROM administradores WHERE auth_user_id = auth.uid()
      )
    )
  );
```

#### Gestores - Acesso a Grupos
```sql
-- Gestores podem ver membros de seus grupos
CREATE POLICY "Managers can view team members"
  ON pessoas FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT pg.pessoa_id
      FROM pessoas_grupos pg
      JOIN grupos_gestores gg ON pg.grupo_id = gg.grupo_id
      WHERE gg.pessoa_id IN (
        SELECT id FROM pessoas WHERE auth_user_id = auth.uid()
      )
    )
    OR id IN (
      SELECT id FROM pessoas WHERE auth_user_id = auth.uid()
    )
  );
```

#### Colaboradores - Próprios Dados
```sql
-- Colaboradores podem ver apenas seus dados
CREATE POLICY "Employees can view own data"
  ON avaliacoes FOR SELECT
  TO authenticated
  USING (
    colaborador_id IN (
      SELECT id FROM pessoas WHERE auth_user_id = auth.uid()
    )
  );
```

---

## Migrations

Todas as alterações no schema são gerenciadas via migrations em `supabase/migrations/`.

### Convenção de Nomes
```
YYYYMMDDHHMMSS_descricao_da_mudanca.sql
```

### Exemplo de Migration
```sql
/*
  # Título da Migration

  1. Descrição
     - O que está sendo alterado
     - Por que está sendo alterado

  2. Changes
     - Lista de mudanças

  3. Security
     - Políticas RLS
*/

-- Sua SQL aqui
```

---

## Funções Auxiliares

### get_user_id()
Retorna o ID da pessoa ou administrador logado.

```sql
CREATE OR REPLACE FUNCTION get_user_id()
RETURNS uuid AS $$
BEGIN
  RETURN (
    SELECT COALESCE(
      (SELECT id FROM pessoas WHERE auth_user_id = auth.uid()),
      (SELECT id FROM administradores WHERE auth_user_id = auth.uid())
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## Triggers

### update_updated_at
Atualiza automaticamente `updated_at` em todas as tabelas.

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicado em todas as tabelas com updated_at
CREATE TRIGGER update_pessoas_updated_at
  BEFORE UPDATE ON pessoas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

## Backup e Manutenção

### Estratégia de Backup
- Backups automáticos diários via Supabase
- Retenção de 7 dias
- Point-in-time recovery disponível

### Limpeza de Dados
- Logs de edição expiram após 30 minutos
- Avaliações em rascunho sem atividade por 90 dias (alerta)
- Usuários inativos não são excluídos automaticamente

---

## Performance

### Otimizações Implementadas
1. **Índices estratégicos**: Em FKs e campos de busca
2. **Paginação**: Todas as listagens são paginadas
3. **Queries otimizadas**: Evitar N+1, usar joins
4. **Cache no frontend**: Dados estáticos em memória
5. **RLS eficiente**: Políticas indexadas

### Monitoramento
- Slow queries logadas
- Uso de conexões monitorado
- Tamanho de tabelas acompanhado

---

## Extensões PostgreSQL

### Utilizadas
- `uuid-ossp`: Geração de UUIDs
- `pgcrypto`: Funções criptográficas
- `pg_stat_statements`: Monitoramento de queries

---

## Considerações de Segurança

### Implementadas
1. ✅ RLS em todas as tabelas
2. ✅ Autenticação obrigatória
3. ✅ Senhas hasheadas (Supabase Auth)
4. ✅ Emails únicos
5. ✅ Foreign keys com ON DELETE
6. ✅ Validações via CHECK constraints
7. ✅ Políticas restritivas por padrão

### Recomendações
- Revisar políticas RLS regularmente
- Auditar acessos suspeitos
- Manter Supabase atualizado
- Backup testado mensalmente
