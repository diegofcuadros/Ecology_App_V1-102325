import React from 'react';
import { useAuth } from './contexts/AuthContext';
import AuthPage from './pages/AuthPage';
import StudentDashboard from './pages/StudentDashboard';
import ProfessorDashboard from './pages/ProfessorDashboard';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@4.4.168/build/pdf.worker.min.mjs`;

const App: React.FC = () => {
  const { session, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="h-12 w-12 border-4 border-current border-t-transparent rounded-full animate-spin text-green-500"></div>
      </div>
    );
  }

  if (!session || !profile) {
    return <AuthPage />;
  }

  if (profile.role === 'student') {
    return <StudentDashboard />;
  }

  if (profile.role === 'professor') {
    return <ProfessorDashboard />;
  }

  return (
    <div className="flex items-center justify-center h-screen bg-red-100 text-red-800">
      <p>Error: User has an invalid role.</p>
    </div>
  );
};

export default App;