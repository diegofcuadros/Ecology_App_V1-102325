import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  createArticle,
  processUploadedPDF,
  getArticles,
  getArticle,
  updateArticle,
  deleteArticle,
} from '../controllers/article.controller';

const router = Router();

router.use(authenticateToken);

router.post('/', createArticle);
router.post('/process-pdf', processUploadedPDF);

router.get('/', getArticles);
router.get('/:id', getArticle);

router.put('/:id', updateArticle);
router.delete('/:id', deleteArticle);

export default router;
