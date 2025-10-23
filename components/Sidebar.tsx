import React from 'react';
import type { StudySet } from '../types';
import { BookOpenIcon, ChevronRightIcon, HomeIcon, TrashIcon, XIcon, PlusCircleIcon, DocumentTextIcon, LogoutIcon } from './Icons';
import { useAuth } from '../contexts/AuthContext';
import { isSupabaseConfigured } from '../lib/supabaseClient';

interface SidebarProps {
  studySets: StudySet[];
  selectedStudySet: StudySet | null;
  onSelectStudySet: (studySet: StudySet) => void;
  onReset: () => void;
  onDeleteStudySet: (studySetId: string) => void;
  onCreateNew: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  studySets, 
  selectedStudySet, 
  onSelectStudySet, 
  onReset,
  onDeleteStudySet,
  onCreateNew,
  isOpen,
  onClose,
}) => {
  const { profile, signOut } = useAuth();
  const isDemoMode = !isSupabaseConfigured;
  
  const handleDelete = (e: React.MouseEvent, studySet: StudySet) => {
    e.stopPropagation();
    if (isDemoMode) {
        alert("Deleting is disabled in demo mode.");
        return;
    }
    onDeleteStudySet(studySet.id);
  };

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-20 transition-opacity md:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className={`fixed top-0 left-0 h-full bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 p-6 flex flex-col w-80 z-30 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 md:hidden" aria-label="Close sidebar">
            <XIcon className="h-6 w-6" />
        </button>
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-green-100 dark:bg-green-900 p-2 rounded-lg">
            <BookOpenIcon className="h-6 w-6 text-green-600 dark:text-green-300" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Eco Tutor</h1>
        </div>

        <button
          onClick={onReset}
          className="flex items-center gap-3 w-full text-left p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 mb-6"
        >
          <HomeIcon className="h-5 w-5" />
          <span>Dashboard</span>
        </button>

        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">My Study Sets</h2>
        
        <div className="mb-4 relative group">
          <button
              onClick={onCreateNew}
              disabled={isDemoMode}
              className="w-full flex items-center justify-center gap-2 p-2 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 transition-colors disabled:cursor-not-allowed disabled:opacity-50 enabled:hover:border-green-500 enabled:hover:text-green-500"
          >
              <PlusCircleIcon className="h-5 w-5" />
              <span>Create New Study Set</span>
          </button>
          {isDemoMode && (
             <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 bg-gray-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                Backend connection required
            </div>
          )}
        </div>
        
        <div className="flex-1 space-y-2 overflow-y-auto pr-2 -mr-2">
          {studySets.map((studySet) => (
            <button
              key={studySet.id}
              onClick={() => onSelectStudySet(studySet)}
              className={`w-full text-left p-3 rounded-lg transition-colors duration-200 flex items-center justify-between group relative ${
                selectedStudySet?.id === studySet.id
                  ? 'bg-green-100 dark:bg-green-800 text-green-800 dark:text-white'
                  : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <div className="flex-1">
                <p className="font-semibold">{studySet.article_title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{studySet.article_author}</p>
              </div>
              {!selectedStudySet && (
                <button 
                  onClick={(e) => handleDelete(e, studySet)} 
                  className="p-1 rounded-full text-gray-400 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/50 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                  aria-label={`Delete ${studySet.article_title}`}
                >
                  <TrashIcon className="h-4 w-4"/>
                </button>
              )}
              <ChevronRightIcon className={`h-5 w-5 transition-transform duration-200 ${selectedStudySet ? '' : 'group-hover:translate-x-1'}`} />
            </button>
          ))}
        </div>

        {selectedStudySet ? (
          <div className="pt-6 border-t border-gray-200 dark:border-gray-700 mt-6">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Assignment Progress</h2>
            <ul className="space-y-3">
              {selectedStudySet.assignment.questions.map((question, index) => (
                <li key={index} className="flex items-start gap-3">
                  <DocumentTextIcon className="h-5 w-5 text-gray-400 dark:text-gray-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-700 dark:text-gray-300">{question}</p>
                </li>
              ))}
            </ul>
          </div>
        ) : (
            <div className="pt-6 border-t border-gray-200 dark:border-gray-700 mt-auto">
                <div className="text-sm text-gray-700 dark:text-gray-300 mb-2 truncate">
                    Signed in as <span className="font-semibold">{profile?.full_name}</span>
                </div>
                <button onClick={signOut} disabled={isDemoMode} className="w-full flex items-center justify-center gap-2 p-2 rounded-lg text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    <LogoutIcon className="h-5 w-5" />
                    <span>Sign Out</span>
                </button>
            </div>
        )}
      </aside>
    </>
  );
};