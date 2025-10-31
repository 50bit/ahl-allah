import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, logout, isAdmin, isMohafez } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/users', label: 'Users', icon: '👥', adminOnly: false },
    { path: '/organizations', label: 'Organizations', icon: '🏢' },
    { path: '/notes', label: 'Notes', icon: '📝', mohafezOnly: true },
    { path: '/complaints', label: 'Complaints', icon: '⚠️' },
    { path: '/calls', label: 'Calls', icon: '📞' },
    { path: '/sessions', label: 'Sessions', icon: '📅', adminOnly: true },
    { path: '/admin', label: 'Admin Panel', icon: '⚙️', adminOnly: true },
  ].filter((item) => {
    if (item.adminOnly && !isAdmin) return false;
    if (item.mohafezOnly && !isMohafez) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between h-16 px-6 bg-indigo-600">
          <h1 className="text-xl font-bold text-white">Ahl Allah</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-white lg:hidden"
          >
            ✕
          </button>
        </div>
        <nav className="mt-8">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 ${
                isActive(item.path) ? 'bg-indigo-50 border-r-4 border-indigo-600' : ''
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-0 w-full p-4 border-t">
          <div className="mb-2 text-sm text-gray-600">
            <div className="font-medium">{user?.name}</div>
            <div className="text-xs text-gray-500">{user?.email}</div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 text-sm text-white bg-red-600 rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 bg-white shadow">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-600 lg:hidden"
          >
            ☰
          </button>
          <h2 className="text-xl font-semibold text-gray-800">
            {menuItems.find(item => isActive(item.path))?.label || 'Dashboard'}
          </h2>
          <div className="w-8"></div>
        </div>

        {/* Page content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}

