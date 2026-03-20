import { describe, it, expect, vi, beforeEach } from 'vitest';
import { assignmentService } from './assignment.service';
import { assignmentRepository } from '../repositories/assignment.repository';
import { addAssignmentJob } from '../jobs/assignment.job';
import { JobTracking } from '../models/job-tracking.model';
import { AppError } from '../types/index';

// Mock dependencies
vi.mock('../repositories/assignment.repository', () => ({
  assignmentRepository: {
    create: vi.fn(),
    findById: vi.fn(),
    findAll: vi.fn(),
  },
}));

vi.mock('../jobs/assignment.job', () => ({
  addAssignmentJob: vi.fn(),
}));

vi.mock('../models/job-tracking.model', () => ({
  JobTracking: {
    findOne: vi.fn(),
  },
}));

vi.mock('../lib/cache', () => ({
  cacheService: {
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
    delByPattern: vi.fn(),
  },
}));

describe('AssignmentService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createAssignment', () => {
    it('should create an assignment and enqueue a job', async () => {
      const mockAssignment = {
        _id: 'mock-id',
        title: 'Math Quiz',
        instructions: 'Test',
        totalQuestions: 5,
        questionTypes: ['Short Answer'],
      };

      (assignmentRepository.create as any).mockResolvedValue(mockAssignment);
      (addAssignmentJob as any).mockResolvedValue('job-id');

      const result = await assignmentService.createAssignment(mockAssignment as any);

      expect(assignmentRepository.create).toHaveBeenCalledWith(mockAssignment);
      expect(addAssignmentJob).toHaveBeenCalled();
      expect(result).toEqual(mockAssignment);
    });
  });

  describe('getAssignmentById', () => {
    it('should return assignment with job tracking info', async () => {
      const mockAssignment = { _id: '123', title: 'Test' };
      const mockJobTracking = { jobId: 'assignment-123', status: 'completed' };

      (assignmentRepository.findById as any).mockResolvedValue(mockAssignment);
      (JobTracking.findOne as any).mockResolvedValue(mockJobTracking);

      const result = await assignmentService.getAssignmentById('123');

      expect(result.assignment).toEqual(mockAssignment);
      expect(result.jobStatus).toEqual(mockJobTracking);
    });

    it('should throw error if assignment not found', async () => {
      (assignmentRepository.findById as any).mockResolvedValue(null);

      await expect(assignmentService.getAssignmentById('999')).rejects.toThrow('Assignment not found');
    });
  });
});


