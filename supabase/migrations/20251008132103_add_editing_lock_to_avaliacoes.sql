/*
  # Add Editing Lock to Avaliacoes

  ## Overview
  Adds fields to track which user is currently editing an evaluation to prevent concurrent editing conflicts.

  ## Changes to avaliacoes table
  
  **New Columns:**
  - `editing_user_id` (uuid) - ID of the user currently editing this evaluation
  - `editing_user_name` (text) - Name of the user currently editing (for display)
  - `editing_started_at` (timestamptz) - When the user started editing
  
  ## Important Notes
  1. These fields are nullable - when no one is editing, they are NULL
  2. editing_user_id references pessoas table
  3. System should automatically release lock after certain time (handled in application)
  4. Lock is released when user saves or navigates away
*/

-- Add editing lock fields to avaliacoes table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'avaliacoes' AND column_name = 'editing_user_id'
  ) THEN
    ALTER TABLE avaliacoes ADD COLUMN editing_user_id uuid REFERENCES pessoas(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'avaliacoes' AND column_name = 'editing_user_name'
  ) THEN
    ALTER TABLE avaliacoes ADD COLUMN editing_user_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'avaliacoes' AND column_name = 'editing_started_at'
  ) THEN
    ALTER TABLE avaliacoes ADD COLUMN editing_started_at timestamptz;
  END IF;
END $$;

-- Create index for faster lookup of locked evaluations
CREATE INDEX IF NOT EXISTS idx_avaliacoes_editing_user 
  ON avaliacoes(editing_user_id) WHERE editing_user_id IS NOT NULL;
