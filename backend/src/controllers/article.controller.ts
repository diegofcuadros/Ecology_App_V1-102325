import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth';
import { processUploadedArticle } from '../services/gemini.service';

const prisma = new PrismaClient();

const createArticleSchema = z.object({
  title: z.string().min(1).max(500),
  author: z.string().min(1).max(255),
  year: z.number().int().min(1900).max(2100),
  content: z.string().min(1),
  learningObjectives: z.array(z.string()).min(1).max(10),
  keyConcepts: z.array(z.string()).min(1).max(20),
  isPublic: z.boolean().optional(),
});

export const createArticle = async (req: AuthRequest, res: Response) => {
  try {
    const data = createArticleSchema.parse(req.body);
    const userId = req.user!.id;

    const article = await prisma.article.create({
      data: {
        ...data,
        uploadedById: userId,
        isPublic: data.isPublic ?? true,
      },
    });

    res.status(201).json(article);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    console.error('Create article error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const processUploadedPDF = async (req: AuthRequest, res: Response) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ message: 'Article text is required' });
    }

    const metadata = await processUploadedArticle(text);

    const article = await prisma.article.create({
      data: {
        title: metadata.title,
        author: metadata.author,
        year: metadata.year,
        content: text,
        learningObjectives: metadata.learningObjectives,
        keyConcepts: metadata.keyConcepts,
        uploadedById: req.user!.id,
        isPublic: true,
      },
    });

    res.status(201).json(article);
  } catch (error) {
    console.error('Process PDF error:', error);
    res.status(500).json({
      message: 'Failed to process article. Please try again or enter metadata manually.'
    });
  }
};

export const getArticles = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const articles = await prisma.article.findMany({
      where: {
        OR: [
          { isPublic: true },
          { uploadedById: userId },
        ],
      },
      include: {
        uploadedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(articles);
  } catch (error) {
    console.error('Get articles error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getArticle = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const article = await prisma.article.findUnique({
      where: { id },
      include: {
        uploadedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    if (!article.isPublic && article.uploadedById !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(article);
  } catch (error) {
    console.error('Get article error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateArticle = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const existing = await prisma.article.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ message: 'Article not found' });
    }

    if (existing.uploadedById !== userId) {
      return res.status(403).json({ message: 'Access denied. Only uploader can edit.' });
    }

    const article = await prisma.article.update({
      where: { id },
      data: req.body,
    });

    res.json(article);
  } catch (error) {
    console.error('Update article error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteArticle = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const article = await prisma.article.findUnique({
      where: { id },
      include: {
        assignments: true,
      },
    });

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    if (article.uploadedById !== userId) {
      return res.status(403).json({ message: 'Access denied. Only uploader can delete.' });
    }

    if (article.assignments.length > 0) {
      return res.status(400).json({
        message: 'Cannot delete article used in assignments',
        assignmentCount: article.assignments.length,
      });
    }

    await prisma.article.delete({
      where: { id },
    });

    res.json({ message: 'Article deleted successfully' });
  } catch (error) {
    console.error('Delete article error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
