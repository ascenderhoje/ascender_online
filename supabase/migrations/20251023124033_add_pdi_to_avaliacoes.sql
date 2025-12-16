/*
  # Adicionar Campos de PDI às Avaliações

  ## Visão Geral
  Adiciona campos para que a psicóloga possa incluir sugestões de desenvolvimento
  vinculadas a tags do PDI nas avaliações dos colaboradores.

  ## Mudanças

  ### Tabela avaliacoes
    - Adiciona `pdi_tags` (jsonb) - Array de IDs de tags selecionadas
    - Adiciona `pdi_suggestions_text` (text) - Texto livre de sugestões

  ## Funcionalidades
  - As tags e sugestões serão usadas para gerar recomendações automáticas
  - Campo de sugestões pode conter orientações personalizadas da psicóloga
*/

-- Adicionar coluna pdi_tags à tabela avaliacoes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'avaliacoes' AND column_name = 'pdi_tags'
  ) THEN
    ALTER TABLE avaliacoes ADD COLUMN pdi_tags jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Adicionar coluna pdi_suggestions_text à tabela avaliacoes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'avaliacoes' AND column_name = 'pdi_suggestions_text'
  ) THEN
    ALTER TABLE avaliacoes ADD COLUMN pdi_suggestions_text text;
  END IF;
END $$;

-- Criar índice GIN para busca eficiente em pdi_tags
CREATE INDEX IF NOT EXISTS idx_avaliacoes_pdi_tags ON avaliacoes USING gin (pdi_tags);

-- Criar índice para busca por colaborador (útil para recomendações)
CREATE INDEX IF NOT EXISTS idx_avaliacoes_colaborador_data ON avaliacoes(colaborador_id, data_avaliacao DESC);

-- Função para obter última avaliação com sugestões PDI de um usuário
CREATE OR REPLACE FUNCTION get_user_latest_pdi_suggestions(p_user_id uuid)
RETURNS TABLE (
  avaliacao_id uuid,
  pdi_tags jsonb,
  pdi_suggestions_text text,
  data_avaliacao date
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id,
    a.pdi_tags,
    a.pdi_suggestions_text,
    a.data_avaliacao
  FROM avaliacoes a
  WHERE a.colaborador_id = p_user_id
    AND a.pdi_tags IS NOT NULL
    AND jsonb_array_length(a.pdi_tags) > 0
  ORDER BY a.data_avaliacao DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;