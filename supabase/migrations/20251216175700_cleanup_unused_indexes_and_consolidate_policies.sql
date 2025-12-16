/*
  # Clean Up Unused Indexes and Consolidate RLS Policies

  ## Changes Made

  ### 1. Remove Unused Indexes
  Drops all indexes that have not been used to:
  - Reduce database storage overhead
  - Improve write performance (inserts/updates/deletes)
  - Simplify database maintenance
  
  Note: Indexes can always be recreated if they become needed in the future.

  ### 2. Consolidate Multiple Permissive Policies
  Removes redundant and overly-permissive policies to:
  - Eliminate security confusion
  - Remove development-only policies (e.g., "Allow public access", "Public access for dev")
  - Keep only the most restrictive and appropriate policies for production
  
  This significantly improves security by ensuring clear, non-overlapping access controls.

  ### 3. Manual Configuration Required
  - Auth DB connection strategy: Configure in Supabase Dashboard → Project Settings → Database
  - Leaked password protection: Enable in Supabase Dashboard → Project Settings → Authentication
*/

-- =============================================================================
-- 1. DROP UNUSED INDEXES
-- =============================================================================

-- Competencias and related
DROP INDEX IF EXISTS public.idx_competencias_empresa_id;

-- Modelos
DROP INDEX IF EXISTS public.idx_modelos_empresa_id;

-- Empresas
DROP INDEX IF EXISTS public.idx_empresas_cidade;

-- Grupos
DROP INDEX IF EXISTS public.idx_grupos_nome;
DROP INDEX IF EXISTS public.idx_grupos_empresa_id;
DROP INDEX IF EXISTS public.idx_grupos_gestores_grupo_id;

-- Pessoas
DROP INDEX IF EXISTS public.idx_pessoas_email;
DROP INDEX IF EXISTS public.idx_pessoas_empresa;
DROP INDEX IF EXISTS public.idx_pessoas_tipo_acesso;
DROP INDEX IF EXISTS public.idx_pessoas_auth_user_id;
DROP INDEX IF EXISTS public.idx_pessoas_ativo;
DROP INDEX IF EXISTS public.idx_pessoas_auth_user_active;

-- Perguntas personalizadas
DROP INDEX IF EXISTS public.idx_perguntas_textos_pergunta_id;
DROP INDEX IF EXISTS public.idx_perguntas_textos_idioma;

-- Administradores
DROP INDEX IF EXISTS public.idx_administradores_email;
DROP INDEX IF EXISTS public.idx_administradores_ativo;
DROP INDEX IF EXISTS public.idx_administradores_e_psicologa;
DROP INDEX IF EXISTS public.idx_administradores_auth_user_id;
DROP INDEX IF EXISTS public.idx_administradores_empresa_padrao_id;

-- Administradores empresas
DROP INDEX IF EXISTS public.idx_adm_empresas_admin;
DROP INDEX IF EXISTS public.idx_adm_empresas_empresa;

-- Avaliacoes
DROP INDEX IF EXISTS public.idx_avaliacoes_data;
DROP INDEX IF EXISTS public.idx_avaliacoes_empresa;
DROP INDEX IF EXISTS public.idx_avaliacoes_colaborador;
DROP INDEX IF EXISTS public.idx_avaliacoes_psicologa;
DROP INDEX IF EXISTS public.idx_avaliacoes_status;
DROP INDEX IF EXISTS public.idx_avaliacoes_editing_user;
DROP INDEX IF EXISTS public.idx_avaliacoes_status_filter;
DROP INDEX IF EXISTS public.idx_avaliacoes_colaborador_status;
DROP INDEX IF EXISTS public.idx_avaliacoes_pdi_tags;
DROP INDEX IF EXISTS public.idx_avaliacoes_colaborador_data;
DROP INDEX IF EXISTS public.idx_avaliacoes_modelo_id;
DROP INDEX IF EXISTS public.idx_avaliacoes_usuario_editando_id;

-- Avaliacoes related
DROP INDEX IF EXISTS public.idx_avaliacoes_respostas_pergunta;
DROP INDEX IF EXISTS public.idx_avaliacoes_competencias_competencia;
DROP INDEX IF EXISTS public.idx_avaliacoes_competencias_criterio;
DROP INDEX IF EXISTS public.idx_avaliacoes_textos_avaliacao;
DROP INDEX IF EXISTS public.idx_avaliacoes_textos_idioma;
DROP INDEX IF EXISTS public.idx_avaliacoes_textos_idioma_padrao;

-- Modelos competencias
DROP INDEX IF EXISTS public.idx_modelos_competencias_competencia_id;

-- Pessoas grupos
DROP INDEX IF EXISTS public.idx_pessoas_grupos_grupo_id;

-- PDI related
DROP INDEX IF EXISTS public.idx_pdi_user_actions_status;
DROP INDEX IF EXISTS public.idx_pdi_user_actions_due_date;
DROP INDEX IF EXISTS public.idx_pdi_tags_slug;
DROP INDEX IF EXISTS public.idx_pdi_media_types_slug;
DROP INDEX IF EXISTS public.idx_pdi_audiences_slug;
DROP INDEX IF EXISTS public.idx_pdi_contents_media_type;
DROP INDEX IF EXISTS public.idx_pdi_contents_active;
DROP INDEX IF EXISTS public.idx_pdi_contents_rating;
DROP INDEX IF EXISTS public.idx_pdi_contents_created_by;
DROP INDEX IF EXISTS public.idx_pdi_contents_updated_by;
DROP INDEX IF EXISTS public.idx_pdi_content_tags_tag;
DROP INDEX IF EXISTS public.idx_pdi_content_competencies_competency;
DROP INDEX IF EXISTS public.idx_pdi_content_audiences_audience;
DROP INDEX IF EXISTS public.idx_pdi_user_contents_content;
DROP INDEX IF EXISTS public.idx_pdi_user_contents_status;
DROP INDEX IF EXISTS public.idx_pdi_user_contents_due_date;

-- =============================================================================
-- 2. CONSOLIDATE MULTIPLE PERMISSIVE POLICIES
-- =============================================================================

-- Remove overly permissive development policies and keep only production-ready ones

-- AVALIACOES: Remove public access, keep employee and manager access
DROP POLICY IF EXISTS "Allow public read access to avaliacoes" ON public.avaliacoes;

-- AVALIACOES_COMPETENCIAS: Remove public access
DROP POLICY IF EXISTS "Allow public read access to avaliacoes_competencias" ON public.avaliacoes_competencias;

-- AVALIACOES_RESPOSTAS: Remove public access
DROP POLICY IF EXISTS "Allow public read access to avaliacoes_respostas" ON public.avaliacoes_respostas;

-- AVALIACOES_TEXTOS: Remove public access
DROP POLICY IF EXISTS "Allow public read access to avaliacoes_textos" ON public.avaliacoes_textos;

-- COMPETENCIAS: Remove public access
DROP POLICY IF EXISTS "Allow public access to competencias" ON public.competencias;

-- CRITERIOS: Remove public access
DROP POLICY IF EXISTS "Allow public access to criterios" ON public.criterios;

-- CRITERIOS_TEXTOS: Remove public access
DROP POLICY IF EXISTS "Allow public access to criterios_textos" ON public.criterios_textos;

-- MODELOS_AVALIACAO: Remove public access
DROP POLICY IF EXISTS "Allow public access to modelos_avaliacao" ON public.modelos_avaliacao;

-- MODELOS_COMPETENCIAS: Remove public access
DROP POLICY IF EXISTS "Allow public access to modelos_competencias" ON public.modelos_competencias;

-- PERGUNTAS_PERSONALIZADAS: Remove public access
DROP POLICY IF EXISTS "Allow public access to perguntas_personalizadas" ON public.perguntas_personalizadas;

-- PERGUNTAS_PERSONALIZADAS_TEXTOS: Remove public access
DROP POLICY IF EXISTS "Allow public read access to perguntas textos" ON public.perguntas_personalizadas_textos;

-- PDI_AUDIENCES: Remove duplicate policies, keep only the most specific one
DROP POLICY IF EXISTS "Public access to pdi_audiences for dev" ON public.pdi_audiences;
DROP POLICY IF EXISTS "Authenticated users can read pdi_audiences" ON public.pdi_audiences;

-- PDI_CONTENT_AUDIENCES: Remove duplicate policies
DROP POLICY IF EXISTS "Public access to pdi_content_audiences for dev" ON public.pdi_content_audiences;
DROP POLICY IF EXISTS "Authenticated users can read pdi_content_audiences" ON public.pdi_content_audiences;

-- PDI_CONTENT_COMPETENCIES: Remove duplicate policies
DROP POLICY IF EXISTS "Public access to pdi_content_competencies for dev" ON public.pdi_content_competencies;
DROP POLICY IF EXISTS "Authenticated users can read pdi_content_competencies" ON public.pdi_content_competencies;

-- PDI_CONTENT_TAGS: Remove duplicate policies
DROP POLICY IF EXISTS "Public access to pdi_content_tags for dev" ON public.pdi_content_tags;
DROP POLICY IF EXISTS "Authenticated users can read pdi_content_tags" ON public.pdi_content_tags;

-- PDI_CONTENTS: Remove duplicate policies
DROP POLICY IF EXISTS "Public access to pdi_contents for dev" ON public.pdi_contents;
DROP POLICY IF EXISTS "Authenticated users can read active pdi_contents" ON public.pdi_contents;

-- PDI_MEDIA_TYPES: Remove duplicate policies
DROP POLICY IF EXISTS "Public access to pdi_media_types for dev" ON public.pdi_media_types;
DROP POLICY IF EXISTS "Authenticated users can read pdi_media_types" ON public.pdi_media_types;

-- PDI_TAGS: Remove duplicate policies
DROP POLICY IF EXISTS "Public access to pdi_tags for dev" ON public.pdi_tags;
DROP POLICY IF EXISTS "Authenticated users can read pdi_tags" ON public.pdi_tags;

-- PDI_USER_ACTIONS: Remove public development access
DROP POLICY IF EXISTS "Public access to pdi_user_actions for dev" ON public.pdi_user_actions;

-- PDI_USER_CONTENTS: Remove public development access
DROP POLICY IF EXISTS "Public access to pdi_user_contents for dev" ON public.pdi_user_contents;

-- PERFIS: Consolidate to keep admin management and remove redundant authenticated view
DROP POLICY IF EXISTS "Authenticated users can view perfis" ON public.perfis;

-- =============================================================================
-- SUMMARY
-- =============================================================================

-- Dropped 57 unused indexes to improve write performance and reduce storage overhead
-- Removed 25+ overly permissive or duplicate RLS policies to strengthen security
-- Remaining policies now provide clear, non-overlapping access controls