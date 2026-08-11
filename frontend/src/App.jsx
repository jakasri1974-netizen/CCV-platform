import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WalletProvider } from './context/WalletContext';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import SetupPasswordPage from './pages/SetupPasswordPage';
import EmployerVerify from './pages/EmployerVerify';
import AdminDashboard from './pages/AdminDashboard';
import CollegesPage from './pages/CollegesPage';
import BatchManagementPage from './pages/BatchManagementPage';
import StudentsPage from './pages/StudentsPage';
import CoursesPage from './pages/CoursesPage';
import IssueCertificatePage from './pages/IssueCertificatePage';
import CertificatesListPage from './pages/CertificatesListPage';
import BlockchainPage from './pages/BlockchainPage';
import StudentDashboard from './pages/StudentDashboard';

function ProtectedAdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">Loading session...</div>;
  if (!user || (user.role !== 'admin' && user.role !== 'super_admin' && user.role !== 'college_admin')) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function ProtectedStudentRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">Loading session...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <WalletProvider>
          <Routes>
            {/* Public Auth & Verification Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/setup-password" element={<SetupPasswordPage />} />
            <Route path="/verify" element={<EmployerVerify />} />
            <Route path="/verify/:certificateId" element={<EmployerVerify />} />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>} />
            <Route path="/admin/colleges" element={<ProtectedAdminRoute><CollegesPage /></ProtectedAdminRoute>} />
            <Route path="/admin/batches" element={<ProtectedAdminRoute><BatchManagementPage /></ProtectedAdminRoute>} />
            <Route path="/admin/students" element={<ProtectedAdminRoute><StudentsPage /></ProtectedAdminRoute>} />
            <Route path="/admin/courses" element={<ProtectedAdminRoute><CoursesPage /></ProtectedAdminRoute>} />
            <Route path="/admin/issue" element={<ProtectedAdminRoute><IssueCertificatePage /></ProtectedAdminRoute>} />
            <Route path="/admin/certificates" element={<ProtectedAdminRoute><CertificatesListPage /></ProtectedAdminRoute>} />
            <Route path="/admin/blockchain" element={<ProtectedAdminRoute><BlockchainPage /></ProtectedAdminRoute>} />

            {/* Student Portal Routes */}
            <Route path="/student/dashboard" element={<ProtectedStudentRoute><StudentDashboard /></ProtectedStudentRoute>} />

            {/* Fallback Redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </WalletProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
