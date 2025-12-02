import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Header } from '../components/Header';
import { Table } from '../components/Table';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { PessoaForm } from '../components/PessoaForm';
import { useToast } from '../components/Toast';
import { supabase } from '../lib/supabase';

interface Pessoa {
  id: string;
  nome: string;
  email: string;
  idioma: string;
  genero: string | null;
  empresa_id: string | null;
  funcao: string | null;
  avatar_url: string | null;
  tipo_acesso: 'admin' | 'gestor' | 'colaborador';
}

export const PessoasPage = () => {
  const { showToast } = useToast();
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [pessoaToEdit, setPessoaToEdit] = useState<Pessoa | null>(null);

  const loadPessoas = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pessoas')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPessoas(data || []);
    } catch (error) {
      console.error('Error loading pessoas:', error);
      showToast('error', 'Erro ao carregar pessoas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPessoas();
  }, []);

  const handleCreate = async (formData: any) => {
    try {
      let authUserId = null;

      if (formData.senha) {
        const { data: session } = await supabase.auth.getSession();
        const token = session?.session?.access_token;

        if (!token) throw new Error('Não autenticado');

        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/user-management/create`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: formData.email.trim().toLowerCase(),
              password: formData.senha,
              metadata: {
                nome: formData.nome.trim(),
              },
            }),
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Erro ao criar usuário de autenticação');
        }

        authUserId = result.user.id;
      }

      const { data: pessoaData, error: pessoaError } = await supabase
        .from('pessoas')
        .insert([
          {
            nome: formData.nome,
            email: formData.email,
            idioma: formData.idioma,
            genero: formData.genero || null,
            empresa_id: formData.empresa_id || null,
            funcao: formData.funcao || null,
            avatar_url: formData.avatar_url || null,
            tipo_acesso: formData.tipo_acesso,
            auth_user_id: authUserId,
            senha_definida: formData.senha ? true : false,
            ativo: true,
          },
        ])
        .select()
        .single();

      if (pessoaError) {
        if (authUserId) {
          const { data: session } = await supabase.auth.getSession();
          const token = session?.session?.access_token;

          if (token) {
            await fetch(
              `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/user-management/delete`,
              {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId: authUserId }),
              }
            );
          }
        }
        throw pessoaError;
      }

      if (formData.grupos_pertence && formData.grupos_pertence.length > 0) {
        const { error: gruposPertenceError } = await supabase
          .from('pessoas_grupos')
          .insert(
            formData.grupos_pertence.map((grupoId: string) => ({
              pessoa_id: pessoaData.id,
              grupo_id: grupoId,
            }))
          );

        if (gruposPertenceError) throw gruposPertenceError;
      }

      if (formData.grupos_tem_acesso && formData.grupos_tem_acesso.length > 0) {
        const { error: gruposTemAcessoError } = await supabase
          .from('grupos_gestores')
          .insert(
            formData.grupos_tem_acesso.map((grupoId: string) => ({
              pessoa_id: pessoaData.id,
              grupo_id: grupoId,
            }))
          );

        if (gruposTemAcessoError) throw gruposTemAcessoError;
      }

      let grupoNome = null;

      if (formData.tipo_acesso === 'gestor') {
        try {
          let empresaNome = 'Sem Empresa';

          if (formData.empresa_id) {
            const { data: empresaData, error: empresaError } = await supabase
              .from('empresas')
              .select('nome')
              .eq('id', formData.empresa_id)
              .maybeSingle();

            if (!empresaError && empresaData) {
              empresaNome = empresaData.nome;
            }
          }

          let nomeGrupoBase = `${empresaNome} - ${formData.nome.trim()}`;
          let nomeGrupoFinal = nomeGrupoBase;
          let contador = 1;

          while (true) {
            const { data: grupoExistente } = await supabase
              .from('grupos')
              .select('id')
              .eq('nome', nomeGrupoFinal)
              .maybeSingle();

            if (!grupoExistente) break;

            contador++;
            nomeGrupoFinal = `${nomeGrupoBase} (${contador})`;
          }

          const { data: novoGrupo, error: grupoError } = await supabase
            .from('grupos')
            .insert([{
              nome: nomeGrupoFinal,
              empresa_id: formData.empresa_id || null,
            }])
            .select()
            .single();

          if (grupoError) throw grupoError;

          if (novoGrupo) {
            const { error: gestorError } = await supabase
              .from('grupos_gestores')
              .insert([{
                pessoa_id: pessoaData.id,
                grupo_id: novoGrupo.id,
              }]);

            if (gestorError) throw gestorError;

            grupoNome = nomeGrupoFinal;
          }
        } catch (error: any) {
          console.error('Error creating automatic grupo for gestor:', error);
          showToast('warning', 'Pessoa criada, mas erro ao criar grupo automático. Você pode criar o grupo manualmente.');
        }
      }

      if (grupoNome) {
        showToast('success', `Pessoa criada com sucesso! Grupo "${grupoNome}" criado automaticamente.`);
      } else {
        showToast('success', 'Pessoa criada com sucesso!');
      }

      setIsCreateModalOpen(false);
      loadPessoas();
    } catch (error: any) {
      console.error('Error creating pessoa:', error);
      showToast('error', error.message || 'Erro ao criar pessoa');
    }
  };

  const handleEdit = (pessoa: Pessoa) => {
    setPessoaToEdit(pessoa);
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (formData: any) => {
    if (!pessoaToEdit) return;

    try {
      const { data: pessoaData } = await supabase
        .from('pessoas')
        .select('auth_user_id')
        .eq('id', pessoaToEdit.id)
        .maybeSingle();

      if (formData.senha && pessoaData?.auth_user_id) {
        const { data: session } = await supabase.auth.getSession();
        const token = session?.session?.access_token;

        if (!token) throw new Error('Não autenticado');

        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/user-management/update-password`,
          {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: pessoaData.auth_user_id,
              password: formData.senha,
            }),
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Erro ao atualizar senha');
        }
      }

      const updateData: any = {
        nome: formData.nome,
        email: formData.email,
        idioma: formData.idioma,
        genero: formData.genero || null,
        empresa_id: formData.empresa_id || null,
        funcao: formData.funcao || null,
        avatar_url: formData.avatar_url || null,
        tipo_acesso: formData.tipo_acesso,
      };

      if (formData.senha) {
        updateData.senha_definida = true;
      }

      const { error } = await supabase
        .from('pessoas')
        .update(updateData)
        .eq('id', pessoaToEdit.id);

      if (error) throw error;

      await supabase.from('pessoas_grupos').delete().eq('pessoa_id', pessoaToEdit.id);

      if (formData.grupos_pertence && formData.grupos_pertence.length > 0) {
        const { error: gruposPertenceError } = await supabase
          .from('pessoas_grupos')
          .insert(
            formData.grupos_pertence.map((grupoId: string) => ({
              pessoa_id: pessoaToEdit.id,
              grupo_id: grupoId,
            }))
          );

        if (gruposPertenceError) throw gruposPertenceError;
      }

      await supabase.from('grupos_gestores').delete().eq('pessoa_id', pessoaToEdit.id);

      if (formData.grupos_tem_acesso && formData.grupos_tem_acesso.length > 0) {
        const { error: gruposTemAcessoError } = await supabase
          .from('grupos_gestores')
          .insert(
            formData.grupos_tem_acesso.map((grupoId: string) => ({
              pessoa_id: pessoaToEdit.id,
              grupo_id: grupoId,
            }))
          );

        if (gruposTemAcessoError) throw gruposTemAcessoError;
      }

      showToast('success', 'Pessoa atualizada com sucesso!');
      setIsEditModalOpen(false);
      setPessoaToEdit(null);
      loadPessoas();
    } catch (error: any) {
      console.error('Error updating pessoa:', error);
      showToast('error', error.message || 'Erro ao atualizar pessoa');
    }
  };

  const handleDelete = async (pessoa: Pessoa) => {
    if (!confirm(`Tem certeza que deseja excluir "${pessoa.nome}"?`)) {
      return;
    }

    try {
      const { error} = await supabase
        .from('pessoas')
        .delete()
        .eq('id', pessoa.id);

      if (error) throw error;

      showToast('success', 'Pessoa excluída com sucesso!');
      loadPessoas();
    } catch (error: any) {
      console.error('Error deleting pessoa:', error);
      showToast('error', error.message || 'Erro ao excluir pessoa');
    }
  };

  const columns = [
    {
      key: 'idioma',
      label: 'Idioma',
      render: (pessoa: Pessoa) => (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
          {pessoa.idioma === 'pt-BR' ? '🇧🇷 PT' : pessoa.idioma === 'en-US' ? '🇺🇸 EN' : pessoa.idioma}
        </span>
      ),
    },
    { key: 'nome', label: 'Nome', sortable: true },
    { key: 'email', label: 'E-mail' },
    {
      key: 'funcao',
      label: 'Função',
      render: (pessoa: Pessoa) => pessoa.funcao || '-',
    },
    {
      key: 'tipo_acesso',
      label: 'Tipo de Acesso',
      render: (pessoa: Pessoa) => (
        <span
          className={`px-3 py-1 text-xs font-medium rounded-full ${
            pessoa.tipo_acesso === 'admin'
              ? 'bg-purple-100 text-purple-700'
              : pessoa.tipo_acesso === 'gestor'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-green-100 text-green-700'
          }`}
        >
          {pessoa.tipo_acesso === 'admin' ? 'Admin' : pessoa.tipo_acesso === 'gestor' ? 'Gestor' : 'Colaborador'}
        </span>
      ),
    },
  ];

  if (loading) {
    return (
      <>
        <Header title="Pessoas" />
        <div className="p-6 flex items-center justify-center">
          <p className="text-gray-500">Carregando...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header
        title="Pessoas"
        action={
          <Button icon={Plus} onClick={() => setIsCreateModalOpen(true)}>
            Adicionar Pessoa
          </Button>
        }
      />

      <div className="p-6">
        <Table
          data={pessoas}
          columns={columns}
          onEdit={handleEdit}
          onDelete={handleDelete}
          selectable
          selectedItems={selectedItems}
          onSelectionChange={setSelectedItems}
          emptyMessage="Nenhuma pessoa cadastrada."
          totalItems={pessoas.length}
        />
      </div>

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Adicionar Pessoa"
        size="lg"
      >
        <PessoaForm
          onSubmit={handleCreate}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setPessoaToEdit(null);
        }}
        title="Editar Pessoa"
        size="lg"
      >
        {pessoaToEdit && (
          <PessoaForm
            pessoa={pessoaToEdit}
            onSubmit={handleUpdate}
            onCancel={() => {
              setIsEditModalOpen(false);
              setPessoaToEdit(null);
            }}
          />
        )}
      </Modal>
    </>
  );
};
