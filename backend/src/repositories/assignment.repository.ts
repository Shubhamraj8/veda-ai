import { Assignment, type IAssignment } from '../models/assignment.model';

/**
 * Assignment repository — data access layer.
 * All database operations for assignments go through here.
 */
export class AssignmentRepository {
  async create(data: Partial<IAssignment>): Promise<IAssignment> {
    return Assignment.create(data);
  }

  async findById(id: string): Promise<IAssignment | null> {
    return Assignment.findById(id);
  }

  async findAll(
    filter: Record<string, unknown> = {},
    options: { page?: number; limit?: number } = {},
  ): Promise<{ data: IAssignment[]; total: number }> {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      Assignment.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Assignment.countDocuments(filter),
    ]);

    return { data, total };
  }

  async updateById(
    id: string,
    update: Partial<IAssignment>,
  ): Promise<IAssignment | null> {
    return Assignment.findByIdAndUpdate(id, update, { new: true });
  }

  async deleteById(id: string): Promise<IAssignment | null> {
    return Assignment.findByIdAndDelete(id);
  }
}

export const assignmentRepository = new AssignmentRepository();


