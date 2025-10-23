import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { assignmentAPI } from '../../services/api';
import { BookOpenIcon, CheckCircleIcon, ClockIcon } from '../../components/Icons';

export const StudentDashboard: React.FC = () => {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    try {
      const data = await assignmentAPI.getStudentAssignments();
      setAssignments(data);
    } catch (err: any) {
      setError('Failed to load assignments');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const startAssignment = (assignmentId: string) => {
    navigate(`/assignment/${assignmentId}`);
  };

  const activeAssignments = assignments.filter(a => a.studentProgress && !a.studentProgress.hasGrade);
  const completedAssignments = assignments.filter(a => a.studentProgress?.hasGrade);
  const availableAssignments = assignments.filter(a => !a.studentProgress);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 dark:bg-green-900 p-2 rounded-lg">
                <BookOpenIcon className="h-8 w-8 text-green-600 dark:text-green-300" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Eco Tutor</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Welcome back, {user?.firstName}!</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-lg">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{activeAssignments.length}</p>
              </div>
              <ClockIcon className="h-12 w-12 text-blue-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{completedAssignments.length}</p>
              </div>
              <CheckCircleIcon className="h-12 w-12 text-green-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Available</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{availableAssignments.length}</p>
              </div>
              <BookOpenIcon className="h-12 w-12 text-purple-500" />
            </div>
          </div>
        </div>

        {availableAssignments.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Available Assignments</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableAssignments.map((assignment) => (
                <AssignmentCard
                  key={assignment.id}
                  assignment={assignment}
                  onAction={() => startAssignment(assignment.id)}
                  actionLabel="Start"
                />
              ))}
            </div>
          </section>
        )}

        {activeAssignments.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">In Progress</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeAssignments.map((assignment) => (
                <AssignmentCard
                  key={assignment.id}
                  assignment={assignment}
                  onAction={() => startAssignment(assignment.id)}
                  actionLabel="Continue"
                />
              ))}
            </div>
          </section>
        )}

        {assignments.length === 0 && (
          <div className="text-center py-12">
            <BookOpenIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No assignments yet</h3>
            <p className="text-gray-600 dark:text-gray-400">Check back later for new assignments.</p>
          </div>
        )}
      </main>
    </div>
  );
};

const AssignmentCard: React.FC<any> = ({ assignment, onAction, actionLabel }) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No due date';
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{assignment.title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{assignment.article.title}</p>
      
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">Due: {formatDate(assignment.dueDate)}</span>
        <button
          onClick={onAction}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg"
        >
          {actionLabel}
        </button>
      </div>
    </div>
  );
};
