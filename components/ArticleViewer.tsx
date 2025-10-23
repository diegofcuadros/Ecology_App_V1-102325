import React, { useState } from 'react';
import type { StudySet, Article, Assignment } from '../types';
import { TagIcon, CheckIcon, BookOpenIcon, DocumentTextIcon, LightBulbIcon } from './Icons';

const ArticleContent: React.FC<{ article: Article }> = ({ article }) => {
  const [isAbstractExpanded, setIsAbstractExpanded] = useState(false);

  // Separate abstract from the rest of the content
  const contentParagraphs = article.content.trim().split('\n\n');
  const abstractParagraph = contentParagraphs.find(p => p.trim().startsWith('Abstract:')) || '';
  const otherParagraphs = contentParagraphs.filter(p => !p.trim().startsWith('Abstract:'));
  const abstractText = abstractParagraph.replace('Abstract:', '').trim();
  
  const TRUNCATION_LENGTH = 350;
  const isTruncated = abstractText.length > TRUNCATION_LENGTH;
  const truncatedAbstract = isTruncated ? `${abstractText.substring(0, TRUNCATION_LENGTH)}...` : abstractText;

  return (
    <>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{article.title}</h2>
      <p className="text-md text-gray-500 dark:text-gray-400 mb-6">{article.author} ({article.year})</p>
      
      <div className="mb-6 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
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
        {abstractParagraph && (
            <div>
              <h3 className="font-bold text-lg mb-2 mt-4">Abstract</h3>
              <p>
                {isAbstractExpanded ? abstractText : truncatedAbstract}
              </p>
              {isTruncated && (
                <button
                  onClick={() => setIsAbstractExpanded(!isAbstractExpanded)}
                  className="text-green-600 dark:text-green-400 font-semibold text-sm hover:underline mt-2"
                >
                  {isAbstractExpanded ? 'Show less' : 'Show more'}
                </button>
              )}
            </div>
        )}
        
        {otherParagraphs.map((paragraph, index) => {
          const trimmedParagraph = paragraph.trim();
          if (!trimmedParagraph) return null;
          
          if (trimmedParagraph.startsWith('Introduction:') || trimmedParagraph.startsWith('Methods:') || trimmedParagraph.startsWith('Results:') || trimmedParagraph.startsWith('Discussion:') || trimmedParagraph.startsWith('Conclusion:')) {
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
    </>
  );
};

const AssignmentContent: React.FC<{ assignment: Assignment }> = ({ assignment }) => (
    <>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Reading Assignment</h2>
        <div className="mb-8 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
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
            <p key={index} className="text-sm">{paragraph.trim()}</p>
          ))}
        </article>
    </>
);


type View = 'article' | 'assignment';

export const DocumentViewer: React.FC<{ studySet: StudySet }> = ({ studySet }) => {
  const [activeView, setActiveView] = useState<View>('article');

  const TabButton: React.FC<{view: View, label: string, icon: React.ReactNode}> = ({ view, label, icon }) => (
    <button
      onClick={() => setActiveView(view)}
      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${activeView === view ? 'border-green-500 text-green-600 dark:text-green-400' : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'}`}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <div className="bg-white dark:bg-gray-800 h-full flex flex-col overflow-hidden border-l border-gray-200 dark:border-gray-700">
      <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700">
        <nav className="flex">
          <TabButton view="article" label="Article" icon={<BookOpenIcon className="h-5 w-5"/>} />
          <TabButton view="assignment" label="Assignment" icon={<DocumentTextIcon className="h-5 w-5"/>} />
        </nav>
      </div>
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-prose mx-auto">
          {activeView === 'article' ? <ArticleContent article={studySet.article} /> : <AssignmentContent assignment={studySet.assignment} />}
        </div>
      </div>
    </div>
  );
};