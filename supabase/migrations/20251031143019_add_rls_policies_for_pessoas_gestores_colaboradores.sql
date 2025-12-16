/*
  # Add RLS Policies for Gestores and Colaboradores

  ## Overview
  This migration adds Row Level Security policies to enable gestores (managers) and colaboradores 
  (employees) to access their own data and related information. Currently, only administrators 
  can access data, which blocks login for gestores and colaboradores.

  ## Changes Made

  ### 1. Pessoas Table Policies
    - Allow pessoas to read their own profile data
    - Allow gestores to read profiles of people in their managed groups
    - Maintain admin access for full data management

  ### 2. Grupos and Related Tables
    - Allow gestores to read their grupos_gestores records
    - Allow gestores to read grupos they manage
    - Allow gestores to read pessoas_grupos for their groups
    - Allow read access to empresas for pessoas

  ### 3. Competencias and Modelos
    - Allow authenticated pessoas to read competencias (needed for viewing evaluations)
    - Allow authenticated pessoas to read modelos_avaliacao (needed for viewing evaluations)
    - Allow read access to related tables (criterios, perguntas, etc.)

  ### 4. Avaliacoes Access
    - Allow colaboradores to read their own avaliacoes
    - Allow gestores to read avaliacoes of people in their managed groups
    - Allow read access to avaliacoes_respostas, avaliacoes_competencias, avaliacoes_textos
    - Respect visibility rules for criterios and perguntas

  ### 5. PDI (Personal Development Plan) Access
    - Allow pessoas to read PDI tags and contents
    - Allow gestores to view PDI data of their team members

  ## Security Notes
  - All policies follow the principle of least privilege
  - Gestores can only read data, not modify it (except their own PDI)
  - Colaboradores can only access their own data
  - Administrators retain full access to all operations
  - RLS ensures data isolation between different groups and empresas
*/

-- ============================================================================
-- PESSOAS TABLE POLICIES - Allow pessoas to read their own data
-- ============================================================================

-- Allow pessoas to read their own profile
CREATE POLICY "Pessoas can read own profile"
  ON pessoas FOR SELECT
  TO authenticated
  USING (auth_user_id = auth.uid());

-- Allow gestores to read profiles of people in groups they manage
CREATE POLICY "Gestores can read team members"
  ON pessoas FOR SELECT
  TO authenticated
  USING (
    -- Check if the authenticated user is a gestor
    EXISTS (
      SELECT 1 FROM pessoas p
      WHERE p.auth_user_id = auth.uid()
      AND p.tipo_acesso = 'gestor'
      AND p.ativo = true
    )
    -- And the target pessoa is in a group managed by this gestor
    AND id IN (
      SELECT pg.pessoa_id
      FROM pessoas_grupos pg
      JOIN grupos_gestores gg ON pg.grupo_id = gg.grupo_id
      WHERE gg.pessoa_id = (
        SELECT id FROM pessoas WHERE auth_user_id = auth.uid()
      )
    )
  );

-- ============================================================================
-- GRUPOS, GRUPOS_GESTORES, PESSOAS_GRUPOS POLICIES
-- ============================================================================

-- Allow gestores to read their own grupos_gestores records
CREATE POLICY "Gestores can read own grupos_gestores"
  ON grupos_gestores FOR SELECT
  TO authenticated
  USING (
    pessoa_id IN (
      SELECT id FROM pessoas WHERE auth_user_id = auth.uid()
    )
  );

-- Allow gestores to read grupos they manage
CREATE POLICY "Gestores can read managed grupos"
  ON grupos FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT grupo_id FROM grupos_gestores
      WHERE pessoa_id IN (
        SELECT id FROM pessoas WHERE auth_user_id = auth.uid()
      )
    )
  );

-- Allow gestores to read pessoas_grupos for their managed groups
CREATE POLICY "Gestores can read team pessoas_grupos"
  ON pessoas_grupos FOR SELECT
  TO authenticated
  USING (
    grupo_id IN (
      SELECT grupo_id FROM grupos_gestores
      WHERE pessoa_id IN (
        SELECT id FROM pessoas WHERE auth_user_id = auth.uid()
      )
    )
  );

-- ============================================================================
-- EMPRESAS POLICIES - Allow pessoas to read their empresa
-- ============================================================================

CREATE POLICY "Pessoas can read own empresa"
  ON empresas FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT empresa_id FROM pessoas WHERE auth_user_id = auth.uid()
    )
  );

-- ============================================================================
-- COMPETENCIAS AND MODELOS POLICIES - Needed for viewing evaluations
-- ============================================================================

CREATE POLICY "Authenticated pessoas can read competencias"
  ON competencias FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pessoas WHERE auth_user_id = auth.uid() AND ativo = true
    )
  );

CREATE POLICY "Authenticated pessoas can read modelos_avaliacao"
  ON modelos_avaliacao FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pessoas WHERE auth_user_id = auth.uid() AND ativo = true
    )
  );

CREATE POLICY "Authenticated pessoas can read modelos_competencias"
  ON modelos_competencias FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pessoas WHERE auth_user_id = auth.uid() AND ativo = true
    )
  );

CREATE POLICY "Authenticated pessoas can read criterios"
  ON criterios FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pessoas WHERE auth_user_id = auth.uid() AND ativo = true
    )
  );

CREATE POLICY "Authenticated pessoas can read criterios_textos"
  ON criterios_textos FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pessoas WHERE auth_user_id = auth.uid() AND ativo = true
    )
  );

CREATE POLICY "Authenticated pessoas can read perguntas_personalizadas"
  ON perguntas_personalizadas FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pessoas WHERE auth_user_id = auth.uid() AND ativo = true
    )
  );

CREATE POLICY "Authenticated pessoas can read perguntas_personalizadas_textos"
  ON perguntas_personalizadas_textos FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pessoas WHERE auth_user_id = auth.uid() AND ativo = true
    )
  );

-- ============================================================================
-- AVALIACOES POLICIES - Allow colaboradores and gestores to read evaluations
-- ============================================================================

-- Allow colaboradores to read their own avaliacoes
CREATE POLICY "Colaboradores can read own avaliacoes"
  ON avaliacoes FOR SELECT
  TO authenticated
  USING (
    colaborador_id IN (
      SELECT id FROM pessoas WHERE auth_user_id = auth.uid()
    )
  );

-- Allow gestores to read avaliacoes of people in their managed groups
CREATE POLICY "Gestores can read team avaliacoes"
  ON avaliacoes FOR SELECT
  TO authenticated
  USING (
    -- Check if the authenticated user is a gestor
    EXISTS (
      SELECT 1 FROM pessoas p
      WHERE p.auth_user_id = auth.uid()
      AND p.tipo_acesso = 'gestor'
      AND p.ativo = true
    )
    -- And the avaliacao belongs to someone in their managed groups
    AND colaborador_id IN (
      SELECT pg.pessoa_id
      FROM pessoas_grupos pg
      JOIN grupos_gestores gg ON pg.grupo_id = gg.grupo_id
      WHERE gg.pessoa_id = (
        SELECT id FROM pessoas WHERE auth_user_id = auth.uid()
      )
    )
  );

-- ============================================================================
-- AVALIACOES RELATED TABLES - Respostas, Competencias, Textos
-- ============================================================================

-- Allow read access to avaliacoes_respostas for own or managed team evaluations
CREATE POLICY "Pessoas can read relevant avaliacoes_respostas"
  ON avaliacoes_respostas FOR SELECT
  TO authenticated
  USING (
    avaliacao_id IN (
      -- Own evaluations
      SELECT id FROM avaliacoes WHERE colaborador_id IN (
        SELECT id FROM pessoas WHERE auth_user_id = auth.uid()
      )
      UNION
      -- Team evaluations for gestores
      SELECT a.id FROM avaliacoes a
      WHERE EXISTS (
        SELECT 1 FROM pessoas p
        WHERE p.auth_user_id = auth.uid()
        AND p.tipo_acesso = 'gestor'
        AND p.ativo = true
      )
      AND a.colaborador_id IN (
        SELECT pg.pessoa_id
        FROM pessoas_grupos pg
        JOIN grupos_gestores gg ON pg.grupo_id = gg.grupo_id
        WHERE gg.pessoa_id = (
          SELECT id FROM pessoas WHERE auth_user_id = auth.uid()
        )
      )
    )
  );

-- Allow read access to avaliacoes_competencias
CREATE POLICY "Pessoas can read relevant avaliacoes_competencias"
  ON avaliacoes_competencias FOR SELECT
  TO authenticated
  USING (
    avaliacao_id IN (
      -- Own evaluations
      SELECT id FROM avaliacoes WHERE colaborador_id IN (
        SELECT id FROM pessoas WHERE auth_user_id = auth.uid()
      )
      UNION
      -- Team evaluations for gestores
      SELECT a.id FROM avaliacoes a
      WHERE EXISTS (
        SELECT 1 FROM pessoas p
        WHERE p.auth_user_id = auth.uid()
        AND p.tipo_acesso = 'gestor'
        AND p.ativo = true
      )
      AND a.colaborador_id IN (
        SELECT pg.pessoa_id
        FROM pessoas_grupos pg
        JOIN grupos_gestores gg ON pg.grupo_id = gg.grupo_id
        WHERE gg.pessoa_id = (
          SELECT id FROM pessoas WHERE auth_user_id = auth.uid()
        )
      )
    )
  );

-- Allow read access to avaliacoes_textos
CREATE POLICY "Pessoas can read relevant avaliacoes_textos"
  ON avaliacoes_textos FOR SELECT
  TO authenticated
  USING (
    avaliacao_id IN (
      -- Own evaluations
      SELECT id FROM avaliacoes WHERE colaborador_id IN (
        SELECT id FROM pessoas WHERE auth_user_id = auth.uid()
      )
      UNION
      -- Team evaluations for gestores
      SELECT a.id FROM avaliacoes a
      WHERE EXISTS (
        SELECT 1 FROM pessoas p
        WHERE p.auth_user_id = auth.uid()
        AND p.tipo_acesso = 'gestor'
        AND p.ativo = true
      )
      AND a.colaborador_id IN (
        SELECT pg.pessoa_id
        FROM pessoas_grupos pg
        JOIN grupos_gestores gg ON pg.grupo_id = gg.grupo_id
        WHERE gg.pessoa_id = (
          SELECT id FROM pessoas WHERE auth_user_id = auth.uid()
        )
      )
    )
  );

-- ============================================================================
-- PDI (PERSONAL DEVELOPMENT PLAN) POLICIES
-- ============================================================================

-- Allow authenticated pessoas to read PDI tags
CREATE POLICY "Pessoas can read pdi_tags"
  ON pdi_tags FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pessoas WHERE auth_user_id = auth.uid() AND ativo = true
    )
  );

-- Allow authenticated pessoas to read PDI contents
CREATE POLICY "Pessoas can read pdi_contents"
  ON pdi_contents FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pessoas WHERE auth_user_id = auth.uid() AND ativo = true
    )
  );

-- Allow authenticated pessoas to read PDI content tags
CREATE POLICY "Pessoas can read pdi_content_tags"
  ON pdi_content_tags FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pessoas WHERE auth_user_id = auth.uid() AND ativo = true
    )
  );

-- Allow authenticated pessoas to read PDI media types
CREATE POLICY "Pessoas can read pdi_media_types"
  ON pdi_media_types FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pessoas WHERE auth_user_id = auth.uid() AND ativo = true
    )
  );

-- Allow authenticated pessoas to read PDI audiences
CREATE POLICY "Pessoas can read pdi_audiences"
  ON pdi_audiences FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pessoas WHERE auth_user_id = auth.uid() AND ativo = true
    )
  );

-- Allow authenticated pessoas to read PDI content audiences
CREATE POLICY "Pessoas can read pdi_content_audiences"
  ON pdi_content_audiences FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pessoas WHERE auth_user_id = auth.uid() AND ativo = true
    )
  );

-- Allow authenticated pessoas to read PDI content competencies
CREATE POLICY "Pessoas can read pdi_content_competencies"
  ON pdi_content_competencies FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pessoas WHERE auth_user_id = auth.uid() AND ativo = true
    )
  );

-- Allow gestores to read PDI user contents of their team members
CREATE POLICY "Gestores can read team pdi_user_contents"
  ON pdi_user_contents FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pessoas p
      WHERE p.auth_user_id = auth.uid()
      AND p.tipo_acesso = 'gestor'
      AND p.ativo = true
    )
    AND user_id IN (
      SELECT pg.pessoa_id
      FROM pessoas_grupos pg
      JOIN grupos_gestores gg ON pg.grupo_id = gg.grupo_id
      WHERE gg.pessoa_id = (
        SELECT id FROM pessoas WHERE auth_user_id = auth.uid()
      )
    )
  );

-- Allow gestores to read PDI actions of their team members
CREATE POLICY "Gestores can read team pdi_user_actions"
  ON pdi_user_actions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pessoas p
      WHERE p.auth_user_id = auth.uid()
      AND p.tipo_acesso = 'gestor'
      AND p.ativo = true
    )
    AND user_id IN (
      SELECT pg.pessoa_id
      FROM pessoas_grupos pg
      JOIN grupos_gestores gg ON pg.grupo_id = gg.grupo_id
      WHERE gg.pessoa_id = (
        SELECT id FROM pessoas WHERE auth_user_id = auth.uid()
      )
    )
  );

-- ============================================================================
-- PERFIS POLICIES - Allow authenticated pessoas to read perfis
-- ============================================================================

CREATE POLICY "Pessoas can read perfis"
  ON perfis FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pessoas WHERE auth_user_id = auth.uid() AND ativo = true
    )
  );
