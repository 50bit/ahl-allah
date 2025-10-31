import React from 'react';
import { useAuth } from '../contexts/AuthContext';

export function Dashboard() {
  const { user, isAdmin, isMohafez } = useAuth();

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Welcome, {user?.name}!</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Role</div>
            <div className="text-2xl font-bold text-blue-900">
              {user?.roleId === 1 && 'Admin'}
              {user?.roleId === 2 && 'Mohafez'}
              {user?.roleId === 3 && 'Normal User'}
              {user?.roleId === 10 && 'Pending Mohafez'}
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Email</div>
            <div className="text-lg font-semibold text-green-900">{user?.email}</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Country</div>
            <div className="text-lg font-semibold text-purple-900">{user?.country || 'N/A'}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-sm text-gray-600 mb-2">Users</div>
          <div className="text-3xl font-bold text-gray-900">
            <a href="/users" className="text-indigo-600 hover:text-indigo-800">View All</a>
          </div>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-sm text-gray-600 mb-2">Organizations</div>
          <div className="text-3xl font-bold text-gray-900">
            <a href="/organizations" className="text-indigo-600 hover:text-indigo-800">View All</a>
          </div>
        </div>
        {isMohafez && (
          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-sm text-gray-600 mb-2">Notes</div>
            <div className="text-3xl font-bold text-gray-900">
              <a href="/notes" className="text-indigo-600 hover:text-indigo-800">View All</a>
            </div>
          </div>
        )}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-sm text-gray-600 mb-2">Complaints</div>
          <div className="text-3xl font-bold text-gray-900">
            <a href="/complaints" className="text-indigo-600 hover:text-indigo-800">View All</a>
          </div>
        </div>
      </div>

      {isAdmin && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Admin Panel</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="/admin"
              className="block p-4 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <div className="font-semibold text-gray-900">Pending Mohafez Approvals</div>
              <div className="text-sm text-gray-600">Review and approve mohafez applications</div>
            </a>
            <a
              href="/sessions"
              className="block p-4 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <div className="font-semibold text-gray-900">Sessions</div>
              <div className="text-sm text-gray-600">Manage sessions</div>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

