/*
  # Add Development Suggestions Field to Evaluation Texts

  ## Overview
  Adds a new field to store personalized development suggestions from psychologists
  in the evaluation texts table, with full multi-language support.

  ## Changes

  ### avaliacoes_textos table
    - Adds `sugestoes_desenvolvimento` (text) - Development suggestions field
    - Follows the same multi-language pattern as existing fields
    - Default empty string for consistency with other text fields

  ## Important Notes
  1. This field will be used together with pdi_tags to generate personalized recommendations
  2. Supports rich text content (stored as HTML)
  3. Available in all three languages (pt-BR, en-US, es-ES)
*/

-- Add sugestoes_desenvolvimento column to avaliacoes_textos table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'avaliacoes_textos' AND column_name = 'sugestoes_desenvolvimento'
  ) THEN
    ALTER TABLE avaliacoes_textos ADD COLUMN sugestoes_desenvolvimento text DEFAULT '';
  END IF;
END $$;