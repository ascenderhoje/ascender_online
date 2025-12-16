/*
  # Sistema de Agregação de Avaliações do PDI

  ## Visão Geral
  Cria trigger para atualizar automaticamente a média de avaliações dos conteúdos
  quando um usuário avalia um conteúdo após concluí-lo.

  ## Funcionalidades
  - Atualiza avg_rating e ratings_count em pdi_contents automaticamente
  - Trigger dispara quando pdi_user_contents é atualizado com rating_stars
*/

-- Função para atualizar agregação de ratings
CREATE OR REPLACE FUNCTION update_pdi_content_rating_agg()
RETURNS TRIGGER AS $$
BEGIN
  -- Recalcular média e contagem de avaliações
  UPDATE pdi_contents
  SET 
    avg_rating = (
      SELECT COALESCE(AVG(rating_stars), 0)
      FROM pdi_user_contents
      WHERE content_id = NEW.content_id
        AND rating_stars IS NOT NULL
    ),
    ratings_count = (
      SELECT COUNT(*)
      FROM pdi_user_contents
      WHERE content_id = NEW.content_id
        AND rating_stars IS NOT NULL
    )
  WHERE id = NEW.content_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar agregação quando rating é adicionado ou modificado
DROP TRIGGER IF EXISTS trigger_update_pdi_rating_agg ON pdi_user_contents;
CREATE TRIGGER trigger_update_pdi_rating_agg
  AFTER INSERT OR UPDATE OF rating_stars ON pdi_user_contents
  FOR EACH ROW
  WHEN (NEW.rating_stars IS NOT NULL)
  EXECUTE FUNCTION update_pdi_content_rating_agg();

-- Trigger para atualizar agregação quando rating é removido
CREATE OR REPLACE FUNCTION update_pdi_content_rating_on_delete()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE pdi_contents
  SET 
    avg_rating = (
      SELECT COALESCE(AVG(rating_stars), 0)
      FROM pdi_user_contents
      WHERE content_id = OLD.content_id
        AND rating_stars IS NOT NULL
    ),
    ratings_count = (
      SELECT COUNT(*)
      FROM pdi_user_contents
      WHERE content_id = OLD.content_id
        AND rating_stars IS NOT NULL
    )
  WHERE id = OLD.content_id;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_pdi_rating_on_delete ON pdi_user_contents;
CREATE TRIGGER trigger_update_pdi_rating_on_delete
  AFTER DELETE ON pdi_user_contents
  FOR EACH ROW
  WHEN (OLD.rating_stars IS NOT NULL)
  EXECUTE FUNCTION update_pdi_content_rating_on_delete();