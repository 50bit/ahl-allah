import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { DataTable } from '../components/DataTable';
import { Modal } from '../components/Modal';
import { toast } from 'react-hot-toast';
import { Complaint } from '../types';
import { useAuth } from '../contexts/AuthContext';

export function Complaints() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    mohafezId: '',
    status: '',
    rating: '',
  });
  const { isAdmin } = useAuth();

  const fetchComplaints = async (page = 1) => {
    setLoading(true);
    try {
      const response = await apiService.getComplaints(page, pagination.limit);
      setComplaints(response.data);
      setPagination(response.pagination);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const columns = [
    { header: 'ID', accessor: 'complaintId' as const },
    { header: 'Title', accessor: 'title' as const },
    { header: 'Description', accessor: 'description' as const, render: (desc: string) => desc?.substring(0, 50) + '...' },
    { header: 'Status', accessor: 'status' as const },
    { header: 'Rating', accessor: 'rating' as const, render: (rating: number) => rating ? `${rating}/5` : '-' },
    { header: 'Created', accessor: 'createdAt' as const, render: (date: string) => date ? new Date(date).toLocaleDateString() : '-' },
  ];

  const handleCreate = () => {
    setFormData({ title: '', description: '', mohafezId: '', status: '', rating: '' });
    setIsCreateModalOpen(true);
  };

  const handleStatusUpdate = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setFormData({ ...formData, status: complaint.status || '' });
    setIsStatusModalOpen(true);
  };

  const handleRatingUpdate = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setFormData({ ...formData, rating: complaint.rating?.toString() || '' });
    setIsRatingModalOpen(true);
  };

  const handleDelete = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setIsDeleteModalOpen(true);
  };

  const handleCreateSubmit = async () => {
    try {
      await apiService.createComplaint({
        title: formData.title,
        description: formData.description,
        mohafezId: parseInt(formData.mohafezId),
      });
      toast.success('Complaint created successfully');
      setIsCreateModalOpen(false);
      fetchComplaints(pagination.page);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create complaint');
    }
  };

  const handleStatusUpdateConfirm = async () => {
    if (!selectedComplaint) return;
    try {
      await apiService.updateComplaintStatus(selectedComplaint.complaintId, formData.status);
      toast.success('Complaint status updated successfully');
      setIsStatusModalOpen(false);
      fetchComplaints(pagination.page);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const handleRatingUpdateConfirm = async () => {
    if (!selectedComplaint) return;
    try {
      await apiService.updateComplaintRating(selectedComplaint.complaintId, parseInt(formData.rating));
      toast.success('Rating updated successfully');
      setIsRatingModalOpen(false);
      fetchComplaints(pagination.page);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update rating');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedComplaint) return;
    try {
      await apiService.deleteComplaint(selectedComplaint.complaintId);
      toast.success('Complaint deleted successfully');
      setIsDeleteModalOpen(false);
      fetchComplaints(pagination.page);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete complaint');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Complaints</h1>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Create Complaint
        </button>
      </div>

      <DataTable
        data={complaints}
        columns={columns}
        onEdit={handleStatusUpdate}
        onDelete={handleDelete}
        isLoading={loading}
      />

      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => fetchComplaints(pagination.page - 1)}
          disabled={pagination.page <= 1}
          className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-sm text-gray-600">
          Page {pagination.page} of {pagination.totalPages} (Total: {pagination.total})
        </span>
        <button
          onClick={() => fetchComplaints(pagination.page + 1)}
          disabled={pagination.page >= pagination.totalPages}
          className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50"
        >
          Next
        </button>
      </div>

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Complaint"
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
            <label className="block text-sm font-medium text-gray-700">Description *</label>
            <textarea
              rows={6}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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

      {isAdmin && (
        <Modal
          isOpen={isStatusModalOpen}
          onClose={() => setIsStatusModalOpen(false)}
          title="Update Complaint Status"
          size="sm"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Status *</label>
              <select
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="">Select...</option>
                <option value="pending">Pending</option>
                <option value="resolved">Resolved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsStatusModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusUpdateConfirm}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Update
              </button>
            </div>
          </div>
        </Modal>
      )}

      <Modal
        isOpen={isRatingModalOpen}
        onClose={() => setIsRatingModalOpen(false)}
        title="Add Rating"
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Rating (1-5) *</label>
            <input
              type="number"
              min="1"
              max="5"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              value={formData.rating}
              onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setIsRatingModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-md"
            >
              Cancel
            </button>
            <button
              onClick={handleRatingUpdateConfirm}
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
        title="Delete Complaint"
        size="sm"
      >
        <div className="space-y-4">
          <p>Are you sure you want to delete this complaint?</p>
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

