import { useState } from 'react';
import { Shield, Check, X } from 'lucide-react';
import { Header } from '../components/Header';

interface Permission {
  id: string;
  name: string;
  description: string;
}

interface Profile {
  id: string;
  name: string;
  permissions: string[];
  description: string;
}

const availablePermissions: Permission[] = [
  { id: 'empresas.view', name: 'Visualizar Empresas', description: 'Ver lista e detalhes de empresas' },
  { id: 'empresas.create', name: 'Criar Empresas', description: 'Adicionar novas empresas' },
  { id: 'empresas.edit', name: 'Editar Empresas', description: 'Modificar informações de empresas' },
  { id: 'empresas.delete', name: 'Excluir Empresas', description: 'Remover empresas do sistema' },
  { id: 'pessoas.view', name: 'Visualizar Pessoas', description: 'Ver lista e detalhes de pessoas' },
  { id: 'pessoas.create', name: 'Criar Pessoas', description: 'Adicionar novas pessoas' },
  { id: 'pessoas.edit', name: 'Editar Pessoas', description: 'Modificar informações de pessoas' },
  { id: 'pessoas.delete', name: 'Excluir Pessoas', description: 'Remover pessoas do sistema' },
  { id: 'grupos.view', name: 'Visualizar Grupos', description: 'Ver lista e detalhes de grupos' },
  { id: 'grupos.create', name: 'Criar Grupos', description: 'Adicionar novos grupos' },
  { id: 'grupos.edit', name: 'Editar Grupos', description: 'Modificar informações de grupos' },
  { id: 'grupos.delete', name: 'Excluir Grupos', description: 'Remover grupos do sistema' },
  { id: 'avaliacoes.view', name: 'Visualizar Avaliações', description: 'Ver avaliações' },
  { id: 'avaliacoes.manage', name: 'Gerenciar Avaliações', description: 'Criar e editar avaliações' },
  { id: 'pdi.view', name: 'Visualizar PDI', description: 'Ver planos de desenvolvimento' },
  { id: 'pdi.manage', name: 'Gerenciar PDI', description: 'Criar e editar PDIs' },
  { id: 'admin.full', name: 'Administrador Completo', description: 'Acesso total ao sistema' },
];

const defaultProfiles: Profile[] = [
  {
    id: '1',
    name: 'Administrador da Plataforma',
    description: 'Acesso total a todos os módulos e configurações',
    permissions: ['admin.full'],
  },
  {
    id: '2',
    name: 'Gestor da Empresa',
    description: 'Gerencia pessoas e grupos da sua empresa',
    permissions: [
      'empresas.view',
      'pessoas.view',
      'pessoas.create',
      'pessoas.edit',
      'grupos.view',
      'grupos.create',
      'grupos.edit',
      'avaliacoes.view',
      'avaliacoes.manage',
      'pdi.view',
      'pdi.manage',
    ],
  },
  {
    id: '3',
    name: 'Colaborador',
    description: 'Acesso básico ao próprio perfil e recursos designados',
    permissions: ['pessoas.view', 'grupos.view', 'avaliacoes.view', 'pdi.view'],
  },
];

export const PerfisPage = () => {
  const [profiles] = useState<Profile[]>(defaultProfiles);
  const [selectedProfile, setSelectedProfile] = useState<Profile>(profiles[0]);

  const hasPermission = (permissionId: string) => {
    return selectedProfile.permissions.includes(permissionId) || selectedProfile.permissions.includes('admin.full');
  };

  const permissionsByCategory = {
    Empresas: availablePermissions.filter(p => p.id.startsWith('empresas.')),
    Pessoas: availablePermissions.filter(p => p.id.startsWith('pessoas.')),
    Grupos: availablePermissions.filter(p => p.id.startsWith('grupos.')),
    Avaliações: availablePermissions.filter(p => p.id.startsWith('avaliacoes.')),
    PDI: availablePermissions.filter(p => p.id.startsWith('pdi.')),
    Administração: availablePermissions.filter(p => p.id.startsWith('admin.')),
  };

  return (
    <>
      <Header title="Perfis de Acesso" />

      <div className="p-8">
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Perfis Disponíveis</h3>
            <div className="space-y-2">
              {profiles.map((profile) => (
                <button
                  key={profile.id}
                  onClick={() => setSelectedProfile(profile)}
                  className={`w-full p-4 rounded-lg text-left transition-all ${
                    selectedProfile.id === profile.id
                      ? 'bg-blue-50 border-2 border-blue-500'
                      : 'bg-slate-50 border-2 border-transparent hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      selectedProfile.id === profile.id ? 'bg-blue-500' : 'bg-slate-300'
                    }`}>
                      <Shield size={20} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">{profile.name}</p>
                      <p className="text-sm text-slate-600 mt-1">{profile.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="col-span-2 bg-white rounded-lg border border-slate-200 p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">{selectedProfile.name}</h3>
              <p className="text-sm text-slate-600">{selectedProfile.description}</p>
            </div>

            <div className="space-y-6">
              {Object.entries(permissionsByCategory).map(([category, permissions]) => (
                <div key={category}>
                  <h4 className="font-semibold text-slate-900 mb-3">{category}</h4>
                  <div className="space-y-2">
                    {permissions.map((permission) => {
                      const isGranted = hasPermission(permission.id);
                      return (
                        <div
                          key={permission.id}
                          className={`flex items-center gap-3 p-3 rounded-lg ${
                            isGranted ? 'bg-green-50' : 'bg-slate-50'
                          }`}
                        >
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                            isGranted ? 'bg-green-500' : 'bg-slate-300'
                          }`}>
                            {isGranted ? (
                              <Check size={14} className="text-white" />
                            ) : (
                              <X size={14} className="text-white" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className={`text-sm font-medium ${isGranted ? 'text-green-900' : 'text-slate-700'}`}>
                              {permission.name}
                            </p>
                            <p className={`text-xs ${isGranted ? 'text-green-700' : 'text-slate-500'}`}>
                              {permission.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <strong>Nota:</strong> Os perfis definem as permissões que cada tipo de usuário possui no sistema.
            Ao criar ou editar uma pessoa, você pode atribuir um destes perfis para controlar seu nível de acesso.
          </p>
        </div>
      </div>
    </>
  );
};
