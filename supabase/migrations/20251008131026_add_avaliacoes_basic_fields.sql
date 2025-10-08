/*
  # Add Basic Fields to Avaliacoes with Multi-language Support

  ## Overview
  Adds multi-language support for basic evaluation fields that appear in all evaluations.

  ## New Tables

  ### avaliacoes_textos
  Stores multi-language text content for basic evaluation fields.
  
  **Columns:**
  - `id` (uuid, primary key)
  - `avaliacao_id` (uuid, required, FK to avaliacoes)
  - `idioma` (text, required) - Language code (pt-BR, en-US, es-ES)
  - `oportunidades_melhoria` (text) - Opportunities for improvement
  - `pontos_fortes` (text) - Strengths
  - `highlights_psicologa` (text) - Psychologist highlights
  - `idioma_padrao` (boolean, default false) - Whether this is the default language
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## Security
  - Enable RLS on the table
  - Add policies for public access (development mode)
  - Create indexes for query performance

  ## Important Notes
  1. Unique constraint on avaliacao_id + idioma to prevent duplicate language entries
  2. Foreign key uses CASCADE on delete for data integrity
  3. Text fields support rich text content (stored as HTML or markdown)
*/

-- Create avaliacoes_textos table
CREATE TABLE IF NOT EXISTS avaliacoes_textos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  avaliacao_id uuid NOT NULL REFERENCES avaliacoes(id) ON DELETE CASCADE,
  idioma text NOT NULL DEFAULT 'pt-BR' CHECK (idioma IN ('pt-BR', 'en-US', 'es-ES')),
  oportunidades_melhoria text DEFAULT '',
  pontos_fortes text DEFAULT '',
  highlights_psicologa text DEFAULT '',
  idioma_padrao boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(avaliacao_id, idioma)
);

-- Enable RLS
ALTER TABLE avaliacoes_textos ENABLE ROW LEVEL SECURITY;

-- Policies for avaliacoes_textos (public access for development)
CREATE POLICY "Allow public read access to avaliacoes_textos"
  ON avaliacoes_textos FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert access to avaliacoes_textos"
  ON avaliacoes_textos FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update access to avaliacoes_textos"
  ON avaliacoes_textos FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to avaliacoes_textos"
  ON avaliacoes_textos FOR DELETE
  TO public
  USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_avaliacoes_textos_updated_at
  BEFORE UPDATE ON avaliacoes_textos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_avaliacoes_textos_avaliacao 
  ON avaliacoes_textos(avaliacao_id);

CREATE INDEX IF NOT EXISTS idx_avaliacoes_textos_idioma 
  ON avaliacoes_textos(idioma);

CREATE INDEX IF NOT EXISTS idx_avaliacoes_textos_idioma_padrao 
  ON avaliacoes_textos(idioma_padrao) WHERE idioma_padrao = true;
