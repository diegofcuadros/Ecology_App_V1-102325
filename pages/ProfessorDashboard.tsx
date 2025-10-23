import React, { useState, useEffect } from 'react';
import { getStudents } from '../services/supabaseService';
import type { UserProfile } from '../types';
import ProfessorStudentView from './ProfessorStudentView';
import { useAuth } from '../contexts/AuthContext';
import { BookOpenIcon, UsersIcon, LogoutIcon } from '../components/Icons';

const ProfessorDashboard: React.FC = () => {
  const { profile, signOut } = useAuth();
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const studentList = await getStudents();
        setStudents(studentList);
      } catch (err) {
        setError('Failed to load student data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  if (selectedStudent) {
    return <ProfessorStudentView student={selectedStudent} onBack={() => setSelectedStudent(null)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 dark:bg-green-900 p-2 rounded-lg">
                <BookOpenIcon className="h-6 w-6 text-green-600 dark:text-green-300" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Eco Tutor | Professor Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 dark:text-gray-300">Welcome, {profile?.full_name}</span>
            <button onClick={signOut} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Sign out">
                <LogoutIcon className="h-5 w-5"/>
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-6">
            <UsersIcon className="h-8 w-8 text-gray-500 dark:text-gray-400"/>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">Student Roster</h2>
        </div>
        
        {loading && <p>Loading students...</p>}
        {error && <p className="text-red-500">{error}</p>}
        
        {!loading && !error && (
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                    {students.map((student) => (
                    <li key={student.id}>
                        <button onClick={() => setSelectedStudent(student)} className="w-full text-left block hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <div className="px-6 py-4">
                                <p className="text-lg font-medium text-green-600 dark:text-green-400">{student.full_name}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{student.id}</p>
                            </div>
                        </button>
                    </li>
                    ))}
                </ul>
            </div>
        )}
      </main>
    </div>
  );
};

export default ProfessorDashboard;