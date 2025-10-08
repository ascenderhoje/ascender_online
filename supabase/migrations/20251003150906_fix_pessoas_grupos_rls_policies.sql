/*
  # Fix RLS Policies for pessoas_grupos

  1. Changes
    - Update existing policies to be more permissive
    - Separate policies for each operation
  
  2. Security
    - Allow public/anon access for development
    - In production, these should be restricted appropriately
*/

-- Drop existing policies if any
DROP POLICY IF EXISTS "Public can view pessoas_grupos" ON pessoas_grupos;
DROP POLICY IF EXISTS "Allow insert pessoas_grupos" ON pessoas_grupos;
DROP POLICY IF EXISTS "Allow update pessoas_grupos" ON pessoas_grupos;
DROP POLICY IF EXISTS "Allow delete pessoas_grupos" ON pessoas_grupos;

-- Allow everyone to read
CREATE POLICY "Public can view pessoas_grupos"
  ON pessoas_grupos FOR SELECT
  TO public
  USING (true);

-- Allow anon and authenticated to insert
CREATE POLICY "Allow insert pessoas_grupos"
  ON pessoas_grupos FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow anon and authenticated to update
CREATE POLICY "Allow update pessoas_grupos"
  ON pessoas_grupos FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Allow anon and authenticated to delete
CREATE POLICY "Allow delete pessoas_grupos"
  ON pessoas_grupos FOR DELETE
  TO public
  USING (true);
