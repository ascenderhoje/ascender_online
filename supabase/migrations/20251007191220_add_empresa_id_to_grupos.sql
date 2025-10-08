/*
  # Add empresa_id to grupos table

  1. Changes
    - Add empresa_id column to grupos table
    - Add foreign key constraint to empresas
    - Migrate existing data from empresas_grupos to grupos.empresa_id
    - Drop empresas_grupos table (no longer needed)
  
  2. Description
    - Each grupo now belongs to exactly one empresa
    - This replaces the N:N relationship with a 1:N relationship
  
  3. Security
    - Maintain existing RLS policies on grupos table
*/

-- Add empresa_id column to grupos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'grupos' AND column_name = 'empresa_id'
  ) THEN
    ALTER TABLE grupos ADD COLUMN empresa_id uuid REFERENCES empresas(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Migrate existing data from empresas_grupos to grupos.empresa_id
-- Take the first empresa for each grupo
UPDATE grupos g
SET empresa_id = (
  SELECT eg.empresa_id
  FROM empresas_grupos eg
  WHERE eg.grupo_id = g.id
  LIMIT 1
)
WHERE empresa_id IS NULL
  AND EXISTS (
    SELECT 1 FROM empresas_grupos eg WHERE eg.grupo_id = g.id
  );

-- Drop the empresas_grupos table since we no longer need N:N relationship
DROP TABLE IF EXISTS empresas_grupos CASCADE;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_grupos_empresa_id ON grupos(empresa_id);
