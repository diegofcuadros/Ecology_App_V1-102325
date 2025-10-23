
export enum Sender {
  User = 'user',
  AI = 'ai',
}

export interface Source {
  uri: string;
  title: string;
}

export interface Message {
  sender: Sender;
  text: string;
  sources?: Source[];
}

export type LearningStage = 'Comprehension' | 'Evidence' | 'Analysis' | 'Advanced';

export interface Article {
  id: string;
  title: string;
  author: string;
  year: number;
  content: string;
  learningObjectives: string[];
  keyConcepts: string[];
}