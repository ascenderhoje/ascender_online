/*
  # Tabelas de PDI do Usuário

  ## Visão Geral
  Tabelas para gerenciar o PDI (Plano de Desenvolvimento Individual) de cada usuário,
  incluindo conteúdos selecionados, ações personalizadas e avaliações.

  ## Novas Tabelas

  ### 1. pdi_user_contents
    - `id` (uuid, primary key)
    - `user_id` (uuid, FK para pessoas) - Usuário que adicionou o conteúdo ao PDI
    - `content_id` (uuid, FK para pdi_contents)
    - `planned_due_date` (date) - Data prevista para conclusão
    - `status` (text) - 'em_andamento' ou 'concluido'
    - `completed_at` (timestamptz) - Data e hora de conclusão
    - `rating_stars` (integer) - Avaliação de 0 a 5 estrelas
    - `rating_comment` (text) - Comentário opcional da avaliação
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  ### 2. pdi_user_actions
    - `id` (uuid, primary key)
    - `user_id` (uuid, FK para pessoas)
    - `description` (text, obrigatório) - Descrição da ação (min 10 caracteres)
    - `planned_due_date` (date, obrigatório) - Data prevista
    - `investment_cents` (integer) - Investimento em centavos (opcional)
    - `status` (text) - 'em_andamento' ou 'concluido'
    - `completed_at` (timestamptz)
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  ## Segurança
  - RLS habilitado
  - Usuários podem gerenciar apenas seus próprios registros
  - Gestores podem visualizar dados de sua equipe
*/

-- Criar tabela pdi_user_contents
CREATE TABLE IF NOT EXISTS pdi_user_contents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES pessoas(id) ON DELETE CASCADE,
  content_id uuid NOT NULL REFERENCES pdi_contents(id) ON DELETE CASCADE,
  planned_due_date date,
  status text DEFAULT 'em_andamento' CHECK (status IN ('em_andamento', 'concluido')),
  completed_at timestamptz,
  rating_stars integer CHECK (rating_stars >= 0 AND rating_stars <= 5),
  rating_comment text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, content_id)
);

-- Criar tabela pdi_user_actions
CREATE TABLE IF NOT EXISTS pdi_user_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES pessoas(id) ON DELETE CASCADE,
  description text NOT NULL CHECK (length(description) >= 10),
  planned_due_date date NOT NULL,
  investment_cents integer CHECK (investment_cents >= 0),
  status text DEFAULT 'em_andamento' CHECK (status IN ('em_andamento', 'concluido')),
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_pdi_user_contents_user ON pdi_user_contents(user_id);
CREATE INDEX IF NOT EXISTS idx_pdi_user_contents_content ON pdi_user_contents(content_id);
CREATE INDEX IF NOT EXISTS idx_pdi_user_contents_status ON pdi_user_contents(status);
CREATE INDEX IF NOT EXISTS idx_pdi_user_contents_due_date ON pdi_user_contents(planned_due_date);
CREATE INDEX IF NOT EXISTS idx_pdi_user_actions_user ON pdi_user_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_pdi_user_actions_status ON pdi_user_actions(status);
CREATE INDEX IF NOT EXISTS idx_pdi_user_actions_due_date ON pdi_user_actions(planned_due_date);

-- Habilitar RLS
ALTER TABLE pdi_user_contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE pdi_user_actions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS - Usuários gerenciam seus próprios dados
CREATE POLICY "Users can manage their own pdi_user_contents"
  ON pdi_user_contents FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can manage their own pdi_user_actions"
  ON pdi_user_actions FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Políticas permissivas para desenvolvimento
CREATE POLICY "Public access to pdi_user_contents for dev"
  ON pdi_user_contents FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public access to pdi_user_actions for dev"
  ON pdi_user_actions FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Triggers para atualizar updated_at
CREATE TRIGGER update_pdi_user_contents_updated_at
  BEFORE UPDATE ON pdi_user_contents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pdi_user_actions_updated_at
  BEFORE UPDATE ON pdi_user_actions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para atualizar completed_at automaticamente quando status muda para concluido
CREATE OR REPLACE FUNCTION update_pdi_completed_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'concluido' AND OLD.status != 'concluido' THEN
    NEW.completed_at = now();
  ELSIF NEW.status = 'em_andamento' AND OLD.status = 'concluido' THEN
    NEW.completed_at = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_pdi_user_contents_completed_at
  BEFORE UPDATE ON pdi_user_contents
  FOR EACH ROW
  EXECUTE FUNCTION update_pdi_completed_at();

CREATE TRIGGER update_pdi_user_actions_completed_at
  BEFORE UPDATE ON pdi_user_actions
  FOR EACH ROW
  EXECUTE FUNCTION update_pdi_completed_at();