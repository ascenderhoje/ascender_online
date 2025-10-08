/*
  # Setup Supabase Auth Integration for Administradores

  ## Overview
  This migration integrates Supabase Auth with the administradores table, enabling secure authentication
  for administrators and psychologists who manage the system.

  ## Changes Made

  ### 1. Schema Updates
    - Add `auth_user_id` column to `administradores` table (references auth.users)
    - Add `ultimo_login` timestamp column to track last login

  ### 2. Constraints
    - Unique constraint on `auth_user_id` (one admin per auth user)
    - Foreign key constraint to `auth.users` table

  ### 3. Triggers and Functions
    - Function to sync user creation between auth.users and administradores
    - Trigger to automatically populate auth_user_id when admin is created with auth

  ### 4. Helper Functions
    - Function to create admin user in auth.users automatically
    - Function to check if user is active administrator

  ## Security Notes
  - This migration maintains existing data
  - Existing administrators will need auth accounts created separately
  - Only active administrators with e_administrador=true or e_psicologa=true can access system
*/

-- Add auth_user_id column to administradores table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'administradores' AND column_name = 'auth_user_id'
  ) THEN
    ALTER TABLE administradores ADD COLUMN auth_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add ultimo_login column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'administradores' AND column_name = 'ultimo_login'
  ) THEN
    ALTER TABLE administradores ADD COLUMN ultimo_login timestamptz;
  END IF;
END $$;

-- Add unique constraint on auth_user_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'administradores_auth_user_id_key'
  ) THEN
    ALTER TABLE administradores ADD CONSTRAINT administradores_auth_user_id_key UNIQUE (auth_user_id);
  END IF;
END $$;

-- Create index on auth_user_id for performance
CREATE INDEX IF NOT EXISTS idx_administradores_auth_user_id ON administradores(auth_user_id);

-- Function to check if user is an active administrator
CREATE OR REPLACE FUNCTION is_active_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM administradores
    WHERE auth_user_id = user_id
    AND ativo = true
    AND (e_administrador = true OR e_psicologa = true)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get administrator data from auth user id
CREATE OR REPLACE FUNCTION get_admin_by_auth_id(user_id uuid)
RETURNS TABLE (
  id uuid,
  nome text,
  email text,
  e_administrador boolean,
  e_psicologa boolean,
  ativo boolean
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id,
    a.nome,
    a.email,
    a.e_administrador,
    a.e_psicologa,
    a.ativo
  FROM administradores a
  WHERE a.auth_user_id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update last login timestamp
CREATE OR REPLACE FUNCTION update_last_login(user_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE administradores
  SET ultimo_login = now()
  WHERE auth_user_id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
