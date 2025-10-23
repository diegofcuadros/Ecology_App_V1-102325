
import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { ArticleViewer } from './components/ArticleViewer';
import { ChatWindow } from './components/ChatWindow';
import { WelcomeScreen } from './components/WelcomeScreen';
import { useChat } from './hooks/useChat';
import { ARTICLES } from './constants';
import { processUploadedArticle } from './services/geminiService';
import type { Article } from './types';
import * as pdfjsLib from 'pdfjs-dist';

// Set the workerSrc for pdfjs-dist
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@4.4.168/build/pdf.worker.min.mjs`;


const App: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>(ARTICLES);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const {
    selectedArticle,
    messages,
    isLoading,
    currentStage,
    handleSelectArticle,
    handleSendMessage,
    resetChat,
  } = useChat();

  const handleFileUpload = async (file: File) => {
    if (!file || file.type !== 'application/pdf') {
        setUploadError('Please upload a valid .pdf file.');
        // Clear the error after a few seconds
        setTimeout(() => setUploadError(null), 5000);
        return;
    }
    setIsUploading(true);
    setUploadError(null);

    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => ('str' in item ? item.str : '')).join(' ');
            fullText += pageText + '\n\n';
        }

        // Use Gemini to process the text and get structured metadata
        const metadata = await processUploadedArticle(fullText);
        
        const newArticle: Article = {
            id: `uploaded-${Date.now()}`,
            content: fullText,
            ...metadata
        };
        
        // Add the new article to the top of the list and select it
        setArticles(prev => [newArticle, ...prev]);
        handleSelectArticle(newArticle);

    } catch (error) {
        console.error("PDF parsing or API error:", error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred while processing the PDF.';
        setUploadError(errorMessage);
        // Clear the error after a few seconds
        setTimeout(() => setUploadError(null), 5000);
    } finally {
        setIsUploading(false);
    }
  };


  return (
    <div className="flex h-screen font-sans text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800">
      <Sidebar 
        articles={articles} 
        selectedArticle={selectedArticle} 
        onSelectArticle={handleSelectArticle}
        currentStage={currentStage}
        onReset={resetChat}
        onFileUpload={handleFileUpload}
        isUploading={isUploading}
        uploadError={uploadError}
      />
      <main className="flex-1 flex flex-col h-screen">
        {selectedArticle ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 flex-1 overflow-hidden">
            <ChatWindow
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              articleTitle={selectedArticle.title}
            />
            <ArticleViewer article={selectedArticle} />
          </div>
        ) : (
          <WelcomeScreen />
        )}
      </main>
    </div>
  );
};

export default App;