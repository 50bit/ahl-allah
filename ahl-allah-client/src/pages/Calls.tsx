import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { DataTable } from '../components/DataTable';
import { Modal } from '../components/Modal';
import { toast } from 'react-hot-toast';
import { Call } from '../types';

export function Calls() {
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [selectedCall, setSelectedCall] = useState<Call | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    studentId: '',
    mohafezId: '',
    callDate: '',
    duration: '0',
    status: 'scheduled',
    notes: '',
  });

  const fetchCalls = async (page = 1) => {
    setLoading(true);
    try {
      const response = await apiService.getCalls(page, pagination.limit);
      setCalls(response.data);
      setPagination(response.pagination);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch calls');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalls();
  }, []);

  const columns = [
    { header: 'ID', accessor: 'callId' as const },
    { header: 'Student ID', accessor: 'studentId' as const },
    { header: 'Mohafez ID', accessor: 'mohafezId' as const },
    { header: 'Call Date', accessor: 'callDate' as const, render: (date: string) => date ? new Date(date).toLocaleString() : '-' },
    { header: 'Duration', accessor: 'duration' as const, render: (duration: number) => `${duration} min` },
    { header: 'Status', accessor: 'status' as const },
  ];

  const handleCreate = () => {
    setFormData({
      studentId: '',
      mohafezId: '',
      callDate: new Date().toISOString().slice(0, 16),
      duration: '0',
      status: 'scheduled',
      notes: '',
    });
    setIsCreateModalOpen(true);
  };

  const handleEdit = (call: Call) => {
    setSelectedCall(call);
    setFormData({
      studentId: call.studentId?.toString() || '',
      mohafezId: call.mohafezId?.toString() || '',
      callDate: call.callDate ? new Date(call.callDate).toISOString().slice(0, 16) : '',
      duration: call.duration?.toString() || '0',
      status: call.status || 'scheduled',
      notes: call.notes || '',
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = (call: Call) => {
    setSelectedCall(call);
    setIsDeleteModalOpen(true);
  };

  const handleCreateSubmit = async () => {
    try {
      await apiService.createCall({
        ...formData,
        studentId: parseInt(formData.studentId),
        mohafezId: parseInt(formData.mohafezId),
        duration: parseInt(formData.duration),
      });
      toast.success('Call created successfully');
      setIsCreateModalOpen(false);
      fetchCalls(pagination.page);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create call');
    }
  };

  const handleUpdate = async () => {
    if (!selectedCall) return;
    try {
      await apiService.updateCall(selectedCall.callId, {
        callDate: formData.callDate,
        duration: parseInt(formData.duration),
        status: formData.status,
        notes: formData.notes,
      });
      toast.success('Call updated successfully');
      setIsEditModalOpen(false);
      fetchCalls(pagination.page);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update call');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCall) return;
    try {
      await apiService.deleteCall(selectedCall.callId);
      toast.success('Call deleted successfully');
      setIsDeleteModalOpen(false);
      fetchCalls(pagination.page);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete call');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Calls</h1>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Create Call
        </button>
      </div>

      <DataTable
        data={calls}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={loading}
      />

      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => fetchCalls(pagination.page - 1)}
          disabled={pagination.page <= 1}
          className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-sm text-gray-600">
          Page {pagination.page} of {pagination.totalPages} (Total: {pagination.total})
        </span>
        <button
          onClick={() => fetchCalls(pagination.page + 1)}
          disabled={pagination.page >= pagination.totalPages}
          className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50"
        >
          Next
        </button>
      </div>

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Call"
        size="md"
      >
        <div className="space-y-4">
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
            <label className="block text-sm font-medium text-gray-700">Mohafez ID *</label>
            <input
              type="number"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              value={formData.mohafezId}
              onChange={(e) => setFormData({ ...formData, mohafezId: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Call Date *</label>
            <input
              type="datetime-local"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              value={formData.callDate}
              onChange={(e) => setFormData({ ...formData, callDate: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Duration (minutes)</label>
            <input
              type="number"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              rows={4}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
        title="Edit Call"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Call Date *</label>
            <input
              type="datetime-local"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              value={formData.callDate}
              onChange={(e) => setFormData({ ...formData, callDate: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Duration (minutes)</label>
            <input
              type="number"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              rows={4}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
        title="Delete Call"
        size="sm"
      >
        <div className="space-y-4">
          <p>Are you sure you want to delete this call?</p>
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

