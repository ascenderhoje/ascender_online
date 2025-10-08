/*
  # Update RLS Policies for Supabase Auth

  ## Overview
  This migration updates Row Level Security policies across all tables to use Supabase Auth (auth.uid())
  instead of public access. This ensures only authenticated administrators can access data.

  ## Security Model
  - Only authenticated users with valid auth.uid() can access data
  - Administrators (e_administrador = true) can read/write all data
  - Psychologists (e_psicologa = true) can read/write all data
  - Users must be active (ativo = true) to access any data

  ## Tables Updated
  1. administradores - Users can only read their own data, admins can read all
  2. empresas - Full access for active admins/psychologists
  3. grupos - Full access for active admins/psychologists
  4. pessoas - Full access for active admins/psychologists
  5. competencias - Full access for active admins/psychologists
  6. modelos - Full access for active admins/psychologists
  7. avaliacoes - Full access for active admins/psychologists
  8. All junction tables - Full access for active admins/psychologists

  ## Important Notes
  - All existing public policies are dropped
  - New policies require authentication
  - Service role bypasses RLS (for admin operations)
*/

-- Drop all existing public policies
DROP POLICY IF EXISTS "Allow public read access to empresas" ON empresas;
DROP POLICY IF EXISTS "Allow public write access to empresas" ON empresas;
DROP POLICY IF EXISTS "Allow public read access to grupos" ON grupos;
DROP POLICY IF EXISTS "Allow public write access to grupos" ON grupos;
DROP POLICY IF EXISTS "Allow public read access to pessoas" ON pessoas;
DROP POLICY IF EXISTS "Allow public write access to pessoas" ON pessoas;
DROP POLICY IF EXISTS "Allow public read access to pessoas_grupos" ON pessoas_grupos;
DROP POLICY IF EXISTS "Allow public write access to pessoas_grupos" ON pessoas_grupos;
DROP POLICY IF EXISTS "Allow public read access to grupos_gestores" ON grupos_gestores;
DROP POLICY IF EXISTS "Allow public write access to grupos_gestores" ON grupos_gestores;
DROP POLICY IF EXISTS "Allow public read access to administradores" ON administradores;
DROP POLICY IF EXISTS "Allow public write access to administradores" ON administradores;
DROP POLICY IF EXISTS "Allow public read access to competencias" ON competencias;
DROP POLICY IF EXISTS "Allow public write access to competencias" ON competencias;
DROP POLICY IF EXISTS "Allow public read access to modelos" ON modelos;
DROP POLICY IF EXISTS "Allow public write access to modelos" ON modelos;
DROP POLICY IF EXISTS "Allow public read access to avaliacoes" ON avaliacoes;
DROP POLICY IF EXISTS "Allow public write access to avaliacoes" ON avaliacoes;

-- ADMINISTRADORES TABLE POLICIES
-- Users can read their own profile, admins can read all
CREATE POLICY "Authenticated users can read own profile"
  ON administradores FOR SELECT
  TO authenticated
  USING (auth.uid() = auth_user_id OR is_active_admin(auth.uid()));

-- Admins can insert new administrators
CREATE POLICY "Active admins can insert administrators"
  ON administradores FOR INSERT
  TO authenticated
  WITH CHECK (is_active_admin(auth.uid()));

-- Users can update their own profile, admins can update all
CREATE POLICY "Users can update own profile or admins can update all"
  ON administradores FOR UPDATE
  TO authenticated
  USING (auth.uid() = auth_user_id OR is_active_admin(auth.uid()))
  WITH CHECK (auth.uid() = auth_user_id OR is_active_admin(auth.uid()));

-- Only admins can delete administrators
CREATE POLICY "Active admins can delete administrators"
  ON administradores FOR DELETE
  TO authenticated
  USING (is_active_admin(auth.uid()));

-- EMPRESAS TABLE POLICIES
CREATE POLICY "Active admins can read empresas"
  ON empresas FOR SELECT
  TO authenticated
  USING (is_active_admin(auth.uid()));

CREATE POLICY "Active admins can insert empresas"
  ON empresas FOR INSERT
  TO authenticated
  WITH CHECK (is_active_admin(auth.uid()));

CREATE POLICY "Active admins can update empresas"
  ON empresas FOR UPDATE
  TO authenticated
  USING (is_active_admin(auth.uid()))
  WITH CHECK (is_active_admin(auth.uid()));

CREATE POLICY "Active admins can delete empresas"
  ON empresas FOR DELETE
  TO authenticated
  USING (is_active_admin(auth.uid()));

-- GRUPOS TABLE POLICIES
CREATE POLICY "Active admins can read grupos"
  ON grupos FOR SELECT
  TO authenticated
  USING (is_active_admin(auth.uid()));

CREATE POLICY "Active admins can insert grupos"
  ON grupos FOR INSERT
  TO authenticated
  WITH CHECK (is_active_admin(auth.uid()));

CREATE POLICY "Active admins can update grupos"
  ON grupos FOR UPDATE
  TO authenticated
  USING (is_active_admin(auth.uid()))
  WITH CHECK (is_active_admin(auth.uid()));

CREATE POLICY "Active admins can delete grupos"
  ON grupos FOR DELETE
  TO authenticated
  USING (is_active_admin(auth.uid()));

-- PESSOAS TABLE POLICIES
CREATE POLICY "Active admins can read pessoas"
  ON pessoas FOR SELECT
  TO authenticated
  USING (is_active_admin(auth.uid()));

CREATE POLICY "Active admins can insert pessoas"
  ON pessoas FOR INSERT
  TO authenticated
  WITH CHECK (is_active_admin(auth.uid()));

CREATE POLICY "Active admins can update pessoas"
  ON pessoas FOR UPDATE
  TO authenticated
  USING (is_active_admin(auth.uid()))
  WITH CHECK (is_active_admin(auth.uid()));

CREATE POLICY "Active admins can delete pessoas"
  ON pessoas FOR DELETE
  TO authenticated
  USING (is_active_admin(auth.uid()));

-- PESSOAS_GRUPOS TABLE POLICIES
CREATE POLICY "Active admins can read pessoas_grupos"
  ON pessoas_grupos FOR SELECT
  TO authenticated
  USING (is_active_admin(auth.uid()));

CREATE POLICY "Active admins can insert pessoas_grupos"
  ON pessoas_grupos FOR INSERT
  TO authenticated
  WITH CHECK (is_active_admin(auth.uid()));

CREATE POLICY "Active admins can delete pessoas_grupos"
  ON pessoas_grupos FOR DELETE
  TO authenticated
  USING (is_active_admin(auth.uid()));

-- GRUPOS_GESTORES TABLE POLICIES
CREATE POLICY "Active admins can read grupos_gestores"
  ON grupos_gestores FOR SELECT
  TO authenticated
  USING (is_active_admin(auth.uid()));

CREATE POLICY "Active admins can insert grupos_gestores"
  ON grupos_gestores FOR INSERT
  TO authenticated
  WITH CHECK (is_active_admin(auth.uid()));

CREATE POLICY "Active admins can delete grupos_gestores"
  ON grupos_gestores FOR DELETE
  TO authenticated
  USING (is_active_admin(auth.uid()));

-- COMPETENCIAS TABLE POLICIES
CREATE POLICY "Active admins can read competencias"
  ON competencias FOR SELECT
  TO authenticated
  USING (is_active_admin(auth.uid()));

CREATE POLICY "Active admins can insert competencias"
  ON competencias FOR INSERT
  TO authenticated
  WITH CHECK (is_active_admin(auth.uid()));

CREATE POLICY "Active admins can update competencias"
  ON competencias FOR UPDATE
  TO authenticated
  USING (is_active_admin(auth.uid()))
  WITH CHECK (is_active_admin(auth.uid()));

CREATE POLICY "Active admins can delete competencias"
  ON competencias FOR DELETE
  TO authenticated
  USING (is_active_admin(auth.uid()));

-- MODELOS_AVALIACAO TABLE POLICIES
CREATE POLICY "Active admins can read modelos_avaliacao"
  ON modelos_avaliacao FOR SELECT
  TO authenticated
  USING (is_active_admin(auth.uid()));

CREATE POLICY "Active admins can insert modelos_avaliacao"
  ON modelos_avaliacao FOR INSERT
  TO authenticated
  WITH CHECK (is_active_admin(auth.uid()));

CREATE POLICY "Active admins can update modelos_avaliacao"
  ON modelos_avaliacao FOR UPDATE
  TO authenticated
  USING (is_active_admin(auth.uid()))
  WITH CHECK (is_active_admin(auth.uid()));

CREATE POLICY "Active admins can delete modelos_avaliacao"
  ON modelos_avaliacao FOR DELETE
  TO authenticated
  USING (is_active_admin(auth.uid()));

-- MODELOS_COMPETENCIAS TABLE POLICIES
CREATE POLICY "Active admins can read modelos_competencias"
  ON modelos_competencias FOR SELECT
  TO authenticated
  USING (is_active_admin(auth.uid()));

CREATE POLICY "Active admins can insert modelos_competencias"
  ON modelos_competencias FOR INSERT
  TO authenticated
  WITH CHECK (is_active_admin(auth.uid()));

CREATE POLICY "Active admins can delete modelos_competencias"
  ON modelos_competencias FOR DELETE
  TO authenticated
  USING (is_active_admin(auth.uid()));

-- CRITERIOS TABLE POLICIES
CREATE POLICY "Active admins can read criterios"
  ON criterios FOR SELECT
  TO authenticated
  USING (is_active_admin(auth.uid()));

CREATE POLICY "Active admins can insert criterios"
  ON criterios FOR INSERT
  TO authenticated
  WITH CHECK (is_active_admin(auth.uid()));

CREATE POLICY "Active admins can update criterios"
  ON criterios FOR UPDATE
  TO authenticated
  USING (is_active_admin(auth.uid()))
  WITH CHECK (is_active_admin(auth.uid()));

CREATE POLICY "Active admins can delete criterios"
  ON criterios FOR DELETE
  TO authenticated
  USING (is_active_admin(auth.uid()));

-- CRITERIOS_TEXTOS TABLE POLICIES
CREATE POLICY "Active admins can read criterios_textos"
  ON criterios_textos FOR SELECT
  TO authenticated
  USING (is_active_admin(auth.uid()));

CREATE POLICY "Active admins can insert criterios_textos"
  ON criterios_textos FOR INSERT
  TO authenticated
  WITH CHECK (is_active_admin(auth.uid()));

CREATE POLICY "Active admins can update criterios_textos"
  ON criterios_textos FOR UPDATE
  TO authenticated
  USING (is_active_admin(auth.uid()))
  WITH CHECK (is_active_admin(auth.uid()));

CREATE POLICY "Active admins can delete criterios_textos"
  ON criterios_textos FOR DELETE
  TO authenticated
  USING (is_active_admin(auth.uid()));

-- PERGUNTAS_PERSONALIZADAS TABLE POLICIES
CREATE POLICY "Active admins can read perguntas_personalizadas"
  ON perguntas_personalizadas FOR SELECT
  TO authenticated
  USING (is_active_admin(auth.uid()));

CREATE POLICY "Active admins can insert perguntas_personalizadas"
  ON perguntas_personalizadas FOR INSERT
  TO authenticated
  WITH CHECK (is_active_admin(auth.uid()));

CREATE POLICY "Active admins can update perguntas_personalizadas"
  ON perguntas_personalizadas FOR UPDATE
  TO authenticated
  USING (is_active_admin(auth.uid()))
  WITH CHECK (is_active_admin(auth.uid()));

CREATE POLICY "Active admins can delete perguntas_personalizadas"
  ON perguntas_personalizadas FOR DELETE
  TO authenticated
  USING (is_active_admin(auth.uid()));

-- PERGUNTAS_PERSONALIZADAS_TEXTOS TABLE POLICIES
CREATE POLICY "Active admins can read perguntas_personalizadas_textos"
  ON perguntas_personalizadas_textos FOR SELECT
  TO authenticated
  USING (is_active_admin(auth.uid()));

CREATE POLICY "Active admins can insert perguntas_personalizadas_textos"
  ON perguntas_personalizadas_textos FOR INSERT
  TO authenticated
  WITH CHECK (is_active_admin(auth.uid()));

CREATE POLICY "Active admins can update perguntas_personalizadas_textos"
  ON perguntas_personalizadas_textos FOR UPDATE
  TO authenticated
  USING (is_active_admin(auth.uid()))
  WITH CHECK (is_active_admin(auth.uid()));

CREATE POLICY "Active admins can delete perguntas_personalizadas_textos"
  ON perguntas_personalizadas_textos FOR DELETE
  TO authenticated
  USING (is_active_admin(auth.uid()));

-- AVALIACOES TABLE POLICIES
CREATE POLICY "Active admins can read avaliacoes"
  ON avaliacoes FOR SELECT
  TO authenticated
  USING (is_active_admin(auth.uid()));

CREATE POLICY "Active admins can insert avaliacoes"
  ON avaliacoes FOR INSERT
  TO authenticated
  WITH CHECK (is_active_admin(auth.uid()));

CREATE POLICY "Active admins can update avaliacoes"
  ON avaliacoes FOR UPDATE
  TO authenticated
  USING (is_active_admin(auth.uid()))
  WITH CHECK (is_active_admin(auth.uid()));

CREATE POLICY "Active admins can delete avaliacoes"
  ON avaliacoes FOR DELETE
  TO authenticated
  USING (is_active_admin(auth.uid()));

-- AVALIACOES_RESPOSTAS TABLE POLICIES
CREATE POLICY "Active admins can read avaliacoes_respostas"
  ON avaliacoes_respostas FOR SELECT
  TO authenticated
  USING (is_active_admin(auth.uid()));

CREATE POLICY "Active admins can insert avaliacoes_respostas"
  ON avaliacoes_respostas FOR INSERT
  TO authenticated
  WITH CHECK (is_active_admin(auth.uid()));

CREATE POLICY "Active admins can update avaliacoes_respostas"
  ON avaliacoes_respostas FOR UPDATE
  TO authenticated
  USING (is_active_admin(auth.uid()))
  WITH CHECK (is_active_admin(auth.uid()));

CREATE POLICY "Active admins can delete avaliacoes_respostas"
  ON avaliacoes_respostas FOR DELETE
  TO authenticated
  USING (is_active_admin(auth.uid()));

-- AVALIACOES_COMPETENCIAS TABLE POLICIES
CREATE POLICY "Active admins can read avaliacoes_competencias"
  ON avaliacoes_competencias FOR SELECT
  TO authenticated
  USING (is_active_admin(auth.uid()));

CREATE POLICY "Active admins can insert avaliacoes_competencias"
  ON avaliacoes_competencias FOR INSERT
  TO authenticated
  WITH CHECK (is_active_admin(auth.uid()));

CREATE POLICY "Active admins can update avaliacoes_competencias"
  ON avaliacoes_competencias FOR UPDATE
  TO authenticated
  USING (is_active_admin(auth.uid()))
  WITH CHECK (is_active_admin(auth.uid()));

CREATE POLICY "Active admins can delete avaliacoes_competencias"
  ON avaliacoes_competencias FOR DELETE
  TO authenticated
  USING (is_active_admin(auth.uid()));

-- AVALIACOES_TEXTOS TABLE POLICIES
CREATE POLICY "Active admins can read avaliacoes_textos"
  ON avaliacoes_textos FOR SELECT
  TO authenticated
  USING (is_active_admin(auth.uid()));

CREATE POLICY "Active admins can insert avaliacoes_textos"
  ON avaliacoes_textos FOR INSERT
  TO authenticated
  WITH CHECK (is_active_admin(auth.uid()));

CREATE POLICY "Active admins can update avaliacoes_textos"
  ON avaliacoes_textos FOR UPDATE
  TO authenticated
  USING (is_active_admin(auth.uid()))
  WITH CHECK (is_active_admin(auth.uid()));

CREATE POLICY "Active admins can delete avaliacoes_textos"
  ON avaliacoes_textos FOR DELETE
  TO authenticated
  USING (is_active_admin(auth.uid()));

-- ADMINISTRADORES_EMPRESAS TABLE POLICIES
CREATE POLICY "Active admins can read administradores_empresas"
  ON administradores_empresas FOR SELECT
  TO authenticated
  USING (is_active_admin(auth.uid()));

CREATE POLICY "Active admins can insert administradores_empresas"
  ON administradores_empresas FOR INSERT
  TO authenticated
  WITH CHECK (is_active_admin(auth.uid()));

CREATE POLICY "Active admins can delete administradores_empresas"
  ON administradores_empresas FOR DELETE
  TO authenticated
  USING (is_active_admin(auth.uid()));

-- PERFIS TABLE POLICIES
CREATE POLICY "Active admins can read perfis"
  ON perfis FOR SELECT
  TO authenticated
  USING (is_active_admin(auth.uid()));

CREATE POLICY "Active admins can insert perfis"
  ON perfis FOR INSERT
  TO authenticated
  WITH CHECK (is_active_admin(auth.uid()));

CREATE POLICY "Active admins can update perfis"
  ON perfis FOR UPDATE
  TO authenticated
  USING (is_active_admin(auth.uid()))
  WITH CHECK (is_active_admin(auth.uid()));

CREATE POLICY "Active admins can delete perfis"
  ON perfis FOR DELETE
  TO authenticated
  USING (is_active_admin(auth.uid()));
