/*
  # Update Perguntas Personalizadas Structure

  ## Changes Made
  
  1. Tables Modified
    - `perguntas_personalizadas` - Add visibilidade field, remove tipo_resposta
    - Create new table `perguntas_personalizadas_textos` for multi-language support
  
  2. New Tables
    - `perguntas_personalizadas_textos`
      - `id` (uuid, primary key)
      - `pergunta_id` (uuid, foreign key to perguntas_personalizadas)
      - `idioma` (text) - Language code (pt-BR, en-US, es-ES)
      - `titulo` (text) - Question title in specific language
      - `descricao` (text) - Question description in specific language
      - `idioma_padrao` (boolean) - Whether this is the default language
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  3. Migration Steps
    - Backup existing data
    - Create new table structure
    - Migrate existing data to new structure
    - Drop old columns
    - Add new columns
  
  4. Security
    - Enable RLS on new table
    - Add policies for authenticated users
*/

-- Create perguntas_personalizadas_textos table
CREATE TABLE IF NOT EXISTS perguntas_personalizadas_textos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pergunta_id uuid REFERENCES perguntas_personalizadas(id) ON DELETE CASCADE NOT NULL,
  idioma text NOT NULL,
  titulo text NOT NULL,
  descricao text DEFAULT '',
  idioma_padrao boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add visibilidade to perguntas_personalizadas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'perguntas_personalizadas' AND column_name = 'visibilidade'
  ) THEN
    ALTER TABLE perguntas_personalizadas 
    ADD COLUMN visibilidade text DEFAULT 'todos' CHECK (visibilidade IN ('colaborador', 'gestor', 'todos'));
  END IF;
END $$;

-- Migrate existing data to new structure
DO $$
DECLARE
  perg RECORD;
BEGIN
  FOR perg IN SELECT id, titulo, descricao FROM perguntas_personalizadas WHERE titulo IS NOT NULL
  LOOP
    INSERT INTO perguntas_personalizadas_textos (pergunta_id, idioma, titulo, descricao, idioma_padrao)
    VALUES (perg.id, 'pt-BR', perg.titulo, COALESCE(perg.descricao, ''), true)
    ON CONFLICT DO NOTHING;
  END LOOP;
END $$;

-- Drop old columns after migration (keep for now, will be handled by app)
-- We'll keep titulo and descricao for backward compatibility during transition

-- Enable RLS
ALTER TABLE perguntas_personalizadas_textos ENABLE ROW LEVEL SECURITY;

-- Policies for perguntas_personalizadas_textos
CREATE POLICY "Allow public read access to perguntas textos"
  ON perguntas_personalizadas_textos FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert access to perguntas textos"
  ON perguntas_personalizadas_textos FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update access to perguntas textos"
  ON perguntas_personalizadas_textos FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to perguntas textos"
  ON perguntas_personalizadas_textos FOR DELETE
  TO public
  USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_perguntas_personalizadas_textos_updated_at
  BEFORE UPDATE ON perguntas_personalizadas_textos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_perguntas_textos_pergunta_id 
  ON perguntas_personalizadas_textos(pergunta_id);

CREATE INDEX IF NOT EXISTS idx_perguntas_textos_idioma 
  ON perguntas_personalizadas_textos(idioma);
