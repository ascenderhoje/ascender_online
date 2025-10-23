import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, CheckCircle, Calendar, ArrowLeft } from 'lucide-react';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { useToast } from '../components/Toast';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from '../utils/router';
import { supabase } from '../lib/supabase';
import { PDIUserAction } from '../types';

export const PDIAcoesPage = () => {
  const { showToast } = useToast();
  const { navigate } = useRouter();
  const { pessoa } = useAuth();
  const [actions, setActions] = useState<PDIUserAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAction, setEditingAction] = useState<PDIUserAction | null>(null);

  const [formData, setFormData] = useState({
    description: '',
    planned_due_date: '',
    investment_cents: '',
  });

  useEffect(() => {
    if (pessoa?.id) {
      loadActions();
    }
  }, [pessoa]);

  const loadActions = async () => {
    if (!pessoa?.id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pdi_user_actions')
        .select('*')
        .eq('user_id', pessoa.id)
        .order('planned_due_date', { ascending: true });

      if (error) throw error;
      setActions(data || []);
    } catch (error: any) {
      showToast('error', error.message || 'Erro ao carregar ações');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (action?: PDIUserAction) => {
    if (action) {
      setEditingAction(action);
      setFormData({
        description: action.description,
        planned_due_date: action.planned_due_date,
        investment_cents: action.investment_cents ? (action.investment_cents / 100).toString() : '',
      });
    } else {
      setEditingAction(null);
      setFormData({
        description: '',
        planned_due_date: '',
        investment_cents: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingAction(null);
    setFormData({
      description: '',
      planned_due_date: '',
      investment_cents: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!pessoa?.id) return;
    if (formData.description.trim().length < 10) {
      showToast('error', 'A descrição deve ter no mínimo 10 caracteres');
      return;
    }
    if (!formData.planned_due_date) {
      showToast('error', 'Data prevista é obrigatória');
      return;
    }

    try {
      const actionData = {
        user_id: pessoa.id,
        description: formData.description.trim(),
        planned_due_date: formData.planned_due_date,
        investment_cents: formData.investment_cents
          ? Math.round(parseFloat(formData.investment_cents) * 100)
          : null,
        status: 'em_andamento',
      };

      if (editingAction) {
        const { error } = await supabase
          .from('pdi_user_actions')
          .update(actionData)
          .eq('id', editingAction.id);

        if (error) throw error;
        showToast('success', 'Ação atualizada com sucesso');
      } else {
        const { error } = await supabase.from('pdi_user_actions').insert(actionData);

        if (error) throw error;
        showToast('success', 'Ação criada com sucesso');
      }

      handleCloseModal();
      loadActions();
    } catch (error: any) {
      showToast('error', error.message || 'Erro ao salvar ação');
    }
  };

  const handleToggleComplete = async (action: PDIUserAction) => {
    const newStatus = action.status === 'concluido' ? 'em_andamento' : 'concluido';

    try {
      const { error } = await supabase
        .from('pdi_user_actions')
        .update({ status: newStatus })
        .eq('id', action.id);

      if (error) throw error;
      showToast(
        'success',
        newStatus === 'concluido' ? 'Ação marcada como concluída' : 'Ação marcada como em andamento'
      );
      loadActions();
    } catch (error: any) {
      showToast('error', error.message || 'Erro ao atualizar ação');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta ação?')) return;

    try {
      const { error } = await supabase.from('pdi_user_actions').delete().eq('id', id);
      if (error) throw error;
      showToast('success', 'Ação excluída com sucesso');
      loadActions();
    } catch (error: any) {
      showToast('error', error.message || 'Erro ao excluir ação');
    }
  };

  const pendingActions = actions.filter((a) => a.status === 'em_andamento');
  const completedActions = actions.filter((a) => a.status === 'concluido');

  return (
    <>
      <Header
        title="Ações do PDI"
        subtitle="Gerencie suas ações personalizadas de desenvolvimento"
      />

      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate('/pdi/meu-pdi')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={18} />
            Voltar
          </button>
          <Button onClick={() => handleOpenModal()}>
            <Plus size={18} />
            Nova Ação
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Carregando...</div>
        ) : actions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">Você ainda não criou nenhuma ação</p>
            <Button onClick={() => handleOpenModal()}>
              <Plus size={18} />
              Criar Primeira Ação
            </Button>
          </div>
        ) : (
          <>
            {pendingActions.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Em Andamento ({pendingActions.length})
                </h2>
                <div className="bg-white rounded-lg border border-gray-200 divide-y">
                  {pendingActions.map((action) => (
                    <div key={action.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 mb-2">{action.description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar size={14} />
                              {new Date(action.planned_due_date).toLocaleDateString('pt-BR')}
                            </span>
                            {action.investment_cents && (
                              <span>
                                Investimento: R$ {(action.investment_cents / 100).toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleToggleComplete(action)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Marcar como concluída"
                          >
                            <CheckCircle size={18} />
                          </button>
                          <button
                            onClick={() => handleOpenModal(action)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(action.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Excluir"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {completedActions.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Concluídas ({completedActions.length})
                </h2>
                <div className="bg-white rounded-lg border border-gray-200 divide-y">
                  {completedActions.map((action) => (
                    <div key={action.id} className="p-4 bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-gray-700 mb-2 line-through">
                            {action.description}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar size={14} />
                              {new Date(action.planned_due_date).toLocaleDateString('pt-BR')}
                            </span>
                            {action.investment_cents && (
                              <span>
                                Investimento: R$ {(action.investment_cents / 100).toFixed(2)}
                              </span>
                            )}
                            {action.completed_at && (
                              <span>
                                Concluída em:{' '}
                                {new Date(action.completed_at).toLocaleDateString('pt-BR')}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleToggleComplete(action)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Marcar como em andamento"
                          >
                            <CheckCircle size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(action.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Excluir"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingAction ? 'Editar Ação' : 'Nova Ação'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Descreva a ação de desenvolvimento (mínimo 10 caracteres)"
              required
              minLength={10}
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.description.length}/10 caracteres mínimos
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data Prevista <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.planned_due_date}
              onChange={(e) => setFormData({ ...formData, planned_due_date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Investimento (R$) - Opcional
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.investment_cents}
              onChange={(e) => setFormData({ ...formData, investment_cents: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: 150.00"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <Button type="submit">{editingAction ? 'Atualizar' : 'Criar'}</Button>
          </div>
        </form>
      </Modal>
    </>
  );
};
