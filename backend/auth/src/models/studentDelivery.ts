import mongoose from 'mongoose';
import { StudentDelivery } from './models';

// An interface that describes the properties
// that are requried to create a new StudentDelivery

export interface StudentDeliveryAttrs {
  rank?: number;
  lastUpdate: string;
  filePath?: string;
  fileType?: string;
  assignmentId?: string;
  courseId?: string;
  instructorId?: string;
  comment: string;
  studentId: string;
}

// An interface that describes the properties
// that a StudentDelivery Model has
export interface StudentDeliveryModel
  extends mongoose.Model<StudentDeliveryDoc> {
  build(attrs: StudentDeliveryAttrs): StudentDeliveryDoc;
}

// An interface that describes the properties
// that a StudentDelivery Document has
export interface StudentDeliveryDoc extends mongoose.Document {
  rank?: number;
  lastUpdate: string;
  filePath?: string;
  fileType?: string;
  assignmentId?: string;
  courseId?: string;
  instructorId?: string;
  comment?: string;
  studentId: string;
}

export const studentDeliverySchema = new mongoose.Schema(
  {
    lastUpdate: {
      type: String,
      default: Date.now().toString(),
    },
    filePath: {
      type: String,
      // required: true,
    },
    fileType: {
      type: String,
      // required: true,
    },
    rank: { type: Number },
    comment: { type: String },
    studentId: {
      // required: true,
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    courseId: {
      // required: true,
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
    },
    instructorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assignment',
    },
  },

  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

studentDeliverySchema.statics.build = (attrs: StudentDeliveryAttrs) => {
  return new StudentDelivery(attrs);
};
