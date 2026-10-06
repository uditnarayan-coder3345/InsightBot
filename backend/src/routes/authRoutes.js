import { Router } from 'express';
import { getCurrentUser } from '../controllers/authController.js';
import { requireUser } from '../middleware/authMiddleware.js';
const router = Router();
router.get('/me', requireUser, getCurrentUser);
export default router;
