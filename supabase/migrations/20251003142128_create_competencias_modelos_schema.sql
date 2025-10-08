/*
  # Schema para Competências e Modelos de Avaliação

  ## Novas Tabelas

  ### `competencias`
  - `id` (uuid, primary key)
  - `nome` (text, required) - Nome da competência
  - `fixo` (boolean, default false) - Se é um catálogo corporativo padronizado
  - `empresa_id` (uuid, nullable, foreign key) - Empresa dona, null = global
  - `status` (text, default 'ativo') - Status da competência
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `criterios`
  - `id` (uuid, primary key)
  - `competencia_id` (uuid, foreign key)
  - `visibilidade` (text) - 'todos', 'gestor', 'avaliadores'
  - `ordem` (integer) - Ordem de exibição
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `criterios_textos`
  - `id` (uuid, primary key)
  - `criterio_id` (uuid, foreign key)
  - `idioma` (text) - 'pt-BR', 'en-US', 'es-ES'
  - `nome` (text, required)
  - `descricao` (text)
  - `idioma_padrao` (boolean, default false)

  ### `modelos_avaliacao`
  - `id` (uuid, primary key)
  - `nome` (text, required)
  - `status` (text, default 'rascunho') - 'rascunho', 'publicado'
  - `empresa_id` (uuid, nullable, foreign key)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `modelos_competencias` (relacionamento N:N)
  - `modelo_id` (uuid, foreign key)
  - `competencia_id` (uuid, foreign key)
  - `ordem` (integer)
  - Primary key composta

  ### `perguntas_personalizadas`
  - `id` (uuid, primary key)
  - `modelo_id` (uuid, foreign key)
  - `tipo_resposta` (text) - 'texto', 'texto_longo', 'multipla_escolha', etc
  - `titulo` (text, required)
  - `descricao` (text)
  - `obrigatorio` (boolean, default false)
  - `ordem` (integer)
  - `opcoes` (jsonb) - Para múltipla escolha
  - `created_at` (timestamptz)

  ## Segurança
  - RLS habilitado em todas as tabelas
  - Políticas permissivas para desenvolvimento
*/

-- Criar tabela competencias
CREATE TABLE IF NOT EXISTS competencias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  fixo boolean DEFAULT false,
  empresa_id uuid REFERENCES empresas(id) ON DELETE CASCADE,
  status text DEFAULT 'ativo' CHECK (status IN ('ativo', 'arquivado')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Criar tabela criterios
CREATE TABLE IF NOT EXISTS criterios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competencia_id uuid NOT NULL REFERENCES competencias(id) ON DELETE CASCADE,
  visibilidade text DEFAULT 'todos' CHECK (visibilidade IN ('todos', 'gestor', 'avaliadores')),
  ordem integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Criar tabela criterios_textos
CREATE TABLE IF NOT EXISTS criterios_textos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  criterio_id uuid NOT NULL REFERENCES criterios(id) ON DELETE CASCADE,
  idioma text NOT NULL DEFAULT 'pt-BR' CHECK (idioma IN ('pt-BR', 'en-US', 'es-ES')),
  nome text NOT NULL,
  descricao text,
  idioma_padrao boolean DEFAULT false,
  UNIQUE(criterio_id, idioma)
);

-- Criar tabela modelos_avaliacao
CREATE TABLE IF NOT EXISTS modelos_avaliacao (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  status text DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'publicado')),
  empresa_id uuid REFERENCES empresas(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Criar tabela modelos_competencias
CREATE TABLE IF NOT EXISTS modelos_competencias (
  modelo_id uuid NOT NULL REFERENCES modelos_avaliacao(id) ON DELETE CASCADE,
  competencia_id uuid NOT NULL REFERENCES competencias(id) ON DELETE CASCADE,
  ordem integer NOT NULL DEFAULT 0,
  PRIMARY KEY (modelo_id, competencia_id)
);

-- Criar tabela perguntas_personalizadas
CREATE TABLE IF NOT EXISTS perguntas_personalizadas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  modelo_id uuid NOT NULL REFERENCES modelos_avaliacao(id) ON DELETE CASCADE,
  tipo_resposta text NOT NULL CHECK (tipo_resposta IN ('texto', 'texto_longo', 'multipla_escolha_unica', 'multipla_escolha_multipla', 'escala_numerica', 'escala_likert', 'data', 'upload')),
  titulo text NOT NULL,
  descricao text,
  obrigatorio boolean DEFAULT false,
  ordem integer NOT NULL DEFAULT 0,
  opcoes jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_competencias_empresa_id ON competencias(empresa_id);
CREATE INDEX IF NOT EXISTS idx_competencias_status ON competencias(status);
CREATE INDEX IF NOT EXISTS idx_criterios_competencia_id ON criterios(competencia_id);
CREATE INDEX IF NOT EXISTS idx_criterios_textos_criterio_id ON criterios_textos(criterio_id);
CREATE INDEX IF NOT EXISTS idx_modelos_empresa_id ON modelos_avaliacao(empresa_id);
CREATE INDEX IF NOT EXISTS idx_modelos_competencias_modelo_id ON modelos_competencias(modelo_id);
CREATE INDEX IF NOT EXISTS idx_perguntas_modelo_id ON perguntas_personalizadas(modelo_id);

-- Habilitar RLS
ALTER TABLE competencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE criterios ENABLE ROW LEVEL SECURITY;
ALTER TABLE criterios_textos ENABLE ROW LEVEL SECURITY;
ALTER TABLE modelos_avaliacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE modelos_competencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE perguntas_personalizadas ENABLE ROW LEVEL SECURITY;

-- Políticas permissivas para desenvolvimento
CREATE POLICY "Allow public access to competencias"
  ON competencias FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public access to criterios"
  ON criterios FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public access to criterios_textos"
  ON criterios_textos FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public access to modelos_avaliacao"
  ON modelos_avaliacao FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public access to modelos_competencias"
  ON modelos_competencias FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public access to perguntas_personalizadas"
  ON perguntas_personalizadas FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Triggers para atualizar updated_at
CREATE TRIGGER update_competencias_updated_at
  BEFORE UPDATE ON competencias
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_criterios_updated_at
  BEFORE UPDATE ON criterios
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_modelos_avaliacao_updated_at
  BEFORE UPDATE ON modelos_avaliacao
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
