import mongoose, { Schema, type Document, type Types } from 'mongoose';

export const ASSIGNMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

export type AssignmentStatus = (typeof ASSIGNMENT_STATUS)[keyof typeof ASSIGNMENT_STATUS];

export interface IAssignment extends Document {
  title: string;
  instructions?: string;
  dueDate?: Date;
  questionTypes?: string[];
  totalQuestions?: number;
  totalMarks?: number;
  status: AssignmentStatus;
  fileUrl?: string;
  createdBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const assignmentSchema = new Schema<IAssignment>(
  {
    title: { type: String, required: true, trim: true },
    instructions: { type: String },
    dueDate: { type: Date },
    questionTypes: [{ type: String }],
    totalQuestions: { type: Number },
    totalMarks: { type: Number },
    status: {
      type: String,
      enum: Object.values(ASSIGNMENT_STATUS),
      default: ASSIGNMENT_STATUS.PENDING,
    },
    fileUrl: { type: String },
    createdBy: { type: Schema.Types.ObjectId },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

assignmentSchema.index({ status: 1 });
assignmentSchema.index({ createdBy: 1 });
assignmentSchema.index({ dueDate: 1 });

export const Assignment = mongoose.model<IAssignment>('Assignment', assignmentSchema);
