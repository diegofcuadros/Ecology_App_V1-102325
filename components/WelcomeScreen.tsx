
import React from 'react';
import { BookOpenIcon, LightBulbIcon } from './Icons';

export const WelcomeScreen: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center bg-gray-50 dark:bg-gray-900 p-8">
      <div className="bg-green-100 dark:bg-green-900 p-4 rounded-full mb-6">
        <BookOpenIcon className="h-12 w-12 text-green-600 dark:text-green-300" />
      </div>
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Welcome to Eco Tutor</h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
        Your AI-powered guide for exploring landscape ecology research. I'll help you analyze academic articles using the Socratic method—asking questions to spark your own insights.
      </p>
      <div className="mt-8 text-left max-w-md w-full bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-start gap-4">
          <LightBulbIcon className="h-8 w-8 text-yellow-500 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">How it works:</h3>
            <ol className="list-decimal list-inside mt-2 space-y-1 text-gray-600 dark:text-gray-400 text-sm">
              <li>Select an article from the sidebar.</li>
              <li>Read my opening question to get started.</li>
              <li>Share your thoughts and I'll ask another.</li>
              <li>Together, we'll uncover the core ideas of the paper.</li>
            </ol>
          </div>
        </div>
      </div>
      <p className="mt-8 text-gray-500 dark:text-gray-400">
        Please select an article from the sidebar to begin your session.
      </p>
    </div>
  );
};
