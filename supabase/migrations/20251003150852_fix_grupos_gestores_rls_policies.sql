/*
  # Fix RLS Policies for grupos_gestores

  1. Changes
    - Drop existing restrictive policies
    - Create more permissive policies for authenticated users
    - Separate policies for INSERT, UPDATE, DELETE operations
  
  2. Security
    - Allow public/anon access for development
    - In production, these should be restricted to admin users only
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view group managers" ON grupos_gestores;
DROP POLICY IF EXISTS "Authenticated users can manage group managers" ON grupos_gestores;

-- Allow everyone to read (for now - restrict in production)
CREATE POLICY "Public can view group managers"
  ON grupos_gestores FOR SELECT
  TO public
  USING (true);

-- Allow anon and authenticated to insert
CREATE POLICY "Allow insert group managers"
  ON grupos_gestores FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow anon and authenticated to update
CREATE POLICY "Allow update group managers"
  ON grupos_gestores FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Allow anon and authenticated to delete
CREATE POLICY "Allow delete group managers"
  ON grupos_gestores FOR DELETE
  TO public
  USING (true);
