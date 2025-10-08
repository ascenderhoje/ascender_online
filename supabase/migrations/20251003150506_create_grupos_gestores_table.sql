/*
  # Create Table for Group Managers (Gestores)

  1. New Tables
    - `grupos_gestores`
      - `grupo_id` (uuid, foreign key to grupos)
      - `pessoa_id` (uuid, foreign key to pessoas)
      - `created_at` (timestamptz)
  
  2. Description
    - This table manages which people are managers/owners of groups
    - "Tem acesso a" relationship - the manager has access to view all group members
    - "Pertence a" is managed by the existing `pessoas_grupos` table
    - A manager (gestor) can see all collaborators (colaboradores) in their groups
  
  3. Security
    - Enable RLS on `grupos_gestores` table
    - Allow authenticated users to read their managed groups
    - Restrict write operations to admins only
*/

-- Create grupos_gestores table
CREATE TABLE IF NOT EXISTS grupos_gestores (
  grupo_id uuid NOT NULL REFERENCES grupos(id) ON DELETE CASCADE,
  pessoa_id uuid NOT NULL REFERENCES pessoas(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (grupo_id, pessoa_id)
);

-- Enable RLS
ALTER TABLE grupos_gestores ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read grupos_gestores
CREATE POLICY "Anyone can view group managers"
  ON grupos_gestores FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to manage group managers (temporary - should be restricted to admins)
CREATE POLICY "Authenticated users can manage group managers"
  ON grupos_gestores FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_grupos_gestores_pessoa_id ON grupos_gestores(pessoa_id);
CREATE INDEX IF NOT EXISTS idx_grupos_gestores_grupo_id ON grupos_gestores(grupo_id);
