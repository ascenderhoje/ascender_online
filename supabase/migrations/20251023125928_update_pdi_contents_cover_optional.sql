/*
  # Tornar cover_image_url opcional em pdi_contents

  ## Alteração
  - Remove a restrição NOT NULL do campo cover_image_url
  - Permite que conteúdos sejam criados sem imagem de capa
*/

ALTER TABLE pdi_contents ALTER COLUMN cover_image_url DROP NOT NULL;