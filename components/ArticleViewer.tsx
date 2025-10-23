
import React from 'react';
import type { Article } from '../types';
import { TagIcon, CheckIcon } from './Icons';

interface ArticleViewerProps {
  article: Article;
}

export const ArticleViewer: React.FC<ArticleViewerProps> = ({ article }) => {
  return (
    <div className="bg-white dark:bg-gray-800 h-full overflow-y-auto p-8 border-l border-gray-200 dark:border-gray-700 hidden lg:block">
      <div className="max-w-prose mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{article.title}</h2>
        <p className="text-md text-gray-500 dark:text-gray-400 mb-6">{article.author} ({article.year})</p>
        
        <div className="mb-6 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-3">Learning Objectives</h3>
            <ul className="space-y-2">
                {article.learningObjectives.map((obj, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-400">
                        <CheckIcon className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0"/>
                        <span>{obj}</span>
                    </li>
                ))}
            </ul>
        </div>

        <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-3">Key Concepts</h3>
            <div className="flex flex-wrap gap-2">
                {article.keyConcepts.map(concept => (
                    <span key={concept} className="flex items-center gap-1.5 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 text-xs font-medium px-2 py-1 rounded-full">
                        <TagIcon className="h-3 w-3" />
                        {concept}
                    </span>
                ))}
            </div>
        </div>

        <article className="prose prose-gray dark:prose-invert max-w-none">
          {article.content.split('\n\n').map((paragraph, index) => {
            const trimmedParagraph = paragraph.trim();
            if (trimmedParagraph.startsWith('Abstract:') || trimmedParagraph.startsWith('Introduction:') || trimmedParagraph.startsWith('Methods:') || trimmedParagraph.startsWith('Results:') || trimmedParagraph.startsWith('Discussion:') || trimmedParagraph.startsWith('Conclusion:')) {
              const [heading, ...rest] = trimmedParagraph.split(':');
              return (
                <div key={index}>
                  <h3 className="font-bold text-lg mb-2 mt-4">{heading}</h3>
                  <p>{rest.join(':').trim()}</p>
                </div>
              );
            }
            return <p key={index}>{trimmedParagraph}</p>;
          })}
        </article>
      </div>
    </div>
  );
};
