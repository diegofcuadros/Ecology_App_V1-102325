
import React, { useState, useRef, useEffect } from 'react';
import type { Message } from '../types';
import { Sender } from '../types';
import { UserIcon, SparklesIcon, PaperAirplaneIcon, LinkIcon } from './Icons';

interface ChatWindowProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  articleTitle: string;
}

const ChatMessage: React.FC<{ message: Message }> = ({ message }) => {
    const isUser = message.sender === Sender.User;
    // A simple markdown-to-html renderer for bold text
    const renderText = (text: string) => {
        const parts = text.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i}>{part.slice(2, -2)}</strong>;
            }
            return part;
        });
    };

    return (
        <div className={`flex items-start gap-4 ${isUser ? 'justify-end' : ''}`}>
            {!isUser && (
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                    <SparklesIcon className="h-6 w-6 text-green-600 dark:text-green-300" />
                </div>
            )}
            <div className={`max-w-lg p-4 rounded-2xl ${isUser ? 'bg-blue-500 text-white rounded-br-none' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'}`}>
                <div className="text-sm leading-relaxed prose prose-gray dark:prose-invert max-w-none">{renderText(message.text)}</div>
                {message.sources && message.sources.length > 0 && (
                <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
                  <h4 className="text-xs font-semibold mb-2 text-gray-600 dark:text-gray-400">Sources:</h4>
                  <ul className="space-y-1">
                    {message.sources.map((source, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <LinkIcon className="h-3 w-3 flex-shrink-0 text-gray-400" />
                        <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-xs text-green-600 dark:text-green-400 truncate hover:underline" title={source.title}>
                          {source.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
             {isUser && (
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                    <UserIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                </div>
            )}
        </div>
    );
};

export const ChatWindow: React.FC<ChatWindowProps> = ({ messages, onSendMessage, isLoading, articleTitle }) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() && !isLoading) {
      onSendMessage(inputText);
      setInputText('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      <header className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold truncate text-gray-900 dark:text-white">{articleTitle}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">AI-Assisted Discussion</p>
      </header>
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg, index) => (
          <ChatMessage key={index} message={msg} />
        ))}
        {isLoading && (
          <div className="flex items-start gap-4">
             <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <SparklesIcon className="h-6 w-6 text-green-600 dark:text-green-300" />
            </div>
            <div className="max-w-lg p-4 rounded-2xl bg-gray-100 dark:bg-gray-700 rounded-bl-none">
              <div className="flex items-center space-x-2">
                <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <form onSubmit={handleSubmit} className="flex items-center gap-4">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask a question or share your thoughts..."
            className="flex-1 w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:text-white"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !inputText.trim()}
            className="p-3 bg-green-500 text-white rounded-full hover:bg-green-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
};