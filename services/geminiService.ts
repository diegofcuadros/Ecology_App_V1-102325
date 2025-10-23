
import { GoogleGenAI, Chat, Type } from "@google/genai";
import type { Article, LearningStage } from '../types';
import { SYSTEM_PROMPT, STAGE_PROMPTS } from '../constants';

// Basic check for API key. In a real app, this might be more robust.
if (!process.env.API_KEY) {
  // This will appear in the browser console if the key is missing.
  console.error("API_KEY environment variable not set. Please ensure it is configured.");
}

// Initialize the AI client. The exclamation mark asserts that the API_KEY is present.
// A UI-level check should prevent the app from running without it.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

/**
 * Creates and initializes a new chat session with the Gemini model.
 * The system instruction includes the full article content and enables Google Search.
 * @param article - The article to be discussed in the chat.
 * @returns An initialized Chat instance.
 */
export function startChatSession(article: Article): Chat {
  const model = 'gemini-2.5-flash';
  
  const chat = ai.chats.create({
    model: model,
    config: {
      systemInstruction: `
        ${SYSTEM_PROMPT}

        You are about to begin a dialogue on the following article. This is the primary context for the conversation.

        --- ARTICLE START ---
        Title: "${article.title}"
        Author: ${article.author} (${article.year})
        Learning Objectives: ${article.learningObjectives.join('; ')}
        Key Concepts: ${article.keyConcepts.join(', ')}

        ${article.content}
        --- ARTICLE END ---
      `,
      tools: [{googleSearch: {}}],
    },
  });
  return chat;
}

/**
 * Sends a message to the Gemini model within an existing chat session.
 * @param chat - The active Chat instance.
 * @param message - The user's message text.
 * @param stage - The current learning stage to guide the AI's response.
 * @returns The AI's response text and any web sources it used.
 */
export async function sendMessage(
  chat: Chat,
  message: string,
  stage: LearningStage
): Promise<{ text: string; sources: any[] | undefined }> {
  const contextualPrompt = `
    [INTERNAL CONTEXT FOR AI TUTOR - DO NOT REVEAL TO STUDENT]
    Student's message: "${message}"
    Current Learning Stage: ${stage}.
    Instruction: Based on the student's message, formulate your next response according to the principles of your persona and the "${stage}" stage: ${STAGE_PROMPTS[stage]}
    [END INTERNAL CONTEXT]
  `;

  try {
    const result = await chat.sendMessage({ message: contextualPrompt });
    // Extract sources if the model used Google Search
    const sources = result.candidates?.[0]?.groundingMetadata?.groundingChunks;
    return { text: result.text, sources };
  } catch (error) {
    console.error("Gemini API error:", error);
    return {
      text: "I seem to be having trouble connecting to my knowledge base. Could you please rephrase or try again in a moment?",
      sources: undefined
    };
  }
}

/**
 * Processes the raw text of an uploaded article to extract metadata using the Gemini model.
 * @param text The raw text content of the article.
 * @returns A promise that resolves to the extracted article metadata.
 */
export async function processUploadedArticle(text: string): Promise<Omit<Article, 'id' | 'content'>> {
  const model = 'gemini-2.5-flash';
  
  const prompt = `
    You are a research assistant. Analyze the following academic article text and extract the required metadata.
    Provide the response in JSON format according to the provided schema.

    - The title should be the main title of the paper.
    - The author should be the primary author's last name followed by initials, if available (e.g., "Fahrig, L.").
    - The year should be the year of publication as a number.
    - The learningObjectives should be an array of 3-4 key takeaways a student should get from this article.
    - The keyConcepts should be an array of 5-7 important terms or ideas from the article.

    Article Text (first 8000 characters):
    ---
    ${text.substring(0, 8000)} 
    ---
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "The main title of the paper." },
            author: { type: Type.STRING, description: "The primary author, formatted as Lastname, F." },
            year: { type: Type.NUMBER, description: "The 4-digit year of publication." },
            learningObjectives: {
              type: Type.ARRAY,
              description: "An array of 3-4 string objectives.",
              items: { type: Type.STRING }
            },
            keyConcepts: {
              type: Type.ARRAY,
              description: "An array of 5-7 string key concepts.",
              items: { type: Type.STRING }
            }
          },
          required: ['title', 'author', 'year', 'learningObjectives', 'keyConcepts']
        }
      }
    });

    const metadata = JSON.parse(response.text);
    return metadata;

  } catch (error) {
    console.error("Error processing uploaded article with Gemini:", error);
    throw new Error("Failed to analyze the article. Please ensure it's a valid text file and try again.");
  }
}