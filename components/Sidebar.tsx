
import React, { useRef } from 'react';
import type { Article, LearningStage } from '../types';
import { STAGE_DESCRIPTIONS } from '../constants';
import { BookOpenIcon, ChevronRightIcon, CheckCircleIcon, HomeIcon, UploadIcon, AlertTriangleIcon } from './Icons';

interface SidebarProps {
  articles: Article[];
  selectedArticle: Article | null;
  onSelectArticle: (article: Article) => void;
  currentStage: LearningStage;
  onReset: () => void;
  onFileUpload: (file: File) => void;
  isUploading: boolean;
  uploadError: string | null;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  articles, 
  selectedArticle, 
  onSelectArticle, 
  currentStage, 
  onReset,
  onFileUpload,
  isUploading,
  uploadError
}) => {
  const stages: LearningStage[] = ['Comprehension', 'Evidence', 'Analysis', 'Advanced'];
  const currentStageIndex = stages.indexOf(currentStage);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
     // Reset the input value to allow uploading the same file again
    if(event.target) {
      event.target.value = '';
    }
  };

  return (
    <aside className="w-80 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 p-6 flex flex-col hidden md:flex">
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
        <span>Home / Select Article</span>
      </button>

      <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Course Articles</h2>
      
      <div className="mb-4">
        <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf"
            disabled={isUploading || !!selectedArticle}
        />
        <button
            onClick={handleUploadClick}
            disabled={isUploading || !!selectedArticle}
            className="w-full flex items-center justify-center gap-2 p-2 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-green-500 hover:text-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {isUploading ? (
                <>
                    <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing...</span>
                </>
            ) : (
                <>
                    <UploadIcon className="h-5 w-5" />
                    <span>Upload Article (.pdf)</span>
                </>
            )}
        </button>
        {uploadError && (
            <div className="mt-2 flex items-start gap-2 text-xs text-red-600 dark:text-red-400">
                <AlertTriangleIcon className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <p>{uploadError}</p>
            </div>
        )}
      </div>
      
      <div className="flex-1 space-y-2 overflow-y-auto">
        {articles.map((article) => (
          <button
            key={article.id}
            onClick={() => onSelectArticle(article)}
            disabled={!!selectedArticle}
            className={`w-full text-left p-3 rounded-lg transition-colors duration-200 flex items-center justify-between group ${
              article.id.startsWith('uploaded-') ? 'border-l-4 border-green-500' : ''
            } ${
              selectedArticle?.id === article.id
                ? 'bg-green-100 dark:bg-green-800 text-green-800 dark:text-white'
                : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
          >
            <div>
              <p className="font-semibold">{article.title}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{article.author} ({article.year})</p>
            </div>
            <ChevronRightIcon className={`h-5 w-5 transition-transform duration-200 ${selectedArticle ? '' : 'group-hover:translate-x-1'}`} />
          </button>
        ))}
      </div>

      {selectedArticle && (
        <div>
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 mt-8">Your Progress</h2>
          <ul className="space-y-3">
            {stages.map((stage, index) => (
              <li key={stage} className="flex items-center gap-3">
                <div className={`h-6 w-6 rounded-full flex items-center justify-center ${index <= currentStageIndex ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                  {index < currentStageIndex ? (
                     <CheckCircleIcon className="h-4 w-4 text-white" />
                  ) : (
                    <span className={`h-2 w-2 rounded-full ${index === currentStageIndex ? 'bg-white' : 'bg-gray-400 dark:bg-gray-500'}`}></span>
                  )}
                </div>
                <div>
                    <p className={`font-medium ${index <= currentStageIndex ? 'text-gray-800 dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}>
                        {STAGE_DESCRIPTIONS[stage].title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        {STAGE_DESCRIPTIONS[stage].description}
                    </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
};