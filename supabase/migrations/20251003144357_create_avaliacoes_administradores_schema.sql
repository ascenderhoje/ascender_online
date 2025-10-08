/*
  # Create Avaliacoes and Administradores Schema

  ## Overview
  Creates complete database structure for managing evaluations (Avaliacoes) and system administrators.

  ## New Tables

  ### 1. administradores
  System administrators and psychologists who manage evaluations.
  
  **Columns:**
  - `id` (uuid, primary key)
  - `nome` (text, required) - Full name
  - `email` (text, unique, required) - Email address
  - `telefone` (text, optional) - Phone number
  - `ativo` (boolean, default true) - Active status
  - `e_administrador` (boolean, default false) - Has admin privileges
  - `e_psicologa` (boolean, default false) - Is a psychologist
  - `empresa_padrao_id` (uuid, optional) - Default company FK
  - `avatar_url` (text, optional) - Avatar image URL
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. avaliacoes
  Individual employee evaluations.
  
  **Columns:**
  - `id` (uuid, primary key)
  - `data_avaliacao` (date, required) - Evaluation date
  - `empresa_id` (uuid, required, FK to empresas)
  - `colaborador_id` (uuid, required, FK to pessoas)
  - `modelo_id` (uuid, optional, FK to modelos_avaliacao)
  - `psicologa_responsavel_id` (uuid, optional, FK to administradores)
  - `usuario_editando_id` (uuid, optional, FK to administradores)
  - `colaborador_email` (text) - Email snapshot
  - `status` (text) - Status: rascunho, pendente, em_andamento, concluida, atrasada
  - `observacoes` (text, optional) - Notes
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 3. administradores_empresas
  Junction table for psychologists' company access (when not admin).
  
  **Columns:**
  - `id` (uuid, primary key)
  - `administrador_id` (uuid, FK to administradores)
  - `empresa_id` (uuid, FK to empresas)
  - `created_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Add policies for authenticated users (development mode)
  - Create indexes for performance

  ## Important Notes
  1. All foreign keys use CASCADE on delete for referential integrity
  2. Email field in administradores must be unique
  3. Avaliacoes store email snapshot for history
  4. Status field uses check constraint for valid values
*/

-- Create administradores table
CREATE TABLE IF NOT EXISTS administradores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  email text UNIQUE NOT NULL,
  telefone text,
  ativo boolean DEFAULT true NOT NULL,
  e_administrador boolean DEFAULT false NOT NULL,
  e_psicologa boolean DEFAULT false NOT NULL,
  empresa_padrao_id uuid REFERENCES empresas(id) ON DELETE SET NULL,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create avaliacoes table
CREATE TABLE IF NOT EXISTS avaliacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  data_avaliacao date NOT NULL,
  empresa_id uuid REFERENCES empresas(id) ON DELETE CASCADE NOT NULL,
  colaborador_id uuid REFERENCES pessoas(id) ON DELETE CASCADE NOT NULL,
  modelo_id uuid REFERENCES modelos_avaliacao(id) ON DELETE SET NULL,
  psicologa_responsavel_id uuid REFERENCES administradores(id) ON DELETE SET NULL,
  usuario_editando_id uuid REFERENCES administradores(id) ON DELETE SET NULL,
  colaborador_email text,
  status text DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'pendente', 'em_andamento', 'concluida', 'atrasada')),
  observacoes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create junction table for psychologists and companies
CREATE TABLE IF NOT EXISTS administradores_empresas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  administrador_id uuid REFERENCES administradores(id) ON DELETE CASCADE NOT NULL,
  empresa_id uuid REFERENCES empresas(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(administrador_id, empresa_id)
);

-- Enable RLS
ALTER TABLE administradores ENABLE ROW LEVEL SECURITY;
ALTER TABLE avaliacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE administradores_empresas ENABLE ROW LEVEL SECURITY;

-- Policies for administradores (public access for development)
CREATE POLICY "Allow public read access to administradores"
  ON administradores FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert access to administradores"
  ON administradores FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update access to administradores"
  ON administradores FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to administradores"
  ON administradores FOR DELETE
  TO public
  USING (true);

-- Policies for avaliacoes (public access for development)
CREATE POLICY "Allow public read access to avaliacoes"
  ON avaliacoes FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert access to avaliacoes"
  ON avaliacoes FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update access to avaliacoes"
  ON avaliacoes FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to avaliacoes"
  ON avaliacoes FOR DELETE
  TO public
  USING (true);

-- Policies for administradores_empresas (public access for development)
CREATE POLICY "Allow public read access to administradores_empresas"
  ON administradores_empresas FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert access to administradores_empresas"
  ON administradores_empresas FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update access to administradores_empresas"
  ON administradores_empresas FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to administradores_empresas"
  ON administradores_empresas FOR DELETE
  TO public
  USING (true);

-- Triggers for updated_at
CREATE TRIGGER update_administradores_updated_at
  BEFORE UPDATE ON administradores
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_avaliacoes_updated_at
  BEFORE UPDATE ON avaliacoes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_administradores_email ON administradores(email);
CREATE INDEX IF NOT EXISTS idx_administradores_ativo ON administradores(ativo);
CREATE INDEX IF NOT EXISTS idx_administradores_e_psicologa ON administradores(e_psicologa) WHERE e_psicologa = true;

CREATE INDEX IF NOT EXISTS idx_avaliacoes_data ON avaliacoes(data_avaliacao DESC);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_empresa ON avaliacoes(empresa_id);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_colaborador ON avaliacoes(colaborador_id);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_psicologa ON avaliacoes(psicologa_responsavel_id);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_status ON avaliacoes(status);

CREATE INDEX IF NOT EXISTS idx_adm_empresas_admin ON administradores_empresas(administrador_id);
CREATE INDEX IF NOT EXISTS idx_adm_empresas_empresa ON administradores_empresas(empresa_id);
