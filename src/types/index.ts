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
