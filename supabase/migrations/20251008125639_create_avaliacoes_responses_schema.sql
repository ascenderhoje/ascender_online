/*
  # Create Avaliacoes Responses Schema

  ## Overview
  Creates tables to store evaluation responses for custom questions and competency ratings.

  ## New Tables

  ### 1. avaliacoes_respostas
  Stores answers to custom questions (perguntas_personalizadas) for each evaluation.
  
  **Columns:**
  - `id` (uuid, primary key)
  - `avaliacao_id` (uuid, required, FK to avaliacoes)
  - `pergunta_id` (uuid, required, FK to perguntas_personalizadas)
  - `resposta_texto` (text, optional) - Text answers
  - `resposta_opcoes` (jsonb, optional) - Multiple choice answers
  - `resposta_numero` (numeric, optional) - Numeric/scale answers
  - `resposta_data` (date, optional) - Date answers
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. avaliacoes_competencias
  Stores ratings for competency criteria in each evaluation.
  
  **Columns:**
  - `id` (uuid, primary key)
  - `avaliacao_id` (uuid, required, FK to avaliacoes)
  - `competencia_id` (uuid, required, FK to competencias)
  - `criterio_id` (uuid, required, FK to criterios)
  - `pontuacao` (numeric, optional) - Rating score
  - `observacoes` (text, optional) - Additional notes
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Add policies for public access (development mode)
  - Create indexes for query performance

  ## Important Notes
  1. Unique constraint on avaliacao_id + pergunta_id to prevent duplicate answers
  2. Unique constraint on avaliacao_id + criterio_id to prevent duplicate ratings
  3. All foreign keys use CASCADE on delete for data integrity
  4. Multiple response type fields to handle different question types
*/

-- Create avaliacoes_respostas table
CREATE TABLE IF NOT EXISTS avaliacoes_respostas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  avaliacao_id uuid NOT NULL REFERENCES avaliacoes(id) ON DELETE CASCADE,
  pergunta_id uuid NOT NULL REFERENCES perguntas_personalizadas(id) ON DELETE CASCADE,
  resposta_texto text,
  resposta_opcoes jsonb DEFAULT '[]'::jsonb,
  resposta_numero numeric,
  resposta_data date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(avaliacao_id, pergunta_id)
);

-- Create avaliacoes_competencias table
CREATE TABLE IF NOT EXISTS avaliacoes_competencias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  avaliacao_id uuid NOT NULL REFERENCES avaliacoes(id) ON DELETE CASCADE,
  competencia_id uuid NOT NULL REFERENCES competencias(id) ON DELETE CASCADE,
  criterio_id uuid NOT NULL REFERENCES criterios(id) ON DELETE CASCADE,
  pontuacao numeric,
  observacoes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(avaliacao_id, criterio_id)
);

-- Enable RLS
ALTER TABLE avaliacoes_respostas ENABLE ROW LEVEL SECURITY;
ALTER TABLE avaliacoes_competencias ENABLE ROW LEVEL SECURITY;

-- Policies for avaliacoes_respostas (public access for development)
CREATE POLICY "Allow public read access to avaliacoes_respostas"
  ON avaliacoes_respostas FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert access to avaliacoes_respostas"
  ON avaliacoes_respostas FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update access to avaliacoes_respostas"
  ON avaliacoes_respostas FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to avaliacoes_respostas"
  ON avaliacoes_respostas FOR DELETE
  TO public
  USING (true);

-- Policies for avaliacoes_competencias (public access for development)
CREATE POLICY "Allow public read access to avaliacoes_competencias"
  ON avaliacoes_competencias FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert access to avaliacoes_competencias"
  ON avaliacoes_competencias FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update access to avaliacoes_competencias"
  ON avaliacoes_competencias FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to avaliacoes_competencias"
  ON avaliacoes_competencias FOR DELETE
  TO public
  USING (true);

-- Triggers for updated_at
CREATE TRIGGER update_avaliacoes_respostas_updated_at
  BEFORE UPDATE ON avaliacoes_respostas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_avaliacoes_competencias_updated_at
  BEFORE UPDATE ON avaliacoes_competencias
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_avaliacoes_respostas_avaliacao 
  ON avaliacoes_respostas(avaliacao_id);

CREATE INDEX IF NOT EXISTS idx_avaliacoes_respostas_pergunta 
  ON avaliacoes_respostas(pergunta_id);

CREATE INDEX IF NOT EXISTS idx_avaliacoes_competencias_avaliacao 
  ON avaliacoes_competencias(avaliacao_id);

CREATE INDEX IF NOT EXISTS idx_avaliacoes_competencias_competencia 
  ON avaliacoes_competencias(competencia_id);

CREATE INDEX IF NOT EXISTS idx_avaliacoes_competencias_criterio 
  ON avaliacoes_competencias(criterio_id);
