import { supabase } from '../lib/supabase';

type ActionType =
  | 'empresa_created'
  | 'empresa_updated'
  | 'pessoa_created'
  | 'pessoa_added_to_grupo'
  | 'grupo_created'
  | 'modelo_created'
  | 'modelo_published'
  | 'avaliacao_created'
  | 'avaliacao_finished'
  | 'admin_created'
  | 'pdi_content_created';

type EntityType =
  | 'empresa'
  | 'pessoa'
  | 'grupo'
  | 'modelo'
  | 'avaliacao'
  | 'administrador'
  | 'pdi_content';

interface LogActivityParams {
  adminId: string;
  adminName: string;
  actionType: ActionType;
  description: string;
  entityType: EntityType;
  entityId?: string;
  entityName?: string;
}

export async function logAdminActivity({
  adminId,
  adminName,
  actionType,
  description,
  entityType,
  entityId,
  entityName,
}: LogActivityParams): Promise<void> {
  try {
    const { error } = await supabase.from('admin_activity_logs').insert({
      admin_id: adminId,
      admin_name: adminName,
      action_type: actionType,
      description,
      entity_type: entityType,
      entity_id: entityId,
      entity_name: entityName,
    });

    if (error) {
      console.error('Erro ao registrar atividade:', error);
    }
  } catch (err) {
    console.error('Erro ao registrar atividade:', err);
  }
}

export function buildActivityDescription(
  actionType: ActionType,
  entityName: string,
  adminName: string,
  extraInfo?: string
): string {
  switch (actionType) {
    case 'empresa_created':
      return `Empresa "${entityName}" cadastrada por ${adminName}`;
    case 'empresa_updated':
      return `Empresa "${entityName}" atualizada por ${adminName}`;
    case 'pessoa_created':
      return `${entityName} cadastrado(a) por ${adminName}`;
    case 'pessoa_added_to_grupo':
      return `${entityName} adicionado(a) ao grupo ${extraInfo || ''}`;
    case 'grupo_created':
      return `Grupo "${entityName}" criado por ${adminName}`;
    case 'modelo_created':
      return `Modelo "${entityName}" criado por ${adminName}`;
    case 'modelo_published':
      return `Modelo "${entityName}" publicado por ${adminName}`;
    case 'avaliacao_created':
      return `Avaliação de ${entityName} iniciada por ${adminName}`;
    case 'avaliacao_finished':
      return `Avaliação de ${entityName} finalizada por ${adminName}`;
    case 'admin_created':
      return `${entityName} adicionado(a) como administrador por ${adminName}`;
    case 'pdi_content_created':
      return `Conteúdo PDI "${entityName}" criado por ${adminName}`;
    default:
      return `Ação realizada por ${adminName}`;
  }
}
