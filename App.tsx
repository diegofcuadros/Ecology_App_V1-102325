import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './src/context/AuthContext';
import { ProtectedRoute } from './src/components/ProtectedRoute';
import { Login } from './src/pages/auth/Login';
import { Register } from './src/pages/auth/Register';
import { StudentDashboard } from './src/pages/student/Dashboard';
import { AssignmentPage } from './src/pages/student/Assignment';
import { ProfessorDashboard } from './src/pages/professor/Dashboard';
import { AssignmentDetails } from './src/pages/professor/AssignmentDetails';
import { ArticlesPage } from './src/pages/professor/Articles';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Student Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requireRole="student">
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/assignment/:assignmentId"
            element={
              <ProtectedRoute requireRole="student">
                <AssignmentPage />
              </ProtectedRoute>
            }
          />

          {/* Professor Routes */}
          <Route
            path="/professor/dashboard"
            element={
              <ProtectedRoute requireRole="professor">
                <ProfessorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/professor/articles"
            element={
              <ProtectedRoute requireRole="professor">
                <ArticlesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/professor/assignment/:assignmentId"
            element={
              <ProtectedRoute requireRole="professor">
                <AssignmentDetails />
              </ProtectedRoute>
            }
          />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
