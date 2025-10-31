import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { DataTable } from '../components/DataTable';
import { Modal } from '../components/Modal';
import { toast } from 'react-hot-toast';
import { User, UserRole } from '../types';
import { useAuth } from '../contexts/AuthContext';

export function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    country: '',
    city: '',
    birthyear: '',
    gender: '',
  });
  const { isAdmin } = useAuth();

  const fetchUsers = async (page = 1) => {
    setLoading(true);
    try {
      const response = await apiService.getAllUsers(page, pagination.limit);
      setUsers(response.data);
      setPagination(response.pagination);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const columns = [
    { header: 'ID', accessor: 'id' as const },
    { header: 'Name', accessor: 'name' as const },
    { header: 'Email', accessor: 'email' as const },
    { header: 'Country', accessor: 'country' as const },
    { header: 'City', accessor: 'city' as const },
    { header: 'Role', accessor: 'roleId' as const, render: (roleId: number) => {
      const roles = {
        [UserRole.ADMIN]: 'Admin',
        [UserRole.MOHAFEZ]: 'Mohafez',
        [UserRole.NORMAL]: 'Normal',
        [UserRole.NOT_ACCEPTED_MOHAFEZ]: 'Pending Mohafez',
      };
      return roles[roleId as keyof typeof roles] || 'Unknown';
    }},
    { header: 'Created', accessor: 'creationDate' as const, render: (date: string) => date ? new Date(date).toLocaleDateString() : '-' },
  ];

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setFormData({
      name: user.name || '',
      country: user.country || '',
      city: user.city || '',
      birthyear: user.birthyear?.toString() || '',
      gender: user.gender || '',
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = (user: User) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedUser) return;
    try {
      await apiService.updateUser({
        ...formData,
        birthyear: formData.birthyear ? parseInt(formData.birthyear) : undefined,
      });
      toast.success('User updated successfully');
      setIsEditModalOpen(false);
      fetchUsers(pagination.page);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update user');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;
    try {
      await apiService.deleteUser(selectedUser.id);
      toast.success('User deleted successfully');
      setIsDeleteModalOpen(false);
      fetchUsers(pagination.page);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
      </div>

      <DataTable
        data={users}
        columns={columns}
        onEdit={isAdmin ? handleEdit : undefined}
        onDelete={isAdmin ? handleDelete : undefined}
        isLoading={loading}
      />

      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => fetchUsers(pagination.page - 1)}
          disabled={pagination.page <= 1}
          className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-sm text-gray-600">
          Page {pagination.page} of {pagination.totalPages} (Total: {pagination.total})
        </span>
        <button
          onClick={() => fetchUsers(pagination.page + 1)}
          disabled={pagination.page >= pagination.totalPages}
          className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50"
        >
          Next
        </button>
      </div>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit User"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Country</label>
            <input
              type="text"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">City</label>
            <input
              type="text"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Birth Year</label>
            <input
              type="number"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              value={formData.birthyear}
              onChange={(e) => setFormData({ ...formData, birthyear: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Gender</label>
            <select
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
            >
              <option value="">Select...</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
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
        title="Delete User"
        size="sm"
      >
        <div className="space-y-4">
          <p>Are you sure you want to delete user <strong>{selectedUser?.name}</strong>?</p>
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

