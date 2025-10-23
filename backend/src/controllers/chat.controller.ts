import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth';
import { sendMessageToGemini } from '../services/gemini.service';

const prisma = new PrismaClient();

const sendMessageSchema = z.object({
  chatSessionId: z.string().uuid(),
  text: z.string().min(1).max(5000),
});

export const getOrCreateChatSession = async (req: AuthRequest, res: Response) => {
  try {
    const { assignmentId } = req.params;
    const studentId = req.user!.id;

    // Find or create chat session
    let chatSession = await prisma.chatSession.findUnique({
      where: {
        studentId_assignmentId: {
          studentId,
          assignmentId,
        },
      },
      include: {
        messages: {
          orderBy: { messageOrder: 'asc' },
        },
        assignment: {
          include: {
            article: true,
          },
        },
        grade: true,
      },
    });

    if (!chatSession) {
      // Create new chat session
      const assignment = await prisma.assignment.findUnique({
        where: { id: assignmentId },
        include: { article: true },
      });

      if (!assignment) {
        return res.status(404).json({ message: 'Assignment not found' });
      }

      chatSession = await prisma.chatSession.create({
        data: {
          studentId,
          assignmentId,
          currentStage: 'Comprehension',
          userMessageCount: 0,
        },
        include: {
          messages: true,
          assignment: {
            include: { article: true },
          },
          grade: true,
        },
      });

      // Create initial AI greeting
      await prisma.message.create({
        data: {
          chatSessionId: chatSession.id,
          sender: 'ai',
          text: `Hello! I'm Eco, your guide for discussing "${assignment.article.title}". I'm here to help you explore the key concepts. What are your initial thoughts after reading the abstract?`,
          messageOrder: 0,
        },
      });
    }

    res.json(chatSession);
  } catch (error) {
    console.error('Get chat session error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const data = sendMessageSchema.parse(req.body);
    const studentId = req.user!.id;

    // Verify session belongs to student
    const chatSession = await prisma.chatSession.findUnique({
      where: { id: data.chatSessionId },
      include: {
        messages: {
          orderBy: { messageOrder: 'asc' },
        },
        assignment: {
          include: { article: true },
        },
      },
    });

    if (!chatSession) {
      return res.status(404).json({ message: 'Chat session not found' });
    }

    if (chatSession.studentId !== studentId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Save user message
    const messageOrder = chatSession.messages.length;
    const userMessage = await prisma.message.create({
      data: {
        chatSessionId: chatSession.id,
        sender: 'user',
        text: data.text,
        messageOrder,
      },
    });

    // Update session
    const newMessageCount = chatSession.userMessageCount + 1;
    let newStage = chatSession.currentStage;

    // Auto-advance stage every 3 messages
    const stages = ['Comprehension', 'Evidence', 'Analysis', 'Advanced'];
    const currentStageIndex = stages.indexOf(chatSession.currentStage);
    if (newMessageCount % 3 === 0 && currentStageIndex < stages.length - 1) {
      newStage = stages[currentStageIndex + 1];
    }

    await prisma.chatSession.update({
      where: { id: chatSession.id },
      data: {
        userMessageCount: newMessageCount,
        currentStage: newStage,
        lastActivityAt: new Date(),
      },
    });

    // Get AI response
    const { text: aiText, sources } = await sendMessageToGemini(
      chatSession.assignment.article,
      chatSession.messages,
      data.text,
      newStage
    );

    // Check if stage just advanced
    let finalAiText = aiText;
    if (newStage !== chatSession.currentStage) {
      const stageDescriptions: Record<string, string> = {
        Evidence: "Evidence Gathering",
        Analysis: "Analysis & Evaluation",
        Advanced: "Advanced Synthesis",
      };
      finalAiText = `Great progress! Let's move to the next stage: **${stageDescriptions[newStage]}**. ${aiText}`;
    }

    // Save AI message
    const aiMessage = await prisma.message.create({
      data: {
        chatSessionId: chatSession.id,
        sender: 'ai',
        text: finalAiText,
        sources: sources || undefined,
        messageOrder: messageOrder + 1,
      },
    });

    res.json({
      userMessage,
      aiMessage,
      newStage,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
