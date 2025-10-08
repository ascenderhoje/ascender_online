/*
  # Permitir acesso público para desenvolvimento
  
  ## Descrição
  Remove as políticas restritivas e adiciona políticas permissivas para permitir
  operações sem autenticação durante o desenvolvimento.
  
  ## Segurança
  ⚠️ IMPORTANTE: Estas políticas são para DESENVOLVIMENTO apenas.
  Devem ser substituídas por políticas restritivas em produção.
*/

-- Remover todas as políticas existentes
DROP POLICY IF EXISTS "Admins can delete empresas" ON empresas;
DROP POLICY IF EXISTS "Admins can insert empresas" ON empresas;
DROP POLICY IF EXISTS "Admins can update empresas" ON empresas;
DROP POLICY IF EXISTS "Admins can view all empresas" ON empresas;
DROP POLICY IF EXISTS "Gestors can view their empresa" ON empresas;

DROP POLICY IF EXISTS "Admins can delete pessoas" ON pessoas;
DROP POLICY IF EXISTS "Admins can insert pessoas" ON pessoas;
DROP POLICY IF EXISTS "Admins can update all pessoas" ON pessoas;
DROP POLICY IF EXISTS "Admins can view all pessoas" ON pessoas;
DROP POLICY IF EXISTS "Gestors can insert pessoas in their empresa" ON pessoas;
DROP POLICY IF EXISTS "Gestors can update pessoas from their empresa" ON pessoas;
DROP POLICY IF EXISTS "Gestors can view pessoas from their empresa" ON pessoas;
DROP POLICY IF EXISTS "Users can update their own data" ON pessoas;
DROP POLICY IF EXISTS "Users can view their own data" ON pessoas;

DROP POLICY IF EXISTS "Admins and gestors can delete grupos" ON grupos;
DROP POLICY IF EXISTS "Admins and gestors can insert grupos" ON grupos;
DROP POLICY IF EXISTS "Admins and gestors can update grupos" ON grupos;
DROP POLICY IF EXISTS "Authenticated users can view grupos" ON grupos;

DROP POLICY IF EXISTS "Admins and gestors can manage empresas_grupos" ON empresas_grupos;
DROP POLICY IF EXISTS "Authenticated users can view empresas_grupos" ON empresas_grupos;

DROP POLICY IF EXISTS "Admins and gestors can manage pessoas_grupos" ON pessoas_grupos;
DROP POLICY IF EXISTS "Authenticated users can view pessoas_grupos" ON pessoas_grupos;

-- Criar políticas permissivas para desenvolvimento
CREATE POLICY "Allow public access to empresas"
  ON empresas FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public access to pessoas"
  ON pessoas FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public access to grupos"
  ON grupos FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public access to empresas_grupos"
  ON empresas_grupos FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public access to pessoas_grupos"
  ON pessoas_grupos FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);
