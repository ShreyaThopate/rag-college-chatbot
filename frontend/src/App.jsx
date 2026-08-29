import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar/Navbar';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute/ProtectedRoute';

import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Chat } from './pages/Chat';
import { Admin } from './pages/Admin';
import { Documents } from './pages/Documents';
import { Profile } from './pages/Profile';

export const App = () => {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-brand-500 selection:text-white">
          <Navbar />
          <div className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Student & Authenticated Routes */}
              <Route
                path="/chat"
                element={
                  <ProtectedRoute>
                    <Chat />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />

              {/* Admin-only Routes */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <Admin />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/documents"
                element={
                  <AdminRoute>
                    <Documents />
                  </AdminRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>
      </AuthProvider>
    </Router>
  );
};

export default App;
