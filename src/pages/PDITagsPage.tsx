import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { useToast } from '../components/Toast';
import { supabase } from '../lib/supabase';
import { PDITag } from '../types';

export const PDITagsPage = () => {
  const { showToast } = useToast();
  const [tags, setTags] = useState<PDITag[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTag, setEditingTag] = useState<PDITag | null>(null);

  const [formData, setFormData] = useState({
    nome: '',
    slug: '',
    descricao: '',
  });

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pdi_tags')
        .select('*')
        .order('nome');

      if (error) throw error;
      setTags(data || []);
    } catch (error: any) {
      showToast('error', error.message || 'Erro ao carregar tags');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (nome: string) => {
    return nome
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleOpenModal = (tag?: PDITag) => {
    if (tag) {
      setEditingTag(tag);
      setFormData({
        nome: tag.nome,
        slug: tag.slug,
        descricao: tag.descricao || '',
      });
    } else {
      setEditingTag(null);
      setFormData({ nome: '', slug: '', descricao: '' });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTag(null);
    setFormData({ nome: '', slug: '', descricao: '' });
  };

  const handleNomeChange = (nome: string) => {
    setFormData({
      ...formData,
      nome,
      slug: generateSlug(nome),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nome.trim()) {
      showToast('error', 'Nome é obrigatório');
      return;
    }

    try {
      if (editingTag) {
        const { error } = await supabase
          .from('pdi_tags')
          .update({
            nome: formData.nome.trim(),
            slug: formData.slug.trim(),
            descricao: formData.descricao.trim() || null,
          })
          .eq('id', editingTag.id);

        if (error) throw error;
        showToast('success', 'Tag atualizada com sucesso');
      } else {
        const { error } = await supabase.from('pdi_tags').insert({
          nome: formData.nome.trim(),
          slug: formData.slug.trim(),
          descricao: formData.descricao.trim() || null,
        });

        if (error) throw error;
        showToast('success', 'Tag criada com sucesso');
      }

      handleCloseModal();
      loadTags();
    } catch (error: any) {
      showToast('error', error.message || 'Erro ao salvar tag');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta tag?')) return;

    try {
      const { error } = await supabase.from('pdi_tags').delete().eq('id', id);
      if (error) throw error;
      showToast('success', 'Tag excluída com sucesso');
      loadTags();
    } catch (error: any) {
      showToast('error', error.message || 'Erro ao excluir tag');
    }
  };

  const filteredTags = tags.filter(
    (tag) =>
      tag.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tag.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tag.descricao && tag.descricao.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <>
      <Header
        title="Tags do PDI"
        subtitle="Gerencie as tags utilizadas para categorização de conteúdos"
      />

      <div className="p-6">
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <Button onClick={() => handleOpenModal()}>
            <Plus size={18} />
            Nova Tag
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Carregando...</div>
        ) : filteredTags.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">
              {searchTerm ? 'Nenhuma tag encontrada' : 'Nenhuma tag cadastrada'}
            </p>
            {!searchTerm && (
              <Button onClick={() => handleOpenModal()}>
                <Plus size={18} />
                Criar Primeira Tag
              </Button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Slug
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descrição
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTags.map((tag) => (
                  <tr key={tag.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-medium text-gray-900">{tag.nome}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <code className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                        #{tag.slug}
                      </code>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {tag.descricao || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleOpenModal(tag)}
                        className="text-blue-600 hover:text-blue-700 mr-3"
                        title="Editar"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(tag.id)}
                        className="text-red-600 hover:text-red-700"
                        title="Excluir"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingTag ? 'Editar Tag' : 'Nova Tag'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.nome}
              onChange={(e) => handleNomeChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: Liderança"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Slug <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: lideranca"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Gerado automaticamente a partir do nome
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <textarea
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Descreva o objetivo desta tag..."
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
            <Button type="submit">
              {editingTag ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};
