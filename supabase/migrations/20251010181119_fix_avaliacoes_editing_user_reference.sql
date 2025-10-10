/*
  # Fix Avaliacoes Editing User Reference

  1. Changes
    - Clear orphaned editing_user_id references
    - Drop the existing foreign key constraint from editing_user_id to pessoas table
    - Create a new foreign key constraint from editing_user_id to administradores table
    - This ensures editing_user_id correctly references the administradores who edit avaliacoes
  
  2. Security
    - No changes to RLS policies needed
*/

-- Clear orphaned editing_user_id references
UPDATE avaliacoes 
SET editing_user_id = NULL, 
    editing_user_name = NULL, 
    editing_started_at = NULL
WHERE editing_user_id IS NOT NULL 
  AND editing_user_id NOT IN (SELECT id FROM administradores);

-- Drop the existing foreign key constraint
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_avaliacoes_editing_user' 
    AND table_name = 'avaliacoes'
  ) THEN
    ALTER TABLE avaliacoes DROP CONSTRAINT fk_avaliacoes_editing_user;
  END IF;
END $$;

-- Add new foreign key constraint to administradores table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'avaliacoes_editing_user_id_fkey' 
    AND table_name = 'avaliacoes'
  ) THEN
    ALTER TABLE avaliacoes 
    ADD CONSTRAINT avaliacoes_editing_user_id_fkey 
    FOREIGN KEY (editing_user_id) 
    REFERENCES administradores(id)
    ON DELETE SET NULL;
  END IF;
END $$;
