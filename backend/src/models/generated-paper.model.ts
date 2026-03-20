import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface IGeneratedPaper extends Document {
  assignmentId: Types.ObjectId;
  sections: Record<string, any>[]; // Extensible array for sections -> questions
  metadata?: Record<string, any>;   // Extensible for difficulty distribution, time, etc
  createdAt: Date;
  updatedAt: Date;
}

const generatedPaperSchema = new Schema<IGeneratedPaper>(
  {
    assignmentId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Assignment', 
      required: true 
    },
    sections: [Schema.Types.Mixed],
    metadata: { 
      type: Schema.Types.Mixed 
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

generatedPaperSchema.index({ assignmentId: 1 });

export const GeneratedPaper = mongoose.model<IGeneratedPaper>('GeneratedPaper', generatedPaperSchema);
