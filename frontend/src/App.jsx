import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout, ProtectedRoute } from './components/Layout';

import Landing from './pages/Landing';
import Setup from './pages/Setup';
import Login from './pages/Login';
import { StudentLogin, StudentRegister, TeacherRegister } from './pages/Auth';
import { AdminDashboard, TeacherRequests, StudentDatabase, AdminDepartments, AdminAllRequests } from './pages/Admin';
import TeacherDashboard from './pages/Teacher';
import { StudentDashboard, ApplyNoDues, Certificate } from './pages/Student';
import { PrincipalDashboard, ComplaintPage } from './pages/Principal';

function RoleRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Landing />;
  if (user.role === 'principal_assistant') return <Navigate to="/assistant" replace />;
  return <Navigate to={`/${user.role}`} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<RoleRedirect />} />
          <Route path="/setup" element={<Setup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/student-login" element={<StudentLogin />} />
          <Route path="/student-register" element={<StudentRegister />} />
          <Route path="/teacher-register" element={<TeacherRegister />} />
          <Route path="/complaint" element={<ComplaintPage />} />

          {/* Admin */}
          <Route path="/admin" element={<ProtectedRoute roles={['admin']}><Layout /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="teachers" element={<TeacherRequests />} />
            <Route path="students" element={<StudentDatabase />} />
            <Route path="requests" element={<AdminAllRequests />} />
            <Route path="departments" element={<AdminDepartments />} />
            <Route path="users" element={<AdminDashboard />} />
            <Route path="complaints" element={<AdminDashboard />} />
          </Route>

          {/* Teacher */}
          <Route path="/teacher" element={<ProtectedRoute roles={['teacher']}><Layout /></ProtectedRoute>}>
            <Route index element={<TeacherDashboard />} />
            <Route path="requests" element={<TeacherDashboard />} />
          </Route>

          {/* Student */}
          <Route path="/student" element={<ProtectedRoute roles={['student']}><Layout /></ProtectedRoute>}>
            <Route index element={<StudentDashboard />} />
            <Route path="apply" element={<ApplyNoDues />} />
            <Route path="status" element={<StudentDashboard />} />
            <Route path="certificate" element={<Certificate />} />
          </Route>

          {/* Principal */}
          <Route path="/principal" element={<ProtectedRoute roles={['principal', 'admin']}><Layout /></ProtectedRoute>}>
            <Route index element={<PrincipalDashboard />} />
            <Route path="requests" element={<PrincipalDashboard />} />
          </Route>

          {/* Principal Assistant */}
          <Route path="/assistant" element={<ProtectedRoute roles={['principal_assistant', 'admin']}><Layout /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="complaints" element={<AdminDashboard />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        <Toaster
          position="top-right"
          toastOptions={{
            style: { fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 14, borderRadius: 12, fontWeight: 500 },
            success: { iconTheme: { primary: '#15803d', secondary: 'white' } },
            error: { iconTheme: { primary: '#991b1b', secondary: 'white' } },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}
