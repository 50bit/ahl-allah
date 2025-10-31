import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';

// Auth Pages
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { RegisterMohafez } from './pages/RegisterMohafez';
import { ForgotPassword } from './pages/ForgotPassword';

// Main Pages
import { Dashboard } from './pages/Dashboard';
import { Users } from './pages/Users';
import { Organizations } from './pages/Organizations';
import { Notes } from './pages/Notes';
import { Complaints } from './pages/Complaints';
import { Calls } from './pages/Calls';
import { Sessions } from './pages/Sessions';
import { Admin } from './pages/Admin';

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register-mohafez" element={<RegisterMohafez />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/users" element={<Users />} />
                  <Route path="/organizations" element={<Organizations />} />
                  <Route path="/notes" element={<Notes />} />
                  <Route path="/complaints" element={<Complaints />} />
                  <Route path="/calls" element={<Calls />} />
                  <Route path="/sessions" element={<Sessions />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}

export default App;

