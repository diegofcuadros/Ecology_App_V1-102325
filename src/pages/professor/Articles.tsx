import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { articleAPI } from '../../services/api';
import { Article } from '../../../shared/types';
import { ArrowLeftIcon, PlusIcon, BookOpenIcon } from '../../components/Icons';

export const ArticlesPage: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    try {
      setIsLoading(true);
      const data = await articleAPI.getAll();
      setArticles(data);
    } catch (err: any) {
      setError('Failed to load articles');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSuccess = () => {
    setShowCreateForm(false);
    loadArticles();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/professor/dashboard')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <ArrowLeftIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Article Library</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Manage articles for assignments</p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg"
            >
              <PlusIcon className="h-5 w-5" />
              Add Article
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

        {showCreateForm && (
          <CreateArticleForm
            onSuccess={handleCreateSuccess}
            onCancel={() => setShowCreateForm(false)}
          />
        )}

        {articles.length === 0 && !showCreateForm ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
            <BookOpenIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No articles yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Add your first article to create assignments.</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg"
            >
              Add Article
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

const ArticleCard: React.FC<{ article: Article }> = ({ article }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {article.title}
      </h3>
      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
        {article.author && <span>{article.author}</span>}
        {article.year && <span>({article.year})</span>}
      </div>
      <div className="mb-3">
        <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
          {article.content.substring(0, 300)}...
        </p>
      </div>
      {article.keyConcepts && article.keyConcepts.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {(article.keyConcepts as string[]).slice(0, 5).map((concept, idx) => (
            <span
              key={idx}
              className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded-full"
            >
              {concept}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

const CreateArticleForm: React.FC<{
  onSuccess: () => void;
  onCancel: () => void;
}> = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    year: '',
    content: '',
    learningObjectives: '',
    keyConcepts: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const learningObjectivesArray = formData.learningObjectives
        .split('\n')
        .map(s => s.trim())
        .filter(Boolean);

      const keyConceptsArray = formData.keyConcepts
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      await articleAPI.create({
        title: formData.title,
        author: formData.author || undefined,
        year: formData.year ? parseInt(formData.year) : undefined,
        content: formData.content,
        learningObjectives: learningObjectivesArray,
        keyConcepts: keyConceptsArray,
      });

      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create article');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-2 border-green-500">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Add New Article</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Title *
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
            placeholder="e.g., Habitat Fragmentation and Landscape Connectivity"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Author
            </label>
            <input
              type="text"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
              placeholder="e.g., Fahrig, L."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Year
            </label>
            <input
              type="number"
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
              placeholder="e.g., 2003"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Article Content *
          </label>
          <textarea
            required
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            rows={10}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
            placeholder="Paste the full article text here..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Learning Objectives (one per line)
          </label>
          <textarea
            value={formData.learningObjectives}
            onChange={(e) => setFormData({ ...formData, learningObjectives: e.target.value })}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
            placeholder="Define habitat fragmentation&#10;Explain the difference between structural and functional connectivity"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Key Concepts (comma-separated)
          </label>
          <input
            type="text"
            value={formData.keyConcepts}
            onChange={(e) => setFormData({ ...formData, keyConcepts: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
            placeholder="Habitat loss, Patch size, Edge effects, Corridors"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium rounded-lg"
          >
            {isSubmitting ? 'Creating...' : 'Create Article'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium rounded-lg"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};
