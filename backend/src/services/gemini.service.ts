import { GoogleGenAI } from '@google/genai';
import { Message as PrismaMessage } from '@prisma/client';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

const SYSTEM_PROMPT = `
You are 'Eco', an AI Teaching Assistant for a university-level landscape ecology course.
Your purpose is to help students critically analyze academic research articles.

IMPORTANT: Your role is to teach students to think critically about AI, including YOU.
- Encourage students to question your responses
- Ask students to verify claims against the article
- Prompt students to identify potential limitations in your explanations
- Praise when students challenge or fact-check your responses

Your Core Persona:
1. **Socratic Method**: Ask questions before giving answers. Guide discovery.
2. **Encouraging & Patient**: Supportive tone, celebrate good questions.
3. **Context-Aware**: Base discussion on the provided article.
4. **Web-Enabled**: Use Google Search for real-world examples.
5. **Cite Sources**: Always cite when using web search.
6. **Interactive**: Check understanding, ask follow-ups.
`;

export async function sendMessageToGemini(
  article: any,
  previousMessages: PrismaMessage[],
  userMessage: string,
  currentStage: string
): Promise<{ text: string; sources?: any[] }> {
  const model = 'gemini-2.5-flash';

  // Build conversation history
  const conversationHistory = previousMessages.map(msg => ({
    role: msg.sender === 'user' ? 'user' : 'model',
    parts: [{ text: msg.text }],
  }));

  const stageGuidance = {
    Comprehension: "Focus on core arguments and key terms. Ask what the student understands.",
    Evidence: "Help locate key data. Ask students to cite specific evidence from the article.",
    Analysis: "Guide evaluation of methodology. Ask about strengths and weaknesses.",
    Advanced: "Connect to broader concepts. Use web search for real-world examples.",
  };

  const systemInstruction = `
    ${SYSTEM_PROMPT}

    Article Context:
    Title: "${article.title}"
    Author: ${article.author} (${article.year})

    ${article.content}

    Current Stage: ${currentStage}
    Guidance: ${stageGuidance[currentStage as keyof typeof stageGuidance]}
  `;

  try {
    const chat = ai.chats.create({
      model,
      config: {
        systemInstruction,
        tools: [{ googleSearch: {} }],
      },
    });

    // Send conversation history first
    for (const msg of conversationHistory) {
      await chat.sendMessage({ message: msg.parts[0].text });
    }

    // Send new message
    const result = await chat.sendMessage({ message: userMessage });
    const sources = result.candidates?.[0]?.groundingMetadata?.groundingChunks;

    return {
      text: result.text,
      sources: sources?.map(chunk => chunk.web).filter(Boolean)
    };
  } catch (error) {
    console.error('Gemini API error:', error);
    return {
      text: "I'm having trouble processing that. Could you rephrase?",
    };
  }
}

export async function processUploadedArticle(text: string): Promise<Omit<any, 'id' | 'content'>> {
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
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: 'object' as const,
          properties: {
            title: { type: 'string' as const, description: "The main title of the paper." },
            author: { type: 'string' as const, description: "The primary author, formatted as Lastname, F." },
            year: { type: 'number' as const, description: "The 4-digit year of publication." },
            learningObjectives: {
              type: 'array' as const,
              description: "An array of 3-4 string objectives.",
              items: { type: 'string' as const }
            },
            keyConcepts: {
              type: 'array' as const,
              description: "An array of 5-7 string key concepts.",
              items: { type: 'string' as const }
            }
          },
          required: ['title', 'author', 'year', 'learningObjectives', 'keyConcepts']
        }
      }
    });

    const metadata = JSON.parse(response.text);
    return metadata;

  } catch (error) {
    console.error('Error processing uploaded article with Gemini:', error);
    throw new Error('Failed to analyze the article. Please ensure it\'s a valid text file and try again.');
  }
}
