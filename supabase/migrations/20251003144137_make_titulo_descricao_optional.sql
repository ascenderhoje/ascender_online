/*
  # Make titulo and descricao optional in perguntas_personalizadas

  ## Changes
  - Drop NOT NULL constraints from titulo and descricao columns
  - These fields are now stored in perguntas_personalizadas_textos
*/

-- Make titulo and descricao nullable
ALTER TABLE perguntas_personalizadas 
ALTER COLUMN titulo DROP NOT NULL;

ALTER TABLE perguntas_personalizadas 
ALTER COLUMN descricao DROP NOT NULL;

-- Set defaults for existing NULL values
UPDATE perguntas_personalizadas 
SET titulo = '' 
WHERE titulo IS NULL;

UPDATE perguntas_personalizadas 
SET descricao = '' 
WHERE descricao IS NULL;
