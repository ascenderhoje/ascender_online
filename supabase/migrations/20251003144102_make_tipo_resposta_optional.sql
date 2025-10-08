/*
  # Make tipo_resposta optional in perguntas_personalizadas

  ## Changes
  - Drop NOT NULL constraint from tipo_resposta column
  - Set default value for existing records
*/

-- Make tipo_resposta nullable
ALTER TABLE perguntas_personalizadas 
ALTER COLUMN tipo_resposta DROP NOT NULL;

-- Set default for existing NULL values
UPDATE perguntas_personalizadas 
SET tipo_resposta = 'texto' 
WHERE tipo_resposta IS NULL;
