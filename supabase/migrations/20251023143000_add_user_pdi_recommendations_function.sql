/*
  # Função para Recomendações de Conteúdo PDI Baseadas em Avaliações

  ## Visão Geral
  Cria uma função para buscar recomendações personalizadas de conteúdos PDI
  baseadas nas tags marcadas na avaliação mais recente do usuário.

  ## Funcionalidades

  ### Função get_user_pdi_tag_recommendations
    - Busca as tags da avaliação mais recente finalizada do usuário
    - Retorna conteúdos PDI que possuem pelo menos uma tag em comum
    - Exclui conteúdos já adicionados ao PDI do usuário
    - Ordena por número de tags em comum (relevância) e rating médio
    - Retorna apenas conteúdos ativos

  ## Parâmetros
    - p_user_id (uuid) - ID do usuário

  ## Retorno
    - content_id (uuid) - ID do conteúdo
    - matching_tags_count (bigint) - Quantidade de tags em comum
    - titulo (text) - Título do conteúdo
    - avg_rating (numeric) - Rating médio do conteúdo
*/

-- Função para obter recomendações de conteúdo PDI baseadas nas tags da última avaliação
CREATE OR REPLACE FUNCTION get_user_pdi_tag_recommendations(p_user_id uuid)
RETURNS TABLE (
  content_id uuid,
  matching_tags_count bigint,
  titulo text,
  avg_rating numeric
) AS $$
DECLARE
  user_tags jsonb;
BEGIN
  -- Buscar tags da avaliação mais recente finalizada do usuário
  SELECT a.pdi_tags INTO user_tags
  FROM avaliacoes a
  WHERE a.colaborador_id = p_user_id
    AND a.status = 'finalizada'
    AND a.pdi_tags IS NOT NULL
    AND jsonb_array_length(a.pdi_tags) > 0
  ORDER BY a.data_avaliacao DESC
  LIMIT 1;

  -- Se não encontrou tags, retornar vazio
  IF user_tags IS NULL THEN
    RETURN;
  END IF;

  -- Buscar conteúdos que possuem tags em comum
  RETURN QUERY
  WITH user_tag_ids AS (
    -- Extrair IDs das tags do jsonb
    SELECT (jsonb_array_elements_text(user_tags))::uuid AS tag_id
  ),
  matching_contents AS (
    -- Encontrar conteúdos com tags em comum
    SELECT
      pct.content_id,
      COUNT(DISTINCT pct.tag_id) AS matching_tags_count
    FROM pdi_content_tags pct
    INNER JOIN user_tag_ids uti ON pct.tag_id = uti.tag_id
    GROUP BY pct.content_id
  )
  SELECT
    pc.id AS content_id,
    mc.matching_tags_count,
    pc.titulo,
    pc.avg_rating
  FROM pdi_contents pc
  INNER JOIN matching_contents mc ON pc.id = mc.content_id
  WHERE pc.is_active = true
    -- Excluir conteúdos já adicionados ao PDI do usuário
    AND NOT EXISTS (
      SELECT 1
      FROM pdi_user_contents puc
      WHERE puc.user_id = p_user_id
        AND puc.content_id = pc.id
    )
  ORDER BY mc.matching_tags_count DESC, pc.avg_rating DESC, pc.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar índice para otimizar a busca de avaliações por colaborador
CREATE INDEX IF NOT EXISTS idx_avaliacoes_colaborador_status
  ON avaliacoes(colaborador_id, status, data_avaliacao DESC)
  WHERE status = 'finalizada' AND pdi_tags IS NOT NULL;

-- Comentário na função
COMMENT ON FUNCTION get_user_pdi_tag_recommendations(uuid) IS
  'Retorna recomendações de conteúdos PDI baseadas nas tags da última avaliação finalizada do usuário';
