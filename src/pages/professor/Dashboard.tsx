import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { assignmentAPI, articleAPI } from '../../services/api';
import { Assignment, Article } from '../../../shared/types';
import { BookOpenIcon, UsersIcon, CheckCircleIcon, PlusIcon } from '../../components/Icons';

export const ProfessorDashboard: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showArticleUpload, setShowArticleUpload] = useState(false);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [assignmentsData, articlesData] = await Promise.all([
        assignmentAPI.getAll(),
        articleAPI.getAll(),
      ]);
      setAssignments(assignmentsData);
      setArticles(articlesData);
    } catch (err: any) {
      setError('Failed to load data');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAssignment = () => {
    navigate('/professor/assignment/new');
  };

  const handleViewAssignment = (assignmentId: string) => {
    navigate(`/professor/assignment/${assignmentId}`);
  };

  // Calculate stats
  const totalStudents = new Set(
    assignments.flatMap(a => a.chatSessions?.map(cs => cs.studentId) || [])
  ).size;

  const totalSubmissions = assignments.reduce(
    (sum, a) => sum + (a.chatSessions?.filter(cs => cs.grade).length || 0),
    0
  );

  const avgCompletionRate = assignments.length > 0
    ? Math.round(
        (assignments.reduce((sum, a) => {
          const total = a.chatSessions?.length || 0;
          const completed = a.chatSessions?.filter(cs => cs.grade).length || 0;
          return sum + (total > 0 ? (completed / total) * 100 : 0);
        }, 0) / assignments.length)
      )
    : 0;

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
                <p className="text-sm text-gray-600 dark:text-gray-400">Professor Dashboard - Welcome, {user?.firstName}!</p>
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Assignments</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{assignments.length}</p>
              </div>
              <BookOpenIcon className="h-12 w-12 text-blue-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Students</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalStudents}</p>
              </div>
              <UsersIcon className="h-12 w-12 text-purple-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Submissions</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalSubmissions}</p>
              </div>
              <CheckCircleIcon className="h-12 w-12 text-green-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Completion</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{avgCompletionRate}%</p>
              </div>
              <CheckCircleIcon className="h-12 w-12 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Assignments</h2>
          <button
            onClick={handleCreateAssignment}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg"
          >
            <PlusIcon className="h-5 w-5" />
            Create Assignment
          </button>
        </div>

        {/* Assignments List */}
        {assignments.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
            <BookOpenIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No assignments yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Create your first assignment to get started.</p>
            <button
              onClick={handleCreateAssignment}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg"
            >
              Create Assignment
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {assignments.map((assignment) => (
              <AssignmentCard
                key={assignment.id}
                assignment={assignment}
                onView={() => handleViewAssignment(assignment.id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

const AssignmentCard: React.FC<{ assignment: Assignment; onView: () => void }> = ({
  assignment,
  onView,
}) => {
  const totalStudents = assignment.chatSessions?.length || 0;
  const gradedStudents = assignment.chatSessions?.filter(cs => cs.grade).length || 0;
  const completionRate = totalStudents > 0 ? Math.round((gradedStudents / totalStudents) * 100) : 0;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No due date';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            {assignment.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            {assignment.article.title}
          </p>

          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              Due: {formatDate(assignment.dueDate)}
            </span>
            <span className="text-gray-600 dark:text-gray-400">•</span>
            <span className="text-gray-600 dark:text-gray-400">
              {totalStudents} student{totalStudents !== 1 ? 's' : ''}
            </span>
            <span className="text-gray-600 dark:text-gray-400">•</span>
            <span className="text-gray-600 dark:text-gray-400">
              {gradedStudents} graded ({completionRate}%)
            </span>
          </div>
        </div>

        <button
          onClick={onView}
          className="ml-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg"
        >
          View Details
        </button>
      </div>
    </div>
  );
};
