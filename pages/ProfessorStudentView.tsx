import React, { useState, useEffect } from 'react';
import { getStudySetsForUser, getMessagesForStudySet } from '../services/supabaseService';
import type { UserProfile, StudySet, Message } from '../types';
import { Sender } from '../types';
import { ArrowLeftIcon, BookOpenIcon, ChevronRightIcon, SparklesIcon, UserIcon } from '../components/Icons';

const ReadOnlyChatViewer: React.FC<{ messages: Message[], articleTitle: string }> = ({ messages, articleTitle }) => {
    return (
        <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700">
            <header className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                <h2 className="text-lg font-semibold truncate text-gray-900 dark:text-white">{articleTitle}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Chat Transcript</p>
            </header>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex items-start gap-4 ${msg.sender === Sender.User ? 'justify-end' : ''}`}>
                        {msg.sender === Sender.AI && <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center"><SparklesIcon className="h-6 w-6 text-green-600 dark:text-green-300" /></div>}
                        <div className={`max-w-xl p-4 rounded-2xl ${msg.sender === Sender.User ? 'bg-blue-500 text-white rounded-br-none' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'}`}>
                            <p className="text-sm leading-relaxed">{msg.text}</p>
                        </div>
                        {msg.sender === Sender.User && <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center"><UserIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" /></div>}
                    </div>
                ))}
            </div>
        </div>
    );
};

interface ProfessorStudentViewProps {
  student: UserProfile;
  onBack: () => void;
}

const ProfessorStudentView: React.FC<ProfessorStudentViewProps> = ({ student, onBack }) => {
  const [studySets, setStudySets] = useState<StudySet[]>([]);
  const [selectedStudySet, setSelectedStudySet] = useState<StudySet | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStudySetsForUser(student.id).then(data => {
      setStudySets(data);
      setLoading(false);
    });
  }, [student.id]);

  const handleSelectStudySet = async (studySet: StudySet) => {
    setSelectedStudySet(studySet);
    const messageData = await getMessagesForStudySet(studySet.id);
    setMessages(messageData);
  };

  return (
    <div className="min-h-screen flex bg-gray-100 dark:bg-gray-900">
        <aside className="w-1/3 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-6 flex flex-col">
            <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white mb-6">
                <ArrowLeftIcon className="h-4 w-4" />
                Back to Roster
            </button>
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{student.full_name}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Study Sets</p>
            </div>
            <div className="flex-1 space-y-2 overflow-y-auto">
                {loading && <p>Loading sets...</p>}
                {!loading && studySets.length === 0 && <p className="text-gray-500">No study sets created yet.</p>}
                {studySets.map(set => (
                    <button
                        key={set.id}
                        onClick={() => handleSelectStudySet(set)}
                        className={`w-full text-left p-3 rounded-lg transition-colors flex justify-between items-center ${selectedStudySet?.id === set.id ? 'bg-green-100 dark:bg-green-800' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                    >
                        <div>
                            <p className="font-semibold">{set.article_title}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Created: {new Date(set.created_at).toLocaleDateString()}</p>
                        </div>
                        <ChevronRightIcon className="h-5 w-5 text-gray-400"/>
                    </button>
                ))}
            </div>
        </aside>
        <main className="flex-1">
            {selectedStudySet ? (
                <ReadOnlyChatViewer messages={messages} articleTitle={selectedStudySet.article_title} />
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                    <BookOpenIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4"/>
                    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Select a Study Set</h3>
                    <p className="text-gray-500">Choose a study set from the list to review the student's chat transcript.</p>
                </div>
            )}
        </main>
    </div>
  );
};

export default ProfessorStudentView;