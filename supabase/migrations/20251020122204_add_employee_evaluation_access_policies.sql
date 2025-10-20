/*
  # Add Employee Evaluation Access Policies

  ## Overview
  This migration adds Row Level Security policies that allow employees (pessoas/colaboradores) 
  to view their own finalized evaluations and all related data. Previously, only administrators 
  and psychologists could access evaluation data.

  ## Security Model
  - Employees can only view evaluations where they are the colaborador (colaborador_id matches their pessoa.id)
  - Employees can only view finalized evaluations (status = 'finalizada')
  - Employees cannot view draft evaluations or other employees' evaluations
  - All read access is restricted to authenticated users
  - Write access remains restricted to administrators only

  ## Tables Updated
  1. avaliacoes - Allow employees to read their own finalized evaluations
  2. avaliacoes_competencias - Allow employees to read competency scores from their evaluations
  3. avaliacoes_respostas - Allow employees to read responses from their evaluations
  4. avaliacoes_textos - Allow employees to read text summaries from their evaluations
  5. modelos_avaliacao - Allow employees to read evaluation model info
  6. modelos_competencias - Allow employees to read model competencies
  7. competencias - Allow employees to read competencies
  8. criterios - Allow employees to read criteria
  9. perguntas_personalizadas - Allow employees to read custom questions

  ## Helper Functions
  1. get_pessoa_id_from_auth() - Gets pessoa.id from auth.uid()
  2. is_evaluation_owner() - Checks if authenticated user owns the evaluation

  ## Important Notes
  - Existing admin/psychologist policies remain unchanged
  - This only adds READ access for employees
  - Employees cannot modify any evaluation data
*/

-- Helper function to get pessoa.id from auth.uid()
CREATE OR REPLACE FUNCTION get_pessoa_id_from_auth()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  pessoa_id_result uuid;
BEGIN
  SELECT id INTO pessoa_id_result
  FROM pessoas
  WHERE auth_user_id = auth.uid()
    AND ativo = true;
  
  RETURN pessoa_id_result;
END;
$$;

-- Helper function to check if authenticated user owns an evaluation
CREATE OR REPLACE FUNCTION is_evaluation_owner(evaluation_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  pessoa_id_result uuid;
  is_owner boolean;
BEGIN
  -- Get pessoa.id from auth.uid()
  pessoa_id_result := get_pessoa_id_from_auth();
  
  IF pessoa_id_result IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check if this pessoa owns the evaluation
  SELECT EXISTS(
    SELECT 1
    FROM avaliacoes
    WHERE id = evaluation_id
      AND colaborador_id = pessoa_id_result
      AND status = 'finalizada'
  ) INTO is_owner;
  
  RETURN is_owner;
END;
$$;

-- AVALIACOES TABLE POLICIES
-- Allow employees to read their own finalized evaluations
CREATE POLICY "Employees can read own finalized evaluations"
  ON avaliacoes FOR SELECT
  TO authenticated
  USING (
    colaborador_id = get_pessoa_id_from_auth()
    AND status = 'finalizada'
  );

-- AVALIACOES_COMPETENCIAS TABLE POLICIES
-- Allow employees to read competency scores from their evaluations
CREATE POLICY "Employees can read own evaluation competencies"
  ON avaliacoes_competencias FOR SELECT
  TO authenticated
  USING (
    is_evaluation_owner(avaliacao_id)
  );

-- AVALIACOES_RESPOSTAS TABLE POLICIES
-- Allow employees to read responses from their evaluations
CREATE POLICY "Employees can read own evaluation responses"
  ON avaliacoes_respostas FOR SELECT
  TO authenticated
  USING (
    is_evaluation_owner(avaliacao_id)
  );

-- AVALIACOES_TEXTOS TABLE POLICIES
-- Allow employees to read text summaries from their evaluations
CREATE POLICY "Employees can read own evaluation texts"
  ON avaliacoes_textos FOR SELECT
  TO authenticated
  USING (
    is_evaluation_owner(avaliacao_id)
  );

-- MODELOS_AVALIACAO TABLE POLICIES
-- Allow employees to read evaluation models used in their evaluations
CREATE POLICY "Employees can read models from own evaluations"
  ON modelos_avaliacao FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM avaliacoes
      WHERE avaliacoes.modelo_id = modelos_avaliacao.id
        AND avaliacoes.colaborador_id = get_pessoa_id_from_auth()
        AND avaliacoes.status = 'finalizada'
    )
  );

-- MODELOS_COMPETENCIAS TABLE POLICIES
-- Allow employees to read model-competency relationships from their evaluations
CREATE POLICY "Employees can read model competencies from own evaluations"
  ON modelos_competencias FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM avaliacoes
      WHERE avaliacoes.modelo_id = modelos_competencias.modelo_id
        AND avaliacoes.colaborador_id = get_pessoa_id_from_auth()
        AND avaliacoes.status = 'finalizada'
    )
  );

-- COMPETENCIAS TABLE POLICIES
-- Allow employees to read competencies from their evaluations
CREATE POLICY "Employees can read competencias from own evaluations"
  ON competencias FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM modelos_competencias mc
      JOIN avaliacoes a ON a.modelo_id = mc.modelo_id
      WHERE mc.competencia_id = competencias.id
        AND a.colaborador_id = get_pessoa_id_from_auth()
        AND a.status = 'finalizada'
    )
  );

-- CRITERIOS TABLE POLICIES
-- Allow employees to read criteria from competencies in their evaluations
CREATE POLICY "Employees can read criterios from own evaluations"
  ON criterios FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM modelos_competencias mc
      JOIN avaliacoes a ON a.modelo_id = mc.modelo_id
      WHERE mc.competencia_id = criterios.competencia_id
        AND a.colaborador_id = get_pessoa_id_from_auth()
        AND a.status = 'finalizada'
    )
  );

-- PERGUNTAS_PERSONALIZADAS TABLE POLICIES
-- Allow employees to read custom questions from their evaluations
CREATE POLICY "Employees can read perguntas from own evaluations"
  ON perguntas_personalizadas FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM avaliacoes
      WHERE avaliacoes.modelo_id = perguntas_personalizadas.modelo_id
        AND avaliacoes.colaborador_id = get_pessoa_id_from_auth()
        AND avaliacoes.status = 'finalizada'
    )
  );

-- PERGUNTAS_PERSONALIZADAS_TEXTOS TABLE POLICIES (if exists)
-- Allow employees to read custom question texts from their evaluations
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'perguntas_personalizadas_textos') THEN
    EXECUTE 'CREATE POLICY "Employees can read pergunta texts from own evaluations"
      ON perguntas_personalizadas_textos FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1
          FROM perguntas_personalizadas pp
          JOIN avaliacoes a ON a.modelo_id = pp.modelo_id
          WHERE pp.id = perguntas_personalizadas_textos.pergunta_id
            AND a.colaborador_id = get_pessoa_id_from_auth()
            AND a.status = ''finalizada''
        )
      )';
  END IF;
END $$;

-- Create indexes to improve performance of new policies
CREATE INDEX IF NOT EXISTS idx_avaliacoes_colaborador_status 
  ON avaliacoes(colaborador_id, status) 
  WHERE status = 'finalizada';

CREATE INDEX IF NOT EXISTS idx_pessoas_auth_user_active 
  ON pessoas(auth_user_id, ativo) 
  WHERE ativo = true;
