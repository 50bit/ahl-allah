import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { DataTable } from '../components/DataTable';
import { Modal } from '../components/Modal';
import { toast } from 'react-hot-toast';
import { Organization, OrgRole } from '../types';

export function Organizations() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    verified: false,
  });

  const fetchOrganizations = async () => {
    setLoading(true);
    try {
      const response = await apiService.getOrganizations();
      setOrganizations(response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch organizations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const columns = [
    { header: 'ID', accessor: 'organizationId' as const },
    { header: 'Name', accessor: 'name' as const },
    { header: 'Description', accessor: 'description' as const },
    { header: 'Verified', accessor: 'verified' as const, render: (verified: boolean) => (
      verified ? '✓ Yes' : '✗ No'
    )},
    { header: 'Members', accessor: 'Members' as const, render: (members: any[]) => members?.length || 0 },
  ];

  const handleCreate = () => {
    setFormData({ name: '', description: '', verified: false });
    setIsCreateModalOpen(true);
  };

  const handleEdit = (org: Organization) => {
    setSelectedOrg(org);
    setFormData({
      name: org.name || '',
      description: org.description || '',
      verified: org.verified || false,
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = (org: Organization) => {
    setSelectedOrg(org);
    setIsDeleteModalOpen(true);
  };

  const handleCreateSubmit = async () => {
    try {
      await apiService.createOrganization(formData);
      toast.success('Organization created successfully');
      setIsCreateModalOpen(false);
      fetchOrganizations();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create organization');
    }
  };

  const handleUpdate = async () => {
    if (!selectedOrg) return;
    try {
      await apiService.updateOrganization(selectedOrg.organizationId, formData);
      toast.success('Organization updated successfully');
      setIsEditModalOpen(false);
      fetchOrganizations();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update organization');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedOrg) return;
    try {
      await apiService.deleteOrganization(selectedOrg.organizationId);
      toast.success('Organization deleted successfully');
      setIsDeleteModalOpen(false);
      fetchOrganizations();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete organization');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Organizations</h1>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Create Organization
        </button>
      </div>

      <DataTable
        data={organizations}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={loading}
      />

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Organization"
        size="md"
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
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              rows={4}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              checked={formData.verified}
              onChange={(e) => setFormData({ ...formData, verified: e.target.checked })}
            />
            <label className="ml-2 block text-sm text-gray-700">Verified</label>
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
        title="Edit Organization"
        size="md"
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
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              rows={4}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              checked={formData.verified}
              onChange={(e) => setFormData({ ...formData, verified: e.target.checked })}
            />
            <label className="ml-2 block text-sm text-gray-700">Verified</label>
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
        title="Delete Organization"
        size="sm"
      >
        <div className="space-y-4">
          <p>Are you sure you want to delete organization <strong>{selectedOrg?.name}</strong>?</p>
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

