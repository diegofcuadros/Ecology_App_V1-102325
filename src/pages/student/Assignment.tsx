import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { chatAPI } from '../../services/api';
import { ChatSession, Message } from '../../../shared/types';
import { ArrowLeftIcon, PaperAirplaneIcon } from '../../components/Icons';

export const AssignmentPage: React.FC = () => {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [chatSession, setChatSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    loadChatSession();
  }, [assignmentId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChatSession = async () => {
    try {
      setIsLoading(true);
      const session = await chatAPI.getOrCreateChatSession(assignmentId!);
      setChatSession(session);
      setMessages(session.messages || []);
    } catch (err: any) {
      setError('Failed to load assignment');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSending || !chatSession) return;

    const messageText = inputText.trim();
    setInputText('');
    setIsSending(true);
    setError('');

    try {
      const response = await chatAPI.sendMessage(chatSession.id, messageText);

      // Add both user and AI messages to the list
      setMessages(prev => [...prev, response.userMessage, response.aiMessage]);

      // Update current stage if it changed
      if (response.newStage !== chatSession.currentStage) {
        setChatSession(prev => prev ? { ...prev, currentStage: response.newStage } : null);
      }
    } catch (err: any) {
      setError('Failed to send message. Please try again.');
      console.error(err);
      // Restore the input text on error
      setInputText(messageText);
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const getStageColor = (stage: string) => {
    const colors = {
      Comprehension: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      Evidence: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      Analysis: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      Advanced: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    };
    return colors[stage as keyof typeof colors] || colors.Comprehension;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!chatSession) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">Assignment not found</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <ArrowLeftIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              {chatSession.assignment.title}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {chatSession.assignment.article.title}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStageColor(chatSession.currentStage)}`}>
            {chatSession.currentStage}
          </span>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          {isSending && (
            <div className="flex items-start gap-3">
              <div className="bg-gray-200 dark:bg-gray-700 rounded-lg px-4 py-3 max-w-2xl">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          {error && (
            <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <textarea
              ref={inputRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type your message... (Shift+Enter for new line)"
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
              rows={2}
              disabled={isSending}
            />
            <button
              type="submit"
              disabled={isSending || !inputText.trim()}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium flex items-center gap-2"
            >
              <PaperAirplaneIcon className="h-5 w-5" />
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
  const isUser = message.sender === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-2xl ${isUser ? 'bg-green-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'} rounded-lg px-4 py-3`}>
        <div className="whitespace-pre-wrap break-words">{message.text}</div>
        {message.sources && message.sources.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-300 dark:border-gray-600">
            <p className="text-xs font-semibold mb-2">Sources:</p>
            <ul className="space-y-1">
              {message.sources.map((source: any, idx: number) => (
                <li key={idx} className="text-xs">
                  <a
                    href={source.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    {source.title || source.uri}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className={`text-xs mt-2 ${isUser ? 'text-green-200' : 'text-gray-500 dark:text-gray-400'}`}>
          {new Date(message.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};
