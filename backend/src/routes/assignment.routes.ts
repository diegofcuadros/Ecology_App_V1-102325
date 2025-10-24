import { Router } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import {
  createAssignment,
  getProfessorAssignments,
  getStudentAssignments,
  getAssignment,
  updateAssignment,
  deleteAssignment,
  getAssignmentStats,
} from '../controllers/assignment.controller.js';

const router = Router();

router.use(authenticateToken);

router.post(
  '/',
  requireRole('professor'),
  createAssignment
);

router.get(
  '/professor',
  requireRole('professor'),
  getProfessorAssignments
);

router.get(
  '/:id/stats',
  requireRole('professor'),
  getAssignmentStats
);

router.put(
  '/:id',
  requireRole('professor'),
  updateAssignment
);

router.delete(
  '/:id',
  requireRole('professor'),
  deleteAssignment
);

router.get(
  '/student',
  requireRole('student'),
  getStudentAssignments
);

router.get('/:id', getAssignment);

export default router;
