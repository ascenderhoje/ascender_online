# Sistema de Autenticação e Autorização

## Visão Geral

O sistema utiliza Supabase Auth para autenticação segura com email e senha. Existem dois fluxos de autenticação separados: um para administradores e outro para gestores/colaboradores.

## Tipos de Acesso

### 1. Administrador
- **Email e senha**: Gerenciados via Supabase Auth
- **Tabela**: `administradores`
- **Campo de vínculo**: `auth_user_id`
- **Acesso**: Painel administrativo completo
- **Rota inicial**: `/admin`

### 2. Gestor
- **Email e senha**: Gerenciados via Supabase Auth
- **Tabela**: `pessoas`
- **Campo de vínculo**: `auth_user_id`
- **Campo identificador**: `tipo_acesso = 'gestor'`
- **Acesso**: Visualização de equipe e avaliações
- **Rota inicial**: `/gestor/dashboard`

### 3. Colaborador
- **Email e senha**: Gerenciados via Supabase Auth
- **Tabela**: `pessoas`
- **Campo de vínculo**: `auth_user_id`
- **Campo identificador**: `tipo_acesso = 'colaborador'`
- **Acesso**: Visualização das próprias avaliações
- **Rota inicial**: `/dashboard`

## Fluxo de Autenticação

### Login
1. Usuário acessa `/login`
2. Insere email e senha
3. Sistema autentica via `supabase.auth.signInWithPassword()`
4. Sistema busca perfil do usuário em `administradores` ou `pessoas`
5. Define o tipo de acesso baseado na tabela encontrada
6. Redireciona para a rota apropriada

### Registro (Auto-cadastro desabilitado)
- Apenas administradores podem criar novos usuários
- Novos usuários são criados via Edge Function `user-management`
- Email de convite pode ser enviado (opcional)
- Primeiro acesso: usuário define senha

### Recuperação de Senha
1. Usuário acessa `/forgot-password`
2. Insere email cadastrado
3. Sistema envia email de recuperação via Supabase Auth
4. Usuário clica no link do email
5. Define nova senha

## Sessão e Persistência

### AuthContext
- Gerencia estado global de autenticação
- Mantém informações do usuário logado
- Persiste sessão via Supabase Auth
- Escuta mudanças de estado (`onAuthStateChange`)

### Estados de Autenticação
```typescript
type AuthState =
  | 'loading'           // Carregando informações
  | 'authenticated'     // Usuário autenticado
  | 'unauthenticated'   // Usuário não autenticado
```

### Informações do Usuário
```typescript
interface UserInfo {
  id: string;              // ID na tabela pessoas ou administradores
  email: string;           // Email do usuário
  nome: string;            // Nome completo
  tipo_acesso: string;     // 'admin', 'gestor' ou 'colaborador'
  empresa_id?: string;     // ID da empresa (gestores/colaboradores)
  avatar_url?: string;     // URL do avatar
}
```

## Proteção de Rotas

### PrivateRoute
- Protege rotas que requerem autenticação
- Redireciona para `/login` se não autenticado
- Usado para rotas de gestor e colaborador

### AdminRoute
- Protege rotas administrativas
- Verifica se `tipo_acesso === 'admin'`
- Redireciona para `/login` se não for administrador
- Usado para todas as rotas `/admin/*`

## Row Level Security (RLS)

### Políticas de Segurança

#### Administradores
```sql
-- Podem ver todos os registros de sua empresa
CREATE POLICY "Admins can view all data"
  ON table_name FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM administradores
      WHERE administradores.auth_user_id = auth.uid()
    )
  );
```

#### Gestores
```sql
-- Podem ver apenas dados de seus grupos
CREATE POLICY "Managers can view team data"
  ON pessoas FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM grupos_gestores
      JOIN pessoas_grupos ON grupos_gestores.grupo_id = pessoas_grupos.grupo_id
      WHERE grupos_gestores.pessoa_id IN (
        SELECT id FROM pessoas WHERE auth_user_id = auth.uid()
      )
      AND pessoas_grupos.pessoa_id = pessoas.id
    )
  );
```

#### Colaboradores
```sql
-- Podem ver apenas seus próprios dados
CREATE POLICY "Employees can view own data"
  ON avaliacoes FOR SELECT
  TO authenticated
  USING (
    colaborador_id IN (
      SELECT id FROM pessoas WHERE auth_user_id = auth.uid()
    )
  );
```

## Edge Functions de Autenticação

### user-management
Gerencia operações relacionadas a usuários:
- Criar novo usuário (admin ou pessoa)
- Enviar convite por email
- Atualizar informações de usuário
- Desativar/ativar usuário

**Endpoint**: `POST /functions/v1/user-management`

**Payload para criar usuário**:
```json
{
  "action": "create",
  "email": "usuario@example.com",
  "nome": "Nome do Usuário",
  "tipo_acesso": "gestor",
  "empresa_id": "uuid-da-empresa",
  "send_invite": true
}
```

### admin-users
Gerencia operações específicas de administradores:
- Listar administradores
- Atualizar permissões
- Gerenciar acesso a múltiplas empresas

**Endpoint**: `POST /functions/v1/admin-users`

## Segurança

### Boas Práticas Implementadas
1. **Senhas**: Hash automático via Supabase Auth
2. **Tokens**: JWT gerenciado pelo Supabase
3. **RLS**: Políticas restritivas por padrão
4. **CORS**: Configurado corretamente nas Edge Functions
5. **Validação**: Email único por tabela
6. **Sessão**: Expiração automática após inatividade

### Proteções
- Senhas nunca são armazenadas em plain text
- Tokens JWT com expiração
- Rate limiting no Supabase Auth
- Verificação de email obrigatória (pode ser configurada)
- Políticas RLS impedem acesso não autorizado

## Troubleshooting

### Usuário não consegue fazer login
1. Verificar se email está correto
2. Verificar se usuário está ativo (`ativo = true`)
3. Verificar se `auth_user_id` está preenchido
4. Verificar se há registro em `auth.users`

### Redirecionamento incorreto após login
1. Verificar `tipo_acesso` na tabela
2. Verificar lógica no `AuthContext`
3. Verificar rotas protegidas

### Erro de permissão ao acessar dados
1. Verificar políticas RLS
2. Verificar se `auth.uid()` está correto
3. Verificar relacionamentos entre tabelas
