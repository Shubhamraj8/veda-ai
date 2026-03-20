import { Router } from 'express';
import assignmentRoutes from './assignment.route';

const router = Router();

// API v1 route groups
router.use('/assignments', assignmentRoutes);

export default router;

