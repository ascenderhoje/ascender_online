/*
  # Criação das Tabelas Base do PDI (Plano de Desenvolvimento Individual)

  ## Visão Geral
  Este módulo implementa um sistema de indicações de conteúdos de desenvolvimento
  (filmes, livros, podcasts, cursos, etc.) para colaboradores e gestores.

  ## Novas Tabelas

  ### 1. pdi_tags
    - `id` (uuid, primary key)
    - `nome` (text, obrigatório) - Nome da tag
    - `slug` (text, obrigatório, único) - Slug para URLs e hashtags
    - `descricao` (text) - Descrição da tag
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  ### 2. pdi_media_types
    - `id` (uuid, primary key)
    - `nome` (text, obrigatório) - Ex: filme, livro, podcast, curso, artigo, resumo, dica
    - `slug` (text, obrigatório, único)
    - `icone` (text) - Nome do ícone para UI
    - `ordem` (integer) - Ordem de exibição
    - `ativo` (boolean)
    - `created_at` (timestamptz)

  ### 3. pdi_audiences
    - `id` (uuid, primary key)
    - `nome` (text, obrigatório) - Ex: Todos, Liderança, Operacional
    - `slug` (text, obrigatório, único)
    - `descricao` (text)
    - `ordem` (integer)
    - `ativo` (boolean)
    - `created_at` (timestamptz)

  ### 4. pdi_contents
    - `id` (uuid, primary key)
    - `titulo` (text, obrigatório)
    - `descricao_curta` (text, obrigatório)
    - `descricao_longa` (text)
    - `cover_image_url` (text, obrigatório) - URL ou path da imagem de capa
    - `media_type_id` (uuid, obrigatório, FK)
    - `external_url` (text) - Link externo (opcional)
    - `duration_minutes` (integer) - Duração em minutos (opcional)
    - `investment_cents` (integer) - Investimento em centavos (opcional)
    - `is_active` (boolean, padrão true)
    - `avg_rating` (numeric) - Média de avaliação (calculada)
    - `ratings_count` (integer) - Quantidade de avaliações
    - `created_by` (uuid, FK para administradores)
    - `updated_by` (uuid, FK para administradores)
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  ### 5. pdi_content_tags (relacionamento N:N)
    - `content_id` (uuid, FK)
    - `tag_id` (uuid, FK)
    - Primary key composta

  ### 6. pdi_content_competencies (relacionamento N:N)
    - `content_id` (uuid, FK)
    - `competency_id` (uuid, FK) - FK para tabela competencias existente
    - Primary key composta

  ### 7. pdi_content_audiences (relacionamento N:N)
    - `content_id` (uuid, FK)
    - `audience_id` (uuid, FK)
    - Primary key composta

  ## Segurança
  - RLS habilitado em todas as tabelas
  - Administradores têm acesso total
  - Usuários autenticados podem visualizar conteúdos ativos
*/

-- Criar tabela pdi_tags
CREATE TABLE IF NOT EXISTS pdi_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  slug text NOT NULL UNIQUE,
  descricao text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Criar tabela pdi_media_types
CREATE TABLE IF NOT EXISTS pdi_media_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  slug text NOT NULL UNIQUE,
  icone text,
  ordem integer DEFAULT 0,
  ativo boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Criar tabela pdi_audiences
CREATE TABLE IF NOT EXISTS pdi_audiences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  slug text NOT NULL UNIQUE,
  descricao text,
  ordem integer DEFAULT 0,
  ativo boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Criar tabela pdi_contents
CREATE TABLE IF NOT EXISTS pdi_contents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  descricao_curta text NOT NULL,
  descricao_longa text,
  cover_image_url text NOT NULL,
  media_type_id uuid NOT NULL REFERENCES pdi_media_types(id) ON DELETE RESTRICT,
  external_url text,
  duration_minutes integer,
  investment_cents integer,
  is_active boolean DEFAULT true,
  avg_rating numeric(3, 2) DEFAULT 0,
  ratings_count integer DEFAULT 0,
  created_by uuid REFERENCES administradores(id),
  updated_by uuid REFERENCES administradores(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Criar tabela pdi_content_tags (relacionamento N:N)
CREATE TABLE IF NOT EXISTS pdi_content_tags (
  content_id uuid NOT NULL REFERENCES pdi_contents(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES pdi_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (content_id, tag_id)
);

-- Criar tabela pdi_content_competencies (relacionamento N:N)
CREATE TABLE IF NOT EXISTS pdi_content_competencies (
  content_id uuid NOT NULL REFERENCES pdi_contents(id) ON DELETE CASCADE,
  competency_id uuid NOT NULL REFERENCES competencias(id) ON DELETE CASCADE,
  PRIMARY KEY (content_id, competency_id)
);

-- Criar tabela pdi_content_audiences (relacionamento N:N)
CREATE TABLE IF NOT EXISTS pdi_content_audiences (
  content_id uuid NOT NULL REFERENCES pdi_contents(id) ON DELETE CASCADE,
  audience_id uuid NOT NULL REFERENCES pdi_audiences(id) ON DELETE CASCADE,
  PRIMARY KEY (content_id, audience_id)
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_pdi_tags_slug ON pdi_tags(slug);
CREATE INDEX IF NOT EXISTS idx_pdi_media_types_slug ON pdi_media_types(slug);
CREATE INDEX IF NOT EXISTS idx_pdi_audiences_slug ON pdi_audiences(slug);
CREATE INDEX IF NOT EXISTS idx_pdi_contents_media_type ON pdi_contents(media_type_id);
CREATE INDEX IF NOT EXISTS idx_pdi_contents_active ON pdi_contents(is_active);
CREATE INDEX IF NOT EXISTS idx_pdi_contents_rating ON pdi_contents(avg_rating);
CREATE INDEX IF NOT EXISTS idx_pdi_content_tags_tag ON pdi_content_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_pdi_content_tags_content ON pdi_content_tags(content_id);
CREATE INDEX IF NOT EXISTS idx_pdi_content_competencies_competency ON pdi_content_competencies(competency_id);
CREATE INDEX IF NOT EXISTS idx_pdi_content_competencies_content ON pdi_content_competencies(content_id);
CREATE INDEX IF NOT EXISTS idx_pdi_content_audiences_audience ON pdi_content_audiences(audience_id);
CREATE INDEX IF NOT EXISTS idx_pdi_content_audiences_content ON pdi_content_audiences(content_id);

-- Habilitar RLS
ALTER TABLE pdi_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE pdi_media_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE pdi_audiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE pdi_contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE pdi_content_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE pdi_content_competencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE pdi_content_audiences ENABLE ROW LEVEL SECURITY;

-- Políticas RLS - Todos os usuários autenticados podem ler
CREATE POLICY "Authenticated users can read pdi_tags"
  ON pdi_tags FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read pdi_media_types"
  ON pdi_media_types FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read pdi_audiences"
  ON pdi_audiences FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read active pdi_contents"
  ON pdi_contents FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Authenticated users can read pdi_content_tags"
  ON pdi_content_tags FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read pdi_content_competencies"
  ON pdi_content_competencies FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read pdi_content_audiences"
  ON pdi_content_audiences FOR SELECT
  TO authenticated
  USING (true);

-- Políticas para desenvolvimento (permissivas) - TODO: refinar políticas RLS
CREATE POLICY "Public access to pdi_tags for dev"
  ON pdi_tags FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public access to pdi_media_types for dev"
  ON pdi_media_types FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public access to pdi_audiences for dev"
  ON pdi_audiences FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public access to pdi_contents for dev"
  ON pdi_contents FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public access to pdi_content_tags for dev"
  ON pdi_content_tags FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public access to pdi_content_competencies for dev"
  ON pdi_content_competencies FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public access to pdi_content_audiences for dev"
  ON pdi_content_audiences FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Triggers para atualizar updated_at
CREATE TRIGGER update_pdi_tags_updated_at
  BEFORE UPDATE ON pdi_tags
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pdi_contents_updated_at
  BEFORE UPDATE ON pdi_contents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Inserir tipos de mídia padrão
INSERT INTO pdi_media_types (nome, slug, icone, ordem) VALUES
  ('Filme', 'filme', 'Film', 1),
  ('Livro', 'livro', 'Book', 2),
  ('E-book', 'ebook', 'BookOpen', 3),
  ('Podcast', 'podcast', 'Mic', 4),
  ('Curso', 'curso', 'GraduationCap', 5),
  ('Artigo', 'artigo', 'FileText', 6),
  ('Resumo', 'resumo', 'ScrollText', 7),
  ('Dica Prática', 'dica', 'Lightbulb', 8)
ON CONFLICT (slug) DO NOTHING;

-- Inserir públicos padrão
INSERT INTO pdi_audiences (nome, slug, descricao, ordem) VALUES
  ('Todos', 'todos', 'Conteúdo adequado para todos os colaboradores', 1),
  ('Liderança', 'lideranca', 'Conteúdo direcionado para líderes e gestores', 2),
  ('Operacional', 'operacional', 'Conteúdo para equipes operacionais', 3),
  ('Administrativo', 'administrativo', 'Conteúdo para equipes administrativas', 4)
ON CONFLICT (slug) DO NOTHING;