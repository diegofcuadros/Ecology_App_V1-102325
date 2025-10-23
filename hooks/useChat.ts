
import { useState, useCallback, useRef, useEffect } from 'react';
import { startChatSession, sendMessage } from '../services/geminiService';
import type { Article, Message, LearningStage, Source } from '../types';
import { Sender } from '../types';
import { STAGE_DESCRIPTIONS } from '../constants';
import type { Chat } from '@google/genai';

/**
 * A custom hook to manage the entire state and logic of the chat application.
 * This includes handling article selection, sending messages, and progressing through learning stages.
 */
export function useChat() {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentStage, setCurrentStage] = useState<LearningStage>('Comprehension');
  const [userMessageCount, setUserMessageCount] = useState(0);

  const chatRef = useRef<Chat | null>(null);

  /**
   * Initializes a new chat session when an article is selected.
   */
  const handleSelectArticle = useCallback((article: Article) => {
    setSelectedArticle(article);
    chatRef.current = startChatSession(article);
    setMessages([
      {
        sender: Sender.AI,
        text: `Hello! I'm Eco, your guide for discussing "${article.title}". I'm here to help you explore the key concepts. What are your initial thoughts after reading the abstract?`,
      },
    ]);
    setUserMessageCount(0);
    setCurrentStage('Comprehension');
  }, []);

  /**
   * Resets the entire chat state to the initial welcome screen.
   */
  const resetChat = useCallback(() => {
    setSelectedArticle(null);
    setMessages([]);
    chatRef.current = null;
    setUserMessageCount(0);
    setCurrentStage('Comprehension');
  }, []);
  
  // Effect to automatically advance the learning stage after every 3 user messages.
  useEffect(() => {
    if (userMessageCount > 0 && userMessageCount % 3 === 0 && selectedArticle) {
      const stages: LearningStage[] = ['Comprehension', 'Evidence', 'Analysis', 'Advanced'];
      const currentIndex = stages.indexOf(currentStage);
      
      if (currentIndex < stages.length - 1) {
        const nextStage = stages[currentIndex + 1];
        setCurrentStage(nextStage);
        setMessages(prev => [
          ...prev, 
          {
            sender: Sender.AI,
            text: `Great progress! Let's move to the next stage: **${STAGE_DESCRIPTIONS[nextStage].title}**. ${STAGE_DESCRIPTIONS[nextStage].prompt}`
          }
        ]);
      }
    }
  }, [userMessageCount, currentStage, selectedArticle]);

  /**
   * Handles sending a user message to the backend and updating the chat history.
   */
  const handleSendMessage = useCallback(async (text: string) => {
    if (!selectedArticle || !chatRef.current) return;

    const userMessage: Message = { sender: Sender.User, text };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    try {
      setUserMessageCount(prev => prev + 1);
      const { text: aiResponse, sources } = await sendMessage(chatRef.current, text, currentStage);
      
      const aiMessage: Message = {
        sender: Sender.AI,
        text: aiResponse,
        // Map the raw grounding chunks to the simplified Source type for the UI
        sources: sources?.map(chunk => chunk.web).filter(Boolean)
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        sender: Sender.AI,
        text: 'Sorry, I encountered an error. Please try again.',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedArticle, currentStage]);

  return {
    selectedArticle,
    messages,
    isLoading,
    currentStage,
    handleSelectArticle,
    handleSendMessage,
    resetChat,
  };
}