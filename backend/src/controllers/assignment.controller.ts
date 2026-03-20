import { Request, Response } from 'express';
import { assignmentService } from '../services/assignment.service';
import { asyncHandler } from '../types/index';
import httpStatus from 'http-status-codes';

export class AssignmentController {
  /**
   * POST /api/v1/assignments
   */
  createAssignment = asyncHandler(async (req: Request, res: Response) => {
    const assignment = await assignmentService.createAssignment(req.body);
    
    res.status(httpStatus.CREATED).json({
      success: true,
      data: assignment,
    });
  });

  /**
   * GET /api/v1/assignments/:id
   */
  getAssignment = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const data = await assignmentService.getAssignmentById(id);

    res.status(httpStatus.OK).json({
      success: true,
      data,
    });
  });

  /**
   * GET /api/v1/assignments
   */
  listAssignments = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string || '1', 10);
    const limit = parseInt(req.query.limit as string || '10', 10);

    const result = await assignmentService.listAssignments(page, limit);

    res.status(httpStatus.OK).json({
      success: true,
      ...result,
    });
  });
}

export const assignmentController = new AssignmentController();

