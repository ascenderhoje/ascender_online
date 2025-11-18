/*
  # Clean All RLS Policies - Fix 500 Errors
  
  ## Problem
  Multiple conflicting RLS policies across core tables causing 500 errors
  
  ## Solution
  Remove all conflicting policies and create single permissive policies
  for each table to allow all operations during development
  
  ## Tables Updated
  - empresas
  - grupos
  - grupos_gestores
  - pessoas_grupos
  
  ## Security Note
  These are permissive policies for development. Should be restricted in production.
*/

-- =====================================================
-- EMPRESAS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Allow public access to empresas" ON empresas;
DROP POLICY IF EXISTS "Pessoas can read own empresa" ON empresas;

CREATE POLICY "Enable all access for public"
  ON empresas
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- GRUPOS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Allow public access to grupos" ON grupos;
DROP POLICY IF EXISTS "Gestores can read managed grupos" ON grupos;

CREATE POLICY "Enable all access for public"
  ON grupos
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

ALTER TABLE grupos ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- GRUPOS_GESTORES TABLE
-- =====================================================

DROP POLICY IF EXISTS "Allow delete group managers" ON grupos_gestores;
DROP POLICY IF EXISTS "Allow insert group managers" ON grupos_gestores;
DROP POLICY IF EXISTS "Allow update group managers" ON grupos_gestores;
DROP POLICY IF EXISTS "Gestores can read own grupos_gestores" ON grupos_gestores;
DROP POLICY IF EXISTS "Public can view group managers" ON grupos_gestores;

CREATE POLICY "Enable all access for public"
  ON grupos_gestores
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

ALTER TABLE grupos_gestores ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PESSOAS_GRUPOS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Allow delete pessoas_grupos" ON pessoas_grupos;
DROP POLICY IF EXISTS "Allow insert pessoas_grupos" ON pessoas_grupos;
DROP POLICY IF EXISTS "Allow public access to pessoas_grupos" ON pessoas_grupos;
DROP POLICY IF EXISTS "Allow update pessoas_grupos" ON pessoas_grupos;
DROP POLICY IF EXISTS "Gestores can read team pessoas_grupos" ON pessoas_grupos;
DROP POLICY IF EXISTS "Public can view pessoas_grupos" ON pessoas_grupos;

CREATE POLICY "Enable all access for public"
  ON pessoas_grupos
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

ALTER TABLE pessoas_grupos ENABLE ROW LEVEL SECURITY;
