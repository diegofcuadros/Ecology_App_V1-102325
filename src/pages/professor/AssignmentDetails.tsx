import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { assignmentAPI, chatAPI } from '../../services/api';
import { Assignment, ChatSession, Message } from '../../../shared/types';
import { ArrowLeftIcon, CheckCircleIcon, ClockIcon } from '../../components/Icons';

export const AssignmentDetails: React.FC = () => {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const navigate = useNavigate();

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGrading, setIsGrading] = useState(false);
  const [error, setError] = useState('');

  // Grading form state
  const [gradeForm, setGradeForm] = useState({
    score: '',
    feedback: '',
  });

  useEffect(() => {
    loadAssignment();
  }, [assignmentId]);

  const loadAssignment = async () => {
    try {
      setIsLoading(true);
      const data = await assignmentAPI.getById(assignmentId!);
      setAssignment(data);
    } catch (err: any) {
      setError('Failed to load assignment');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectStudent = async (session: ChatSession) => {
    setSelectedSession(session);
    setMessages(session.messages || []);

    // Pre-fill grade form if already graded
    if (session.grade) {
      setGradeForm({
        score: session.grade.score.toString(),
        feedback: session.grade.feedback || '',
      });
    } else {
      setGradeForm({ score: '', feedback: '' });
    }
  };

  const handleSubmitGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSession || !gradeForm.score) return;

    setIsGrading(true);
    setError('');

    try {
      await chatAPI.submitGrade(
        selectedSession.id,
        parseInt(gradeForm.score),
        gradeForm.feedback
      );

      // Reload assignment to get updated data
      await loadAssignment();

      // Update selected session
      const updatedSession = assignment?.chatSessions?.find(
        cs => cs.id === selectedSession.id
      );
      if (updatedSession) {
        setSelectedSession(updatedSession);
      }

      alert('Grade submitted successfully!');
    } catch (err: any) {
      setError('Failed to submit grade');
      console.error(err);
    } finally {
      setIsGrading(false);
    }
  };

  const getStageColor = (stage: string) => {
    const colors = {
      Comprehension: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      Evidence: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      Analysis: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      Advanced: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    };
    return colors[stage as keyof typeof colors] || colors.Comprehension;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">Assignment not found</p>
          <button
            onClick={() => navigate('/professor/dashboard')}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const chatSessions = assignment.chatSessions || [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/professor/dashboard')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <ArrowLeftIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {assignment.title}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {assignment.article.title}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-lg">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Student List */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Students ({chatSessions.length})
                </h2>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {chatSessions.length === 0 ? (
                  <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                    No students have started this assignment yet.
                  </div>
                ) : (
                  chatSessions.map((session) => (
                    <button
                      key={session.id}
                      onClick={() => handleSelectStudent(session)}
                      className={`w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                        selectedSession?.id === session.id ? 'bg-green-50 dark:bg-green-900/20' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {session.student.firstName} {session.student.lastName}
                        </p>
                        {session.grade ? (
                          <CheckCircleIcon className="h-5 w-5 text-green-500" />
                        ) : (
                          <ClockIcon className="h-5 w-5 text-orange-500" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className={`px-2 py-1 rounded-full ${getStageColor(session.currentStage)}`}>
                          {session.currentStage}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400">
                          {session.userMessageCount} messages
                        </span>
                      </div>
                      {session.grade && (
                        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                          Score: {session.grade.score}/100
                        </div>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Chat Transcript & Grading */}
          <div className="lg:col-span-2">
            {selectedSession ? (
              <div className="space-y-6">
                {/* Chat Transcript */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Chat Transcript - {selectedSession.student.firstName} {selectedSession.student.lastName}
                    </h2>
                  </div>
                  <div className="p-4 max-h-96 overflow-y-auto space-y-3">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`${
                          message.sender === 'user' ? 'text-right' : 'text-left'
                        }`}
                      >
                        <div
                          className={`inline-block max-w-2xl ${
                            message.sender === 'user'
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                          } rounded-lg px-4 py-2`}
                        >
                          <div className="whitespace-pre-wrap text-sm">{message.text}</div>
                          <div
                            className={`text-xs mt-1 ${
                              message.sender === 'user'
                                ? 'text-green-200'
                                : 'text-gray-500 dark:text-gray-400'
                            }`}
                          >
                            {new Date(message.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Grading Form */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {selectedSession.grade ? 'Update Grade' : 'Submit Grade'}
                    </h2>
                  </div>
                  <form onSubmit={handleSubmitGrade} className="p-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Score (0-100)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={gradeForm.score}
                        onChange={(e) => setGradeForm({ ...gradeForm, score: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Feedback (optional)
                      </label>
                      <textarea
                        value={gradeForm.feedback}
                        onChange={(e) => setGradeForm({ ...gradeForm, feedback: e.target.value })}
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                        placeholder="Provide constructive feedback for the student..."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isGrading}
                      className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium rounded-lg"
                    >
                      {isGrading ? 'Submitting...' : selectedSession.grade ? 'Update Grade' : 'Submit Grade'}
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
                <p className="text-gray-500 dark:text-gray-400">
                  Select a student from the list to view their chat transcript and submit a grade.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
