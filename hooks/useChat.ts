import { useState, useCallback, useEffect } from 'react';
import { getMessagesForStudySet, addMessage, getAiResponse } from '../services/supabaseService';
import type { Message, StudySet } from '../types';
import { Sender } from '../types';

export function useChat(studySet: StudySet | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!studySet) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const initialMessages = await getMessagesForStudySet(studySet.id);
        
        if (initialMessages.length === 0) {
          // If no history, create the initial AI welcome message
          const firstQuestion = studySet.assignment.questions[0] || "the first topic in your assignment";
          const aiWelcomeMessage: Omit<Message, 'id' | 'created_at'> = {
            study_set_id: studySet.id,
            sender: Sender.AI,
            text: `Hello! I see you're ready to work on the assignment for "${studySet.article_title}".\n\nLet's start with the first question: **"${firstQuestion}"**\n\nWhere in the article do you think we should look to start answering this?`,
          };
          const savedMessage = await addMessage(aiWelcomeMessage);
          setMessages([savedMessage]);
        } else {
          setMessages(initialMessages);
        }
      } catch (err) {
        console.error("Error fetching messages:", err);
        setError("Could not load chat history. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [studySet]);

  const handleSendMessage = useCallback(async (text: string) => {
    if (!studySet) return;

    setIsLoading(true);
    setError(null);

    // 1. Add user message to state and DB
    const userMessageData: Omit<Message, 'id' | 'created_at'> = {
      study_set_id: studySet.id,
      sender: Sender.User,
      text,
    };
    // Optimistically update UI
    setMessages(prev => [...prev, { ...userMessageData, id: `temp-${Date.now()}` }]);
    const savedUserMessage = await addMessage(userMessageData);
    // Replace temp message with real one from DB
    setMessages(prev => prev.map(m => m.id === `temp-${Date.now()}` ? savedUserMessage : m));


    // 2. Get AI response from secure Edge Function
    try {
        const currentHistory = [...messages, savedUserMessage];
        const { text: aiResponse, sources } = await getAiResponse(studySet, currentHistory);

        // 3. Add AI message to state and DB
        const aiMessageData: Omit<Message, 'id' | 'created_at'> = {
            study_set_id: studySet.id,
            sender: Sender.AI,
            text: aiResponse,
            sources: sources?.map(chunk => chunk.web).filter(Boolean),
        };
        const savedAiMessage = await addMessage(aiMessageData);
        setMessages(prev => [...prev, savedAiMessage]);

    } catch (err) {
      console.error('Error getting AI response:', err);
      const errorMessage: Message = {
        study_set_id: studySet.id,
        sender: Sender.AI,
        text: 'Sorry, I encountered an error. Please try again.',
      };
      setMessages(prev => [...prev, errorMessage]);
      setError("Failed to get a response from the AI assistant.");
    } finally {
      setIsLoading(false);
    }
  }, [studySet, messages]);

  return {
    messages,
    isLoading,
    error,
    handleSendMessage,
  };
}