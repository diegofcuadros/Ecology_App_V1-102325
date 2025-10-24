export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'student' | 'professor';
}

export interface Article {
  id: string;
  title: string;
  author: string;
  year: number;
  content: string;
  learningObjectives: string[];
  keyConcepts: string[];
}

export interface Assignment {
  id: string;
  professorId: string;
  articleId: string;
  article?: Article;
  title: string;
  description: string;
  dueDate: Date | null;
  gradingRubric: GradingRubric | null;
  chatSessions?: ChatSession[];
}

export interface GradingRubric {
  criteria: RubricCriterion[];
}

export interface RubricCriterion {
  name: string;
  maxPoints: number;
  description: string;
}

export interface ChatSession {
  id: string;
  studentId: string;
  student?: User;
  assignmentId: string;
  assignment?: Assignment;
  currentStage: LearningStage;
  userMessageCount: number;
  startedAt: Date;
  lastActivityAt: Date;
  messages?: Message[];
  grade?: Grade;
}

export interface Message {
  id: string;
  chatSessionId: string;
  sender: 'user' | 'ai';
  text: string;
  sources?: Source[];
  messageOrder: number;
  createdAt: Date;
}

export interface Source {
  uri: string;
  title: string;
}

export interface Grade {
  id: string;
  chatSessionId: string;
  professorId: string;
  rubricScores: RubricScore[] | null;
  overallScore: number | null;
  feedback: string | null;
  gradedAt: Date;
}

export interface RubricScore {
  criterion: string;
  score: number;
  maxPoints: number;
}

export type LearningStage = 'Comprehension' | 'Evidence' | 'Analysis' | 'Advanced';

// API Response types
export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiError {
  message: string;
  errors?: string[];
}
