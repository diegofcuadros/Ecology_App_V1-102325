import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { AlertTriangleIcon } from './Icons';

const AuthForm: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!supabase) {
        setError("Authentication is not available. The application is running in demo mode.");
        return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isSignUp) {
        // Sign Up
        const { data: { user }, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              // Note: role is assigned via a database trigger for security
            },
          },
        });
        if (signUpError) throw signUpError;
        if (user) setMessage('Success! Please check your email for a verification link.');

      } else {
        // Sign In
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        // The onAuthStateChange listener in AuthContext will handle navigation
      }
    } catch (err: any) {
      setError(err.error_description || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
      <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
        {isSignUp ? 'Create Account' : 'Sign In'}
      </h2>
      <p className="text-center text-gray-500 dark:text-gray-400 mb-6">
        {isSignUp ? 'to start your learning journey' : 'to access your dashboard'}
      </p>

      {error && (
        <div className="mb-4 flex items-start gap-2 text-sm text-red-600 dark:text-red-400 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <AlertTriangleIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}
      {message && (
        <div className="mb-4 text-sm text-center text-green-700 dark:text-green-300 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          {message}
        </div>
      )}

      {!message && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="full-name">Full Name</label>
                    <input
                        id="full-name"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        className="mt-1 block w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:text-white"
                        placeholder="Your Name"
                    />
                </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 block w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:text-white"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="mt-1 block w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:text-white"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 dark:disabled:bg-gray-600 transition-colors"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              ) : (isSignUp ? 'Sign Up' : 'Sign In')}
            </button>
          </form>
      )}

      <div className="mt-6 text-center">
        <button
          onClick={() => {
            setIsSignUp(!isSignUp);
            setError(null);
            setMessage(null);
          }}
          className="text-sm text-green-600 hover:text-green-500 dark:text-green-400 dark:hover:text-green-300 font-medium"
        >
          {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
        </button>
      </div>
    </div>
  );
};

export default AuthForm;