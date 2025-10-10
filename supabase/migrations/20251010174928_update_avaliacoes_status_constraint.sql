/*
  # Update Avaliacoes Status Constraint

  ## Overview
  Updates the status field constraint in the avaliacoes table to support the new workflow with "rascunho" and "finalizada" statuses.

  ## Changes
  
  ### 1. Drop and Recreate Status Constraint
  - Remove old constraint that includes statuses like 'pendente', 'em_andamento', 'concluida', 'atrasada'
  - Create new simplified constraint with only 'rascunho' and 'finalizada'
  - Keep status default value as 'rascunho' for new evaluations
  
  ### 2. Update Default Value
  - Ensure status field defaults to 'rascunho' for new records
  
  ## Important Notes
  1. This migration changes the allowed status values to only 'rascunho' and 'finalizada'
  2. Existing records with other statuses will be migrated to 'rascunho'
  3. The system now follows a simpler workflow: draft → finalized
  4. Status 'rascunho' allows editing, 'finalizada' blocks editing
*/

-- First, update any existing records with old statuses to 'rascunho'
UPDATE avaliacoes 
SET status = 'rascunho' 
WHERE status NOT IN ('rascunho', 'finalizada') OR status IS NULL;

-- Drop the old constraint
ALTER TABLE avaliacoes DROP CONSTRAINT IF EXISTS avaliacoes_status_check;

-- Add new constraint with only rascunho and finalizada
ALTER TABLE avaliacoes 
ADD CONSTRAINT avaliacoes_status_check 
CHECK (status IN ('rascunho', 'finalizada'));

-- Ensure default value is set to 'rascunho'
ALTER TABLE avaliacoes 
ALTER COLUMN status SET DEFAULT 'rascunho';

-- Ensure status is NOT NULL
ALTER TABLE avaliacoes 
ALTER COLUMN status SET NOT NULL;

-- Create index for filtering by status
CREATE INDEX IF NOT EXISTS idx_avaliacoes_status_filter 
ON avaliacoes(status) WHERE status = 'rascunho';
