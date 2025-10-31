import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { DataTable } from '../components/DataTable';
import { Modal } from '../components/Modal';
import { toast } from 'react-hot-toast';
import { User, UserRole } from '../types';
import { useAuth } from '../contexts/AuthContext';

export function Admin() {
  const { isAdmin } = useAuth();
  const [pendingMohafez, setPendingMohafez] = useState<User[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [roleId, setRoleId] = useState('');
  
  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">You must be an Admin to access this page.</p>
      </div>
    );
  }

  const fetchPendingMohafez = async () => {
    setLoading(true);
    try {
      const response = await apiService.getPendingMohafez();
      setPendingMohafez(response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch pending mohafez');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await apiService.getStatistics();
      setStatistics(response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch statistics');
    }
  };

  useEffect(() => {
    fetchPendingMohafez();
    fetchStatistics();
  }, []);

  const columns = [
    { header: 'ID', accessor: 'id' as const },
    { header: 'Name', accessor: 'name' as const },
    { header: 'Email', accessor: 'email' as const },
    { header: 'Country', accessor: 'country' as const },
    { header: 'City', accessor: 'city' as const },
    { header: 'Created', accessor: 'creationDate' as const, render: (date: string) => date ? new Date(date).toLocaleDateString() : '-' },
    {
      header: 'Actions',
      accessor: 'id' as const,
      render: (_: any, row: User) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleApprove(row)}
            className="text-green-600 hover:text-green-900"
          >
            Approve
          </button>
          <button
            onClick={() => handleReject(row)}
            className="text-red-600 hover:text-red-900"
          >
            Reject
          </button>
        </div>
      ),
    },
  ];

  const handleApprove = async (user: User) => {
    try {
      await apiService.approveMohafez(user.id);
      toast.success('Mohafez approved successfully');
      fetchPendingMohafez();
      fetchStatistics();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to approve mohafez');
    }
  };

  const handleReject = async (user: User) => {
    if (!window.confirm(`Are you sure you want to reject ${user.name}? This will delete their account.`)) {
      return;
    }
    try {
      await apiService.rejectMohafez(user.id);
      toast.success('Mohafez rejected and removed');
      fetchPendingMohafez();
      fetchStatistics();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reject mohafez');
    }
  };

  const handleRoleUpdate = (user: User) => {
    setSelectedUser(user);
    setRoleId(user.roleId.toString());
    setIsRoleModalOpen(true);
  };

  const handleRoleUpdateConfirm = async () => {
    if (!selectedUser) return;
    try {
      await apiService.updateUserRole(selectedUser.id, parseInt(roleId));
      toast.success('User role updated successfully');
      setIsRoleModalOpen(false);
      fetchPendingMohafez();
      fetchStatistics();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update user role');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>

      {/* Statistics */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm text-gray-600">Total Users</div>
            <div className="text-3xl font-bold text-gray-900">{statistics.totalUsers}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm text-gray-600">Normal Users</div>
            <div className="text-3xl font-bold text-blue-600">{statistics.totalNormalUsers}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm text-gray-600">Mohafez</div>
            <div className="text-3xl font-bold text-green-600">{statistics.totalMohafez}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm text-gray-600">Pending Mohafez</div>
            <div className="text-3xl font-bold text-yellow-600">{statistics.pendingMohafez}</div>
          </div>
        </div>
      )}

      {/* Pending Mohafez */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Pending Mohafez Applications</h2>
        <DataTable
          data={pendingMohafez}
          columns={columns}
          isLoading={loading}
        />
      </div>

      <Modal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        title="Update User Role"
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Role *</label>
            <select
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              value={roleId}
              onChange={(e) => setRoleId(e.target.value)}
            >
              <option value={UserRole.ADMIN.toString()}>Admin</option>
              <option value={UserRole.MOHAFEZ.toString()}>Mohafez</option>
              <option value={UserRole.NORMAL.toString()}>Normal</option>
              <option value={UserRole.NOT_ACCEPTED_MOHAFEZ.toString()}>Pending Mohafez</option>
            </select>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setIsRoleModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-md"
            >
              Cancel
            </button>
            <button
              onClick={handleRoleUpdateConfirm}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Update
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

