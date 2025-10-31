import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { DataTable } from '../components/DataTable';
import { Modal } from '../components/Modal';
import { toast } from 'react-hot-toast';
import { Session, Language } from '../types';
import { useAuth } from '../contexts/AuthContext';

export function Sessions() {
  const { isAdmin } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    admidUid: '',
    maxMembers: '',
    level: '',
    language: '1',
    timePerSession: '',
    summary: '',
  });
  
  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">You must be an Admin to access this page.</p>
      </div>
    );
  }

  const fetchSessions = async (page = 1) => {
    setLoading(true);
    try {
      const response = await apiService.getSessions(page, pagination.limit);
      setSessions(response.data);
      setPagination(response.pagination);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const columns = [
    { header: 'ID', accessor: 'sessionId' as const },
    { header: 'Name', accessor: 'name' as const },
    { header: 'Level', accessor: 'level' as const },
    { header: 'Max Members', accessor: 'maxMembers' as const },
    { header: 'Members', accessor: 'members' as const },
    { header: 'Language', accessor: 'language' as const, render: (lang: number) => {
      const languages = {
        [Language.ARABIC]: 'Arabic',
        [Language.ENGLISH]: 'English',
        [Language.ALL]: 'All',
      };
      return languages[lang as keyof typeof languages] || 'Unknown';
    }},
    { header: 'Time/Session', accessor: 'timePerSession' as const, render: (time: number) => `${time} min` },
  ];

  const handleCreate = () => {
    setFormData({
      name: '',
      admidUid: '',
      maxMembers: '',
      level: '',
      language: '1',
      timePerSession: '',
      summary: '',
    });
    setIsCreateModalOpen(true);
  };

  const handleEdit = (session: Session) => {
    setSelectedSession(session);
    setFormData({
      name: session.name || '',
      admidUid: session.admidUid?.toString() || '',
      maxMembers: session.maxMembers?.toString() || '',
      level: session.level?.toString() || '',
      language: session.language?.toString() || '1',
      timePerSession: session.timePerSession?.toString() || '',
      summary: session.summary || '',
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = (session: Session) => {
    setSelectedSession(session);
    setIsDeleteModalOpen(true);
  };

  const handleCreateSubmit = async () => {
    try {
      await apiService.createSession({
        ...formData,
        admidUid: parseInt(formData.admidUid),
        maxMembers: parseInt(formData.maxMembers),
        level: parseInt(formData.level),
        language: parseInt(formData.language),
        timePerSession: parseInt(formData.timePerSession),
      });
      toast.success('Session created successfully');
      setIsCreateModalOpen(false);
      fetchSessions(pagination.page);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create session');
    }
  };

  const handleUpdate = async () => {
    if (!selectedSession) return;
    try {
      await apiService.updateSession(selectedSession.sessionId, {
        ...formData,
        admidUid: parseInt(formData.admidUid),
        maxMembers: parseInt(formData.maxMembers),
        level: parseInt(formData.level),
        language: parseInt(formData.language),
        timePerSession: parseInt(formData.timePerSession),
      });
      toast.success('Session updated successfully');
      setIsEditModalOpen(false);
      fetchSessions(pagination.page);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update session');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedSession) return;
    try {
      await apiService.deleteSession(selectedSession.sessionId);
      toast.success('Session deleted successfully');
      setIsDeleteModalOpen(false);
      fetchSessions(pagination.page);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete session');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Sessions</h1>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Create Session
        </button>
      </div>

      <DataTable
        data={sessions}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={loading}
      />

      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => fetchSessions(pagination.page - 1)}
          disabled={pagination.page <= 1}
          className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-sm text-gray-600">
          Page {pagination.page} of {pagination.totalPages} (Total: {pagination.total})
        </span>
        <button
          onClick={() => fetchSessions(pagination.page + 1)}
          disabled={pagination.page >= pagination.totalPages}
          className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50"
        >
          Next
        </button>
      </div>

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Session"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name *</label>
            <input
              type="text"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Admin User ID *</label>
              <input
                type="number"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                value={formData.admidUid}
                onChange={(e) => setFormData({ ...formData, admidUid: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Max Members *</label>
              <input
                type="number"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                value={formData.maxMembers}
                onChange={(e) => setFormData({ ...formData, maxMembers: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Level *</label>
              <input
                type="number"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Language *</label>
              <select
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
              >
                <option value="1">Arabic</option>
                <option value="2">English</option>
                <option value="3">All</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Time per Session (min) *</label>
              <input
                type="number"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                value={formData.timePerSession}
                onChange={(e) => setFormData({ ...formData, timePerSession: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Summary</label>
            <textarea
              rows={4}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
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
        title="Edit Session"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name *</label>
            <input
              type="text"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Admin User ID *</label>
              <input
                type="number"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                value={formData.admidUid}
                onChange={(e) => setFormData({ ...formData, admidUid: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Max Members *</label>
              <input
                type="number"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                value={formData.maxMembers}
                onChange={(e) => setFormData({ ...formData, maxMembers: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Level *</label>
              <input
                type="number"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Language *</label>
              <select
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
              >
                <option value="1">Arabic</option>
                <option value="2">English</option>
                <option value="3">All</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Time per Session (min) *</label>
              <input
                type="number"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                value={formData.timePerSession}
                onChange={(e) => setFormData({ ...formData, timePerSession: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Summary</label>
            <textarea
              rows={4}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
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
        title="Delete Session"
        size="sm"
      >
        <div className="space-y-4">
          <p>Are you sure you want to delete session <strong>{selectedSession?.name}</strong>?</p>
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

