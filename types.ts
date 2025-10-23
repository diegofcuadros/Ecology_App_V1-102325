import type { User } from '@supabase/supabase-js';

export enum Sender {
  User = 'user',
  AI = 'ai',
}

export interface Source {
  uri: string;
  title: string;
}

// Database-aligned message type
export interface Message {
  id?: string; // Optional because it's not present on new messages
  study_set_id: string;
  sender: Sender;
  text: string;
  sources?: Source[];
  created_at?: string;
}

// Database-aligned article metadata (stored as JSON in DB)
export interface Article {
  title: string;
  author: string;
  year: number;
  content: string; // The full text content
  learningObjectives: string[];
  keyConcepts: string[];
}

// Database-aligned assignment metadata (stored as JSON in DB)
export interface Assignment {
    content: string; // The full text content
    questions: string[];
}

// Database-aligned StudySet type
export interface StudySet {
    id: string; // UUID from database
    user_id: string;
    article_title: string;
    article_author: string;
    article: Article; // JSON blob
    assignment: Assignment; // JSON blob
    created_at: string;
}

// Supabase-specific types for user profiles
export type UserProfile = {
  id: string;
  full_name: string;
  role: 'student' | 'professor';
};

export type AppUser = User;