/*
  # Add Authentication Support to Pessoas Table

  ## Overview
  This migration adds authentication capabilities to the pessoas (people/collaborators) table,
  enabling them to log in to their own dedicated user panel.

  ## Changes Made

  ### 1. Schema Updates
    - Add `auth_user_id` column to `pessoas` table (references auth.users)
    - Add `senha_definida` boolean column to track if user has set their password
    - Add `ultimo_login` timestamp column to track last login
    - Add `ativo` boolean column to control if user can login

  ### 2. Constraints
    - Unique constraint on `auth_user_id` (one pessoa per auth user)
    - Foreign key constraint to `auth.users` table with CASCADE on delete

  ### 3. Indexes
    - Index on `auth_user_id` for performance
    - Index on `email` for login lookups
    - Index on `ativo` for filtering active users

  ## Security Notes
  - Maintains existing data (existing pessoas will need auth accounts created separately)
  - Only active pessoas with valid auth_user_id can login
  - Separation between admin users (administradores) and collaborator users (pessoas)
*/

-- Add auth_user_id column to pessoas table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pessoas' AND column_name = 'auth_user_id'
  ) THEN
    ALTER TABLE pessoas ADD COLUMN auth_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add senha_definida column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pessoas' AND column_name = 'senha_definida'
  ) THEN
    ALTER TABLE pessoas ADD COLUMN senha_definida boolean DEFAULT false NOT NULL;
  END IF;
END $$;

-- Add ultimo_login column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pessoas' AND column_name = 'ultimo_login'
  ) THEN
    ALTER TABLE pessoas ADD COLUMN ultimo_login timestamptz;
  END IF;
END $$;

-- Add ativo column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pessoas' AND column_name = 'ativo'
  ) THEN
    ALTER TABLE pessoas ADD COLUMN ativo boolean DEFAULT true NOT NULL;
  END IF;
END $$;

-- Add unique constraint on auth_user_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'pessoas_auth_user_id_key'
  ) THEN
    ALTER TABLE pessoas ADD CONSTRAINT pessoas_auth_user_id_key UNIQUE (auth_user_id);
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_pessoas_auth_user_id ON pessoas(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_pessoas_email ON pessoas(email);
CREATE INDEX IF NOT EXISTS idx_pessoas_ativo ON pessoas(ativo) WHERE ativo = true;

-- Function to check if user is an active pessoa
CREATE OR REPLACE FUNCTION is_active_pessoa(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM pessoas
    WHERE auth_user_id = user_id
    AND ativo = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get pessoa data from auth user id
CREATE OR REPLACE FUNCTION get_pessoa_by_auth_id(user_id uuid)
RETURNS TABLE (
  id uuid,
  nome text,
  email text,
  tipo_acesso text,
  ativo boolean,
  empresa_id uuid
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.nome,
    p.email,
    p.tipo_acesso,
    p.ativo,
    p.empresa_id
  FROM pessoas p
  WHERE p.auth_user_id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update last login timestamp for pessoa
CREATE OR REPLACE FUNCTION update_pessoa_last_login(user_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE pessoas
  SET ultimo_login = now()
  WHERE auth_user_id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;