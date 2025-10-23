import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { DocumentViewer } from '../components/ArticleViewer';
import { ChatWindow } from '../components/ChatWindow';
import { CreateStudySetModal } from '../components/CreateStudySetModal';
import { useChat } from '../hooks/useChat';
import { useAuth } from '../contexts/AuthContext';
import { getStudySetsForUser, createStudySet, deleteStudySet } from '../services/supabaseService';
import type { StudySet } from '../types';
import { BookOpenIcon, LightBulbIcon } from '../components/Icons';

const StudentWelcomeScreen: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-full text-center bg-gray-50 dark:bg-gray-900 p-8">
    <div className="bg-green-100 dark:bg-green-900 p-4 rounded-full mb-6">
      <BookOpenIcon className="h-12 w-12 text-green-600 dark:text-green-300" />
    </div>
    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Your Dashboard</h1>
    <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
      Create or select a Study Set to begin your AI-tutored session.
    </p>
     <div className="mt-8 text-left max-w-md w-full bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-start gap-4">
          <LightBulbIcon className="h-8 w-8 text-yellow-500 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">How it works:</h3>
            <ol className="list-decimal list-inside mt-2 space-y-1 text-gray-600 dark:text-gray-400 text-sm">
              <li>Click "Create New Study Set".</li>
              <li>Upload your article and assignment PDFs.</li>
              <li>I will guide you through the assignment questions.</li>
            </ol>
          </div>
        </div>
      </div>
  </div>
);


const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [studySets, setStudySets] = useState<StudySet[]>([]);
  const [selectedStudySet, setSelectedStudySet] = useState<StudySet | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { messages, isLoading, handleSendMessage } = useChat(selectedStudySet);

  useEffect(() => {
    if (user) {
      getStudySetsForUser(user.id).then(setStudySets);
    }
  }, [user]);

  const handleCreateStudySet = async (articleFile: File, assignmentFile: File) => {
    if (!user) return;
    setIsCreating(true);
    setCreateError(null);
    try {
      const newStudySet = await createStudySet(user.id, articleFile, assignmentFile);
      setStudySets(prev => [newStudySet, ...prev]);
      setSelectedStudySet(newStudySet);
      setIsModalOpen(false);
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      }
    } catch (error) {
      console.error("Error creating study set:", error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      setCreateError(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteStudySet = async (studySetId: string) => {
    if (window.confirm("Are you sure you want to delete this study set? This action cannot be undone.")) {
      if (selectedStudySet?.id === studySetId) {
        setSelectedStudySet(null);
      }
      await deleteStudySet(studySetId);
      setStudySets(prev => prev.filter(s => s.id !== studySetId));
    }
  };

  const handleSelectAndCloseSidebar = (studySet: StudySet) => {
    setSelectedStudySet(studySet);
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };
  
  const resetChat = () => {
    setSelectedStudySet(null);
  };

  return (
    <>
      <div className="relative min-h-screen md:flex font-sans text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800">
        <Sidebar 
          studySets={studySets} 
          selectedStudySet={selectedStudySet} 
          onSelectStudySet={handleSelectAndCloseSidebar}
          onReset={resetChat}
          onDeleteStudySet={handleDeleteStudySet}
          onCreateNew={() => {
            setCreateError(null);
            setIsModalOpen(true);
          }}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        <main className="flex-1 flex flex-col">
          {selectedStudySet ? (
            <div className="grid grid-cols-1 md:grid-cols-2 flex-1 overflow-hidden">
              <ChatWindow
                messages={messages}
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
                articleTitle={selectedStudySet.article_title}
                onMenuClick={() => setIsSidebarOpen(true)}
              />
              <div className="hidden md:block">
                <DocumentViewer studySet={selectedStudySet} />
              </div>
            </div>
          ) : (
            <StudentWelcomeScreen />
          )}
        </main>
      </div>
      <CreateStudySetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateStudySet}
        isCreating={isCreating}
        createError={createError}
      />
    </>
  );
};

export default StudentDashboard;