import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { DataTable } from '../components/DataTable';
import { Modal } from '../components/Modal';
import { toast } from 'react-hot-toast';
import { Note } from '../types';
import { useAuth } from '../contexts/AuthContext';

export function Notes() {
  const { isMohafez } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    studentId: '',
  });
  
  if (!isMohafez) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">You must be a Mohafez to access this page.</p>
      </div>
    );
  }

  const fetchNotes = async (page = 1) => {
    setLoading(true);
    try {
      const response = await apiService.getNotes(page, pagination.limit);
      setNotes(response.data);
      setPagination(response.pagination);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch notes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const columns = [
    { header: 'ID', accessor: 'noteId' as const },
    { header: 'Title', accessor: 'title' as const },
    { header: 'Content', accessor: 'content' as const, render: (content: string) => content?.substring(0, 50) + '...' },
    { header: 'Student ID', accessor: 'studentId' as const },
    { header: 'Created', accessor: 'createdAt' as const, render: (date: string) => date ? new Date(date).toLocaleDateString() : '-' },
  ];

  const handleCreate = () => {
    setFormData({ title: '', content: '', studentId: '' });
    setIsCreateModalOpen(true);
  };

  const handleEdit = (note: Note) => {
    setSelectedNote(note);
    setFormData({
      title: note.title || '',
      content: note.content || '',
      studentId: note.studentId?.toString() || '',
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = (note: Note) => {
    setSelectedNote(note);
    setIsDeleteModalOpen(true);
  };

  const handleCreateSubmit = async () => {
    try {
      await apiService.createNote({
        ...formData,
        studentId: parseInt(formData.studentId),
      });
      toast.success('Note created successfully');
      setIsCreateModalOpen(false);
      fetchNotes(pagination.page);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create note');
    }
  };

  const handleUpdate = async () => {
    if (!selectedNote) return;
    try {
      await apiService.updateNote(selectedNote.noteId, {
        title: formData.title,
        content: formData.content,
      });
      toast.success('Note updated successfully');
      setIsEditModalOpen(false);
      fetchNotes(pagination.page);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update note');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedNote) return;
    try {
      await apiService.deleteNote(selectedNote.noteId);
      toast.success('Note deleted successfully');
      setIsDeleteModalOpen(false);
      fetchNotes(pagination.page);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete note');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Notes</h1>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Create Note
        </button>
      </div>

      <DataTable
        data={notes}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={loading}
      />

      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => fetchNotes(pagination.page - 1)}
          disabled={pagination.page <= 1}
          className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-sm text-gray-600">
          Page {pagination.page} of {pagination.totalPages} (Total: {pagination.total})
        </span>
        <button
          onClick={() => fetchNotes(pagination.page + 1)}
          disabled={pagination.page >= pagination.totalPages}
          className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50"
        >
          Next
        </button>
      </div>

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Note"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title *</label>
            <input
              type="text"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Student ID *</label>
            <input
              type="number"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              value={formData.studentId}
              onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Content *</label>
            <textarea
              rows={6}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-md"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateSubmit}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Create
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Note"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title *</label>
            <input
              type="text"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Content *</label>
            <textarea
              rows={6}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-md"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdate}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Update
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Note"
        size="sm"
      >
        <div className="space-y-4">
          <p>Are you sure you want to delete this note?</p>
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-md"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

