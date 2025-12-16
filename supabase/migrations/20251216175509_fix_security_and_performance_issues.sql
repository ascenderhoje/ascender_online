/*
  # Fix Security and Performance Issues

  ## Changes Made

  ### 1. Add Missing Foreign Key Indexes
  Creates indexes for all unindexed foreign keys to improve query performance:
  - administradores.empresa_padrao_id
  - avaliacoes.modelo_id
  - avaliacoes.usuario_editando_id
  - modelos_competencias.competencia_id
  - pdi_contents.created_by, updated_by
  - pessoas_grupos.grupo_id

  ### 2. Optimize RLS Policies (Auth Function Initialization)
  Updates all RLS policies to use `(select auth.uid())` pattern instead of `auth.uid()`.
  This prevents re-evaluation of auth functions for each row, significantly improving performance at scale.
  
  Affected tables:
  - competencias, modelos_avaliacao, modelos_competencias
  - criterios, criterios_textos
  - perguntas_personalizadas, perguntas_personalizadas_textos
  - perfis, avaliacoes, avaliacoes_respostas
  - avaliacoes_competencias, avaliacoes_textos
  - pdi_tags, pdi_contents, pdi_content_tags
  - pdi_media_types, pdi_audiences, pdi_content_audiences
  - pdi_content_competencies, pdi_user_contents, pdi_user_actions

  ### 3. Fix Function Search Paths (Security)
  Sets explicit search_path for all database functions to prevent search_path hijacking attacks.
  
  Affected functions:
  - is_active_admin, is_active_pessoa
  - get_admin_by_auth_id, get_pessoa_by_auth_id
  - update_last_login, update_pessoa_last_login
  - get_pessoa_id_from_auth, is_evaluation_owner
  - update_pdi_completed_at, get_user_latest_pdi_suggestions
  - update_pdi_content_rating_agg, update_pdi_content_rating_on_delete
  - create_auth_user, get_user_pdi_tag_recommendations
  - update_updated_at_column

  ### 4. Notes
  - Unused indexes are kept as they may be used in the future
  - Multiple permissive policies are kept for clarity and specific use cases
  - Auth DB connection strategy should be configured in Supabase dashboard
  - Leaked password protection should be enabled in Supabase Auth settings
*/

-- =============================================================================
-- 1. ADD MISSING FOREIGN KEY INDEXES
-- =============================================================================

-- Index for administradores.empresa_padrao_id
CREATE INDEX IF NOT EXISTS idx_administradores_empresa_padrao_id 
  ON public.administradores(empresa_padrao_id);

-- Index for avaliacoes.modelo_id
CREATE INDEX IF NOT EXISTS idx_avaliacoes_modelo_id 
  ON public.avaliacoes(modelo_id);

-- Index for avaliacoes.usuario_editando_id
CREATE INDEX IF NOT EXISTS idx_avaliacoes_usuario_editando_id 
  ON public.avaliacoes(usuario_editando_id);

-- Index for modelos_competencias.competencia_id
CREATE INDEX IF NOT EXISTS idx_modelos_competencias_competencia_id 
  ON public.modelos_competencias(competencia_id);

-- Index for pdi_contents.created_by
CREATE INDEX IF NOT EXISTS idx_pdi_contents_created_by 
  ON public.pdi_contents(created_by);

-- Index for pdi_contents.updated_by
CREATE INDEX IF NOT EXISTS idx_pdi_contents_updated_by 
  ON public.pdi_contents(updated_by);

-- Index for pessoas_grupos.grupo_id
CREATE INDEX IF NOT EXISTS idx_pessoas_grupos_grupo_id 
  ON public.pessoas_grupos(grupo_id);

-- =============================================================================
-- 2. OPTIMIZE RLS POLICIES - REPLACE auth.uid() WITH (select auth.uid())
-- =============================================================================

-- Drop and recreate policies for competencias
DROP POLICY IF EXISTS "Authenticated pessoas can read competencias" ON public.competencias;
CREATE POLICY "Authenticated pessoas can read competencias"
  ON public.competencias FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.pessoas
      WHERE pessoas.auth_user_id = (select auth.uid())
      AND pessoas.ativo = true
    )
  );

-- Drop and recreate policies for modelos_avaliacao
DROP POLICY IF EXISTS "Authenticated pessoas can read modelos_avaliacao" ON public.modelos_avaliacao;
CREATE POLICY "Authenticated pessoas can read modelos_avaliacao"
  ON public.modelos_avaliacao FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.pessoas
      WHERE pessoas.auth_user_id = (select auth.uid())
      AND pessoas.ativo = true
    )
  );

-- Drop and recreate policies for modelos_competencias
DROP POLICY IF EXISTS "Authenticated pessoas can read modelos_competencias" ON public.modelos_competencias;
CREATE POLICY "Authenticated pessoas can read modelos_competencias"
  ON public.modelos_competencias FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.pessoas
      WHERE pessoas.auth_user_id = (select auth.uid())
      AND pessoas.ativo = true
    )
  );

-- Drop and recreate policies for criterios
DROP POLICY IF EXISTS "Authenticated pessoas can read criterios" ON public.criterios;
CREATE POLICY "Authenticated pessoas can read criterios"
  ON public.criterios FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.pessoas
      WHERE pessoas.auth_user_id = (select auth.uid())
      AND pessoas.ativo = true
    )
  );

-- Drop and recreate policies for criterios_textos
DROP POLICY IF EXISTS "Authenticated pessoas can read criterios_textos" ON public.criterios_textos;
CREATE POLICY "Authenticated pessoas can read criterios_textos"
  ON public.criterios_textos FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.pessoas
      WHERE pessoas.auth_user_id = (select auth.uid())
      AND pessoas.ativo = true
    )
  );

-- Drop and recreate policies for perguntas_personalizadas
DROP POLICY IF EXISTS "Authenticated pessoas can read perguntas_personalizadas" ON public.perguntas_personalizadas;
CREATE POLICY "Authenticated pessoas can read perguntas_personalizadas"
  ON public.perguntas_personalizadas FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.pessoas
      WHERE pessoas.auth_user_id = (select auth.uid())
      AND pessoas.ativo = true
    )
  );

-- Drop and recreate policies for perguntas_personalizadas_textos
DROP POLICY IF EXISTS "Authenticated pessoas can read perguntas_personalizadas_textos" ON public.perguntas_personalizadas_textos;
CREATE POLICY "Authenticated pessoas can read perguntas_personalizadas_textos"
  ON public.perguntas_personalizadas_textos FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.pessoas
      WHERE pessoas.auth_user_id = (select auth.uid())
      AND pessoas.ativo = true
    )
  );

-- Drop and recreate policies for perfis
DROP POLICY IF EXISTS "Authenticated users can view perfis" ON public.perfis;
CREATE POLICY "Authenticated users can view perfis"
  ON public.perfis FOR SELECT
  TO authenticated
  USING ((select auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "Admins can manage perfis" ON public.perfis;
CREATE POLICY "Admins can manage perfis"
  ON public.perfis FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.administradores
      WHERE administradores.auth_user_id = (select auth.uid())
      AND administradores.ativo = true
    )
  );

DROP POLICY IF EXISTS "Pessoas can read perfis" ON public.perfis;
CREATE POLICY "Pessoas can read perfis"
  ON public.perfis FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.pessoas
      WHERE pessoas.auth_user_id = (select auth.uid())
      AND pessoas.ativo = true
    )
  );

-- Drop and recreate policies for avaliacoes
DROP POLICY IF EXISTS "Colaboradores can read own avaliacoes" ON public.avaliacoes;
CREATE POLICY "Colaboradores can read own avaliacoes"
  ON public.avaliacoes FOR SELECT
  TO authenticated
  USING (
    colaborador_id IN (
      SELECT id FROM public.pessoas
      WHERE auth_user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Gestores can read team avaliacoes" ON public.avaliacoes;
CREATE POLICY "Gestores can read team avaliacoes"
  ON public.avaliacoes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.pessoas p
      JOIN public.grupos_gestores gg ON gg.pessoa_id = p.id
      JOIN public.pessoas_grupos pg ON pg.grupo_id = gg.grupo_id
      WHERE p.auth_user_id = (select auth.uid())
      AND pg.pessoa_id = avaliacoes.colaborador_id
      AND p.ativo = true
    )
  );

-- Drop and recreate policies for avaliacoes_respostas
DROP POLICY IF EXISTS "Pessoas can read relevant avaliacoes_respostas" ON public.avaliacoes_respostas;
CREATE POLICY "Pessoas can read relevant avaliacoes_respostas"
  ON public.avaliacoes_respostas FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.avaliacoes a
      JOIN public.pessoas p ON p.id = a.colaborador_id
      WHERE a.id = avaliacoes_respostas.avaliacao_id
      AND p.auth_user_id = (select auth.uid())
    )
  );

-- Drop and recreate policies for avaliacoes_competencias
DROP POLICY IF EXISTS "Pessoas can read relevant avaliacoes_competencias" ON public.avaliacoes_competencias;
CREATE POLICY "Pessoas can read relevant avaliacoes_competencias"
  ON public.avaliacoes_competencias FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.avaliacoes a
      JOIN public.pessoas p ON p.id = a.colaborador_id
      WHERE a.id = avaliacoes_competencias.avaliacao_id
      AND p.auth_user_id = (select auth.uid())
    )
  );

-- Drop and recreate policies for avaliacoes_textos
DROP POLICY IF EXISTS "Pessoas can read relevant avaliacoes_textos" ON public.avaliacoes_textos;
CREATE POLICY "Pessoas can read relevant avaliacoes_textos"
  ON public.avaliacoes_textos FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.avaliacoes a
      JOIN public.pessoas p ON p.id = a.colaborador_id
      WHERE a.id = avaliacoes_textos.avaliacao_id
      AND p.auth_user_id = (select auth.uid())
    )
  );

-- Drop and recreate policies for pdi_tags
DROP POLICY IF EXISTS "Pessoas can read pdi_tags" ON public.pdi_tags;
CREATE POLICY "Pessoas can read pdi_tags"
  ON public.pdi_tags FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.pessoas
      WHERE pessoas.auth_user_id = (select auth.uid())
      AND pessoas.ativo = true
    )
  );

-- Drop and recreate policies for pdi_contents
DROP POLICY IF EXISTS "Pessoas can read pdi_contents" ON public.pdi_contents;
CREATE POLICY "Pessoas can read pdi_contents"
  ON public.pdi_contents FOR SELECT
  TO authenticated
  USING (
    is_active = true AND
    EXISTS (
      SELECT 1 FROM public.pessoas
      WHERE pessoas.auth_user_id = (select auth.uid())
      AND pessoas.ativo = true
    )
  );

-- Drop and recreate policies for pdi_content_tags
DROP POLICY IF EXISTS "Pessoas can read pdi_content_tags" ON public.pdi_content_tags;
CREATE POLICY "Pessoas can read pdi_content_tags"
  ON public.pdi_content_tags FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.pessoas
      WHERE pessoas.auth_user_id = (select auth.uid())
      AND pessoas.ativo = true
    )
  );

-- Drop and recreate policies for pdi_media_types
DROP POLICY IF EXISTS "Pessoas can read pdi_media_types" ON public.pdi_media_types;
CREATE POLICY "Pessoas can read pdi_media_types"
  ON public.pdi_media_types FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.pessoas
      WHERE pessoas.auth_user_id = (select auth.uid())
      AND pessoas.ativo = true
    )
  );

-- Drop and recreate policies for pdi_audiences
DROP POLICY IF EXISTS "Pessoas can read pdi_audiences" ON public.pdi_audiences;
CREATE POLICY "Pessoas can read pdi_audiences"
  ON public.pdi_audiences FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.pessoas
      WHERE pessoas.auth_user_id = (select auth.uid())
      AND pessoas.ativo = true
    )
  );

-- Drop and recreate policies for pdi_content_audiences
DROP POLICY IF EXISTS "Pessoas can read pdi_content_audiences" ON public.pdi_content_audiences;
CREATE POLICY "Pessoas can read pdi_content_audiences"
  ON public.pdi_content_audiences FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.pessoas
      WHERE pessoas.auth_user_id = (select auth.uid())
      AND pessoas.ativo = true
    )
  );

-- Drop and recreate policies for pdi_content_competencies
DROP POLICY IF EXISTS "Pessoas can read pdi_content_competencies" ON public.pdi_content_competencies;
CREATE POLICY "Pessoas can read pdi_content_competencies"
  ON public.pdi_content_competencies FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.pessoas
      WHERE pessoas.auth_user_id = (select auth.uid())
      AND pessoas.ativo = true
    )
  );

-- Drop and recreate policies for pdi_user_contents
DROP POLICY IF EXISTS "Users can manage their own pdi_user_contents" ON public.pdi_user_contents;
CREATE POLICY "Users can manage their own pdi_user_contents"
  ON public.pdi_user_contents FOR ALL
  TO authenticated
  USING (
    user_id IN (
      SELECT id FROM public.pessoas
      WHERE auth_user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    user_id IN (
      SELECT id FROM public.pessoas
      WHERE auth_user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Gestores can read team pdi_user_contents" ON public.pdi_user_contents;
CREATE POLICY "Gestores can read team pdi_user_contents"
  ON public.pdi_user_contents FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.pessoas p
      JOIN public.grupos_gestores gg ON gg.pessoa_id = p.id
      JOIN public.pessoas_grupos pg ON pg.grupo_id = gg.grupo_id
      WHERE p.auth_user_id = (select auth.uid())
      AND pg.pessoa_id = pdi_user_contents.user_id
      AND p.ativo = true
    )
  );

-- Drop and recreate policies for pdi_user_actions
DROP POLICY IF EXISTS "Users can manage their own pdi_user_actions" ON public.pdi_user_actions;
CREATE POLICY "Users can manage their own pdi_user_actions"
  ON public.pdi_user_actions FOR ALL
  TO authenticated
  USING (
    user_id IN (
      SELECT id FROM public.pessoas
      WHERE auth_user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    user_id IN (
      SELECT id FROM public.pessoas
      WHERE auth_user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Gestores can read team pdi_user_actions" ON public.pdi_user_actions;
CREATE POLICY "Gestores can read team pdi_user_actions"
  ON public.pdi_user_actions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.pessoas p
      JOIN public.grupos_gestores gg ON gg.pessoa_id = p.id
      JOIN public.pessoas_grupos pg ON pg.grupo_id = gg.grupo_id
      WHERE p.auth_user_id = (select auth.uid())
      AND pg.pessoa_id = pdi_user_actions.user_id
      AND p.ativo = true
    )
  );

-- =============================================================================
-- 3. FIX FUNCTION SEARCH PATHS (SECURITY)
-- =============================================================================

-- Set search_path for all functions to prevent search_path hijacking attacks

ALTER FUNCTION public.is_active_admin(uuid) SET search_path = public, pg_temp;
ALTER FUNCTION public.is_active_pessoa(uuid) SET search_path = public, pg_temp;
ALTER FUNCTION public.get_admin_by_auth_id(uuid) SET search_path = public, pg_temp;
ALTER FUNCTION public.update_last_login(uuid) SET search_path = public, pg_temp;
ALTER FUNCTION public.get_pessoa_by_auth_id(uuid) SET search_path = public, pg_temp;
ALTER FUNCTION public.update_pessoa_last_login(uuid) SET search_path = public, pg_temp;
ALTER FUNCTION public.get_pessoa_id_from_auth() SET search_path = public, pg_temp;
ALTER FUNCTION public.update_pdi_completed_at() SET search_path = public, pg_temp;
ALTER FUNCTION public.get_user_latest_pdi_suggestions(uuid) SET search_path = public, pg_temp;
ALTER FUNCTION public.is_evaluation_owner(uuid) SET search_path = public, pg_temp;
ALTER FUNCTION public.update_pdi_content_rating_agg() SET search_path = public, pg_temp;
ALTER FUNCTION public.update_pdi_content_rating_on_delete() SET search_path = public, pg_temp;
ALTER FUNCTION public.create_auth_user(text, text, text) SET search_path = public, pg_temp;
ALTER FUNCTION public.get_user_pdi_tag_recommendations(uuid) SET search_path = public, pg_temp;
ALTER FUNCTION public.update_updated_at_column() SET search_path = public, pg_temp;