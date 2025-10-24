import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth.js';

const prisma = new PrismaClient();

const createAssignmentSchema = z.object({
  articleId: z.string().uuid(),
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  gradingRubric: z.object({
    criteria: z.array(
      z.object({
        name: z.string(),
        maxPoints: z.number().positive(),
        description: z.string(),
      })
    ),
  }).optional(),
});

export const createAssignment = async (req: AuthRequest, res: Response) => {
  try {
    const data = createAssignmentSchema.parse(req.body);
    const professorId = req.user!.id;

    const article = await prisma.article.findUnique({
      where: { id: data.articleId },
    });

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    const assignment = await prisma.assignment.create({
      data: {
        professorId,
        articleId: data.articleId,
        title: data.title,
        description: data.description || null,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        gradingRubric: data.gradingRubric ? (data.gradingRubric as any) : null,
      },
      include: {
        article: true,
      },
    });

    res.status(201).json(assignment);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    console.error('Create assignment error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getProfessorAssignments = async (req: AuthRequest, res: Response) => {
  try {
    const professorId = req.user!.id;

    const assignments = await prisma.assignment.findMany({
      where: { professorId },
      include: {
        article: true,
        chatSessions: {
          include: {
            student: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            grade: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const assignmentsWithStats = assignments.map(assignment => ({
      ...assignment,
      stats: {
        totalStudents: assignment.chatSessions.length,
        studentsGraded: assignment.chatSessions.filter(cs => cs.grade).length,
        averageScore: assignment.chatSessions
          .filter(cs => cs.grade?.overallScore)
          .reduce((acc, cs, _, arr) =>
            acc + (Number(cs.grade!.overallScore!) / arr.length), 0
          ) || null,
      },
    }));

    res.json(assignmentsWithStats);
  } catch (error) {
    console.error('Get professor assignments error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getStudentAssignments = async (req: AuthRequest, res: Response) => {
  try {
    const studentId = req.user!.id;

    const allAssignments = await prisma.assignment.findMany({
      include: {
        article: {
          select: {
            id: true,
            title: true,
            author: true,
            year: true,
            learningObjectives: true,
            keyConcepts: true,
          },
        },
        professor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const chatSessions = await prisma.chatSession.findMany({
      where: { studentId },
      include: {
        grade: true,
      },
    });

    const sessionMap = new Map(
      chatSessions.map(cs => [cs.assignmentId, cs])
    );

    const assignmentsWithProgress = allAssignments.map(assignment => {
      const session = sessionMap.get(assignment.id);

      return {
        ...assignment,
        studentProgress: session ? {
          chatSessionId: session.id,
          currentStage: session.currentStage,
          userMessageCount: session.userMessageCount,
          lastActivityAt: session.lastActivityAt,
          hasGrade: !!session.grade,
          grade: session.grade ? {
            overallScore: session.grade.overallScore,
            feedback: session.grade.feedback,
            gradedAt: session.grade.gradedAt,
          } : null,
        } : null,
      };
    });

    res.json(assignmentsWithProgress);
  } catch (error) {
    console.error('Get student assignments error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAssignment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const assignment = await prisma.assignment.findUnique({
      where: { id },
      include: {
        article: true,
        professor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    if (userRole === 'professor' && assignment.professorId === userId) {
      const chatSessions = await prisma.chatSession.findMany({
        where: { assignmentId: id },
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          grade: true,
        },
      });

      return res.json({
        ...assignment,
        chatSessions,
      });
    }

    res.json(assignment);
  } catch (error) {
    console.error('Get assignment error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateAssignment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const professorId = req.user!.id;

    const existing = await prisma.assignment.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    if (existing.professorId !== professorId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const assignment = await prisma.assignment.update({
      where: { id },
      data: req.body,
      include: {
        article: true,
      },
    });

    res.json(assignment);
  } catch (error) {
    console.error('Update assignment error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteAssignment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const professorId = req.user!.id;

    const assignment = await prisma.assignment.findUnique({
      where: { id },
      include: {
        chatSessions: true,
      },
    });

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    if (assignment.professorId !== professorId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (assignment.chatSessions.length > 0) {
      return res.status(400).json({
        message: 'Cannot delete assignment with student activity.',
        studentCount: assignment.chatSessions.length,
      });
    }

    await prisma.assignment.delete({
      where: { id },
    });

    res.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    console.error('Delete assignment error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAssignmentStats = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const professorId = req.user!.id;

    const assignment = await prisma.assignment.findUnique({
      where: { id },
      include: {
        chatSessions: {
          include: {
            messages: true,
            grade: true,
            student: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    if (assignment.professorId !== professorId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const stats = {
      totalStudents: assignment.chatSessions.length,
      studentsGraded: assignment.chatSessions.filter(cs => cs.grade).length,
      averageScore: assignment.chatSessions
        .filter(cs => cs.grade?.overallScore)
        .reduce((sum, cs, _, arr) =>
          sum + (Number(cs.grade!.overallScore!) / arr.length), 0
        ) || null,
      averageMessages: assignment.chatSessions.length > 0
        ? assignment.chatSessions.reduce((sum, cs, _, arr) =>
            sum + (cs.messages.length / arr.length), 0
          )
        : 0,
      stageDistribution: {
        Comprehension: assignment.chatSessions.filter(cs => cs.currentStage === 'Comprehension').length,
        Evidence: assignment.chatSessions.filter(cs => cs.currentStage === 'Evidence').length,
        Analysis: assignment.chatSessions.filter(cs => cs.currentStage === 'Analysis').length,
        Advanced: assignment.chatSessions.filter(cs => cs.currentStage === 'Advanced').length,
      },
      studentDetails: assignment.chatSessions.map(cs => ({
        student: cs.student,
        messageCount: cs.messages.length,
        currentStage: cs.currentStage,
        lastActivity: cs.lastActivityAt,
        hasGrade: !!cs.grade,
        score: cs.grade?.overallScore || null,
      })),
    };

    res.json(stats);
  } catch (error) {
    console.error('Get assignment stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
