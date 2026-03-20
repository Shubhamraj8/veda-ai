import { Router } from 'express';
import { assignmentController } from '../controllers/assignment.controller';
import { validate } from '../middlewares/validate';
import { generationRateLimiter } from '../middlewares/security.middleware';
import { createAssignmentSchema } from '../validators/assignment.validator';

const router = Router();

/**
 * @route   POST /api/v1/assignments
 * @desc    Create a new assignment and trigger AI generation
 */
router.post(
  '/',
  generationRateLimiter,
  validate(createAssignmentSchema, 'body'),
  assignmentController.createAssignment,
);

/**
 * @route   GET /api/v1/assignments/:id
 * @desc    Get assignment details and generation status
 */
router.get('/:id', assignmentController.getAssignment);

/**
 * @route   GET /api/v1/assignments
 * @desc    List all assignments (paginated)
 */
router.get('/', assignmentController.listAssignments);

export default router;

