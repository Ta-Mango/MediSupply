import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SupplierDashboard from './pages/supplier/SupplierDashboard';
import ClientDashboard from './pages/client/ClientDashboard';
import DriverDashboard from './pages/driver/DriverDashboard';
import { UserRole } from './lib/firebase';

function ProtectedRoute({ children, allowedRole }: { children: React.ReactNode, allowedRole?: UserRole }) {
  const { user, profile, loading } = useAuth();

  if (loading) return <div className="h-screen w-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (allowedRole && profile?.role !== allowedRole) return <Navigate to="/" />;

  return <>{children}</>;
}

function HomeRedirect() {
  const { profile, loading } = useAuth();
  if (loading) return null;
  if (!profile) return <Navigate to="/onboarding" />;

  switch (profile.role) {
    case 'supplier': return <Navigate to="/supplier" />;
    case 'client': return <Navigate to="/client" />;
    case 'driver': return <Navigate to="/driver" />;
    default: return <Navigate to="/login" />;
  }
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          
          <Route path="/supplier/*" element={
            <ProtectedRoute allowedRole="supplier">
              <SupplierDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/client/*" element={
            <ProtectedRoute allowedRole="client">
              <ClientDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/driver/*" element={
            <ProtectedRoute allowedRole="driver">
              <DriverDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
