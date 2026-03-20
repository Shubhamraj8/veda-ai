import mongoose, { Schema, type Document } from 'mongoose';

export const JOB_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  FAILED: 'failed',
  DELAYED: 'delayed',
} as const;

export type JobStatus = (typeof JOB_STATUS)[keyof typeof JOB_STATUS];

export interface IJobTracking extends Document {
  jobId: string; // ID assigned by BullMQ
  status: JobStatus;
  progress: number;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

const jobTrackingSchema = new Schema<IJobTracking>(
  {
    jobId: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: Object.values(JOB_STATUS),
      default: JOB_STATUS.ACTIVE,
    },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    error: { type: String },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

jobTrackingSchema.index({ status: 1 });

export const JobTracking = mongoose.model<IJobTracking>('JobTracking', jobTrackingSchema);
