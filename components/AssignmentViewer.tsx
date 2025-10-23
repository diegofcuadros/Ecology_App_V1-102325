
import React from 'react';
import type { Assignment } from '../types';
import { LightBulbIcon } from './Icons';

interface AssignmentViewerProps {
  assignment: Assignment;
}

export const AssignmentViewer: React.FC<AssignmentViewerProps> = ({ assignment }) => {
  return (
    <div className="bg-white dark:bg-gray-800 h-full overflow-y-auto p-8 border-l border-gray-200 dark:border-gray-700">
      <div className="max-w-prose mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Reading Assignment</h2>
        
        <div className="mb-8 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-3 flex items-center gap-2">
                <LightBulbIcon className="h-4 w-4 text-yellow-500" />
                Assignment Questions
            </h3>
            <ul className="space-y-3 list-decimal list-inside">
                {assignment.questions.map((question, i) => (
                    <li key={i} className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        {question}
                    </li>
                ))}
            </ul>
        </div>

        <article className="prose prose-gray dark:prose-invert max-w-none">
          <h3 className="font-bold text-lg mb-2 mt-4">Full Assignment Text</h3>
          {assignment.content.split('\n').map((paragraph, index) => (
            <p key={index}>{paragraph.trim()}</p>
          ))}
        </article>
      </div>
    </div>
  );
};
