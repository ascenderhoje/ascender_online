/*
  # Fix Editing Lock Foreign Key Constraint

  ## Overview
  Fixes the foreign key constraint for editing_user_id to have an explicit name,
  preventing ambiguity when querying relationships between avaliacoes and pessoas.

  ## Changes
  1. Drop the existing foreign key constraint if it exists
  2. Recreate it with an explicit constraint name
  
  ## Important Notes
  - This fixes the "more than one relationship" error
  - The constraint is named explicitly to differentiate from colaborador_id FK
*/

-- Drop the existing constraint if it exists (it may have an auto-generated name)
DO $$
DECLARE
    constraint_name text;
BEGIN
    -- Find the constraint name for editing_user_id
    SELECT con.conname INTO constraint_name
    FROM pg_constraint con
    INNER JOIN pg_class rel ON rel.oid = con.conrelid
    INNER JOIN pg_attribute att ON att.attrelid = con.conrelid AND att.attnum = ANY(con.conkey)
    WHERE rel.relname = 'avaliacoes'
    AND att.attname = 'editing_user_id'
    AND con.contype = 'f';
    
    -- Drop the constraint if found
    IF constraint_name IS NOT NULL THEN
        EXECUTE format('ALTER TABLE avaliacoes DROP CONSTRAINT %I', constraint_name);
    END IF;
END $$;

-- Add the foreign key constraint with an explicit name
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'fk_avaliacoes_editing_user'
    ) THEN
        ALTER TABLE avaliacoes 
        ADD CONSTRAINT fk_avaliacoes_editing_user 
        FOREIGN KEY (editing_user_id) 
        REFERENCES pessoas(id) 
        ON DELETE SET NULL;
    END IF;
END $$;
