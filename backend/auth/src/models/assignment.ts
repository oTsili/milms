import mongoose from 'mongoose';
import { Assignment } from './models';
import { MaterialDoc } from './material';
import { StudentDeliveryDoc } from '../models/studentDelivery';

// An interface that describes the properties
// that are requried to create a new Assignment
export interface AssignmentAttrs {
  id: string;
  title: string;
  description?: string;
  // filePath: string;
  // fileType: string;
  creatorId?: string;
  courseId?: string;
  lastUpdate: Date;
  rank?: number;
  studentDeliveries?: StudentDeliveryDoc[];
  materials?: MaterialDoc[];
}

// An interface that describes the properties
// that a Assignment Model has
export interface AssignmentModel extends mongoose.Model<AssignmentDoc> {
  build(attrs: AssignmentAttrs): AssignmentDoc;
}

// An interface that describes the properties
// that a Assignment Document has
export interface AssignmentDoc extends mongoose.Document {
  title: string;
  description?: string;
  // filePath: string;
  // fileType: string;
  lastUpdate: Date;
  createdAt: Date;
  rank?: number;
  creatorId: string;
  courseId: string;
  graderId?: string;
  studentDeliveries?: StudentDeliveryDoc[];
  materials?: MaterialDoc[];
}

export const assignmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    filePath: {
      type: String,
      // required: true,
    },
    fileType: {
      type: String,
      // required: true,
    },
    lastUpdate: {
      type: Date,
      default: Date.now(),
    },
    createdAt: {
      type: Date,
    },
    rank: { type: Number },
    creatorId: {
      // required: true,
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    courseId: {
      // required: true,
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
    },
    graderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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

assignmentSchema.statics.build = (attrs: AssignmentAttrs) => {
  return new Assignment({
    _id: attrs.id,
    title: attrs.title,
    description: attrs.description,
    lastUpdate: attrs.lastUpdate,
    rank: attrs.rank,
  });
};
