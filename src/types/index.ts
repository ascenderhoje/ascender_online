export interface Empresa {
  id: string;
  nome: string;
  cidade: string;
  regua: number;
  validoAte: string;
  avatar?: string;
  createdAt: string;
}

export interface Pessoa {
  id: string;
  idioma: string;
  nome: string;
  email: string;
  genero?: string;
  empresaId: string;
  empresa?: Empresa;
  funcao?: string;
  avatar?: string;
  tipoAcesso: 'gestor' | 'colaborador';
  grupos?: Grupo[];
  createdAt: string;
}

export interface Grupo {
  id: string;
  nome: string;
  empresas: string[];
  membros?: Pessoa[];
  createdAt: string;
}

export interface Perfil {
  id: string;
  nome: string;
  permissoes: string[];
  descricao?: string;
}

export type ModuleName = 'empresas' | 'pessoas' | 'grupos' | 'perfis' | 'competencias' | 'modelos' | 'avaliacoes' | 'pdi' | 'administradores';

export interface PDITag {
  id: string;
  nome: string;
  slug: string;
  descricao?: string;
  created_at: string;
  updated_at: string;
}

export interface PDIMediaType {
  id: string;
  nome: string;
  slug: string;
  icone?: string;
  ordem: number;
  ativo: boolean;
  created_at: string;
}

export interface PDIAudience {
  id: string;
  nome: string;
  slug: string;
  descricao?: string;
  ordem: number;
  ativo: boolean;
  created_at: string;
}

export interface PDIContent {
  id: string;
  titulo: string;
  descricao_curta: string;
  descricao_longa?: string;
  cover_image_url: string;
  media_type_id: string;
  media_type?: PDIMediaType;
  external_url?: string;
  duration_minutes?: number;
  investment_cents?: number;
  is_active: boolean;
  avg_rating: number;
  ratings_count: number;
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
  tags?: PDITag[];
  competencies?: any[];
  audiences?: PDIAudience[];
}

export type PDIUserContentStatus = 'em_andamento' | 'concluido';

export interface PDIUserContent {
  id: string;
  user_id: string;
  content_id: string;
  content?: PDIContent;
  planned_due_date?: string;
  status: PDIUserContentStatus;
  completed_at?: string;
  rating_stars?: number;
  rating_comment?: string;
  created_at: string;
  updated_at: string;
}

export type PDIUserActionStatus = 'em_andamento' | 'concluido';

export interface PDIUserAction {
  id: string;
  user_id: string;
  description: string;
  planned_due_date: string;
  investment_cents?: number;
  status: PDIUserActionStatus;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface PDIRecommendation {
  content: PDIContent;
  reason: string;
  tags: PDITag[];
}
