import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import type { StudySet, Message, UserProfile } from '../types';
import { STUDY_SETS } from '../constants';

// NOTE: For this to work with a live backend, you need to set up Row Level Security (RLS) policies in your Supabase project.

/**
 * Fetches all study sets for a given user.
 * @param userId The ID of the user.
 * @returns A promise that resolves to an array of StudySets.
 */
export async function getStudySetsForUser(userId: string): Promise<StudySet[]> {
  if (!isSupabaseConfigured) {
    return Promise.resolve(STUDY_SETS);
  }

  const { data, error } = await supabase
    .from('study_sets')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching study sets:', error);
    throw error;
  }
  return data as StudySet[];
}

/**
 * Creates a new study set by uploading files and invoking a secure Edge Function.
 * @param userId The ID of the user creating the set.
 * @param articleFile The article PDF file.
 * @param assignmentFile The assignment PDF file.
 * @returns A promise that resolves to the newly created StudySet.
 */
export async function createStudySet(userId: string, articleFile: File, assignmentFile: File): Promise<StudySet> {
  if (!isSupabaseConfigured) {
    throw new Error("Creating new study sets is disabled in demo mode.");
  }

  // 1. Upload files to Supabase Storage
  const articlePath = `${userId}/${Date.now()}_${articleFile.name}`;
  const { error: articleError } = await supabase.storage
    .from('uploads')
    .upload(articlePath, articleFile);
  if (articleError) throw articleError;

  const assignmentPath = `${userId}/${Date.now()}_${assignmentFile.name}`;
  const { error: assignmentError } = await supabase.storage
    .from('uploads')
    .upload(assignmentPath, assignmentFile);
  if (assignmentError) throw assignmentError;

  // 2. Invoke Edge Function to process files and create the study set record
  const { data, error: functionError } = await supabase.functions.invoke('create-study-set', {
    body: { userId, articlePath, assignmentPath },
  });

  if (functionError) {
    console.error('Error invoking create-study-set function:', functionError);
    // Clean up uploaded files on failure
    await supabase.storage.from('uploads').remove([articlePath, assignmentPath]);
    throw functionError;
  }

  return data as StudySet;
}


/**
 * Deletes a study set and all associated data.
 * @param studySetId The ID of the study set to delete.
 */
export async function deleteStudySet(studySetId: string): Promise<void> {
    if (!isSupabaseConfigured) {
        console.log("Delete disabled in demo mode.");
        return Promise.resolve();
    }
    const { error } = await supabase
        .from('study_sets')
        .delete()
        .eq('id', studySetId);
    
    if (error) {
        console.error('Error deleting study set:', error);
        throw error;
    }
}


/**
 * Fetches all messages for a specific study set.
 * @param studySetId The ID of the study set.
 * @returns A promise that resolves to an array of Messages.
 */
export async function getMessagesForStudySet(studySetId: string): Promise<Message[]> {
  if (!isSupabaseConfigured) {
    return Promise.resolve([]);
  }

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('study_set_id', studySetId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
  return data as Message[];
}

/**
 * Adds a new message to the database.
 * @param message The message data to add.
 * @returns The newly saved message with its database ID.
 */
export async function addMessage(message: Omit<Message, 'id' | 'created_at'>): Promise<Message> {
  if (!isSupabaseConfigured) {
    // In demo mode, just return the message with a temporary ID
    return Promise.resolve({ ...message, id: `demo-${Date.now()}`, created_at: new Date().toISOString() });
  }

  const { data, error } = await supabase
    .from('messages')
    .insert([message])
    .select()
    .single();

  if (error) {
    console.error('Error adding message:', error);
    throw error;
  }
  return data as Message;
}


/**
 * Calls a secure Edge Function to get a response from the AI.
 * @param studySet The context for the conversation.
 * @param history The recent message history.
 * @returns The AI's response text and any sources.
 */
export async function getAiResponse(studySet: StudySet, history: Message[]): Promise<{ text: string; sources: any[] | undefined }> {
  if (!isSupabaseConfigured) {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
    return Promise.resolve({
      text: "This is a mock response from the AI assistant in demo mode. I'm designed to help you analyze the document and answer the assignment questions. What are your initial thoughts on the first question?",
      sources: undefined,
    });
  }
  
  const { data, error } = await supabase.functions.invoke('get-ai-response', {
    body: { studySet, history },
  });

  if (error) {
    console.error('Error invoking get-ai-response function:', error);
    throw error;
  }
  return data;
}

/**
 * Fetches all users with the 'student' role. (Professor only)
 * @returns A promise that resolves to an array of student profiles.
 */
export async function getStudents(): Promise<UserProfile[]> {
    if (!isSupabaseConfigured) {
        return Promise.resolve([
            { id: 'student-1', full_name: 'Alice Johnson', role: 'student' },
            { id: 'student-2', full_name: 'Bob Williams', role: 'student' },
        ]);
    }

    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'student');
    
    if (error) {
        console.error('Error fetching students:', error);
        throw error;
    }
    return data as UserProfile[];
}