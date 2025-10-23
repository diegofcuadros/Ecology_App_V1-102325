import React from 'react';
import AuthForm from '../components/AuthForm';
import { BookOpenIcon } from '../components/Icons';

const AuthPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center items-center p-4">
      <div className="text-center mb-8">
        <div className="inline-block bg-green-100 dark:bg-green-900 p-4 rounded-full mb-4">
          <BookOpenIcon className="h-12 w-12 text-green-600 dark:text-green-300" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Welcome to Eco Tutor</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
          Your AI-powered guide for landscape ecology assignments.
        </p>
      </div>
      <div className="w-full max-w-md">
        <AuthForm />
      </div>
    </div>
  );
};

export default AuthPage;