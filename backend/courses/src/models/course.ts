import mongoose from 'mongoose';
import { Course, Assignment } from './models';
import { AssignmentDoc, assignmentSchema } from './assignment';
import { UserDoc } from './user';

// An interface that describes the properties
// that are requried to create a new Course
export interface CourseAttrs {
  title: string;
  description: string;
  semester: string;
  year: string;
  createdAt: Date;
  instructorId: string | UserDoc;
}

// An interface that describes the properties
// that a Course Model has
export interface CourseModel extends mongoose.Model<CourseDoc> {
  build(attrs: CourseAttrs): CourseDoc;
}

// An interface that describes the properties
// that a Course Document has
export interface CourseDoc extends mongoose.Document {
  title: string;
  description: string;
  semester: string;
  year: string;
  createdAt: Date;
  instructorId: string | UserDoc;
}

export const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    semester: {
      type: String,
      required: true,
    },
    year: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    instructorId: {
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

courseSchema.statics.build = (attrs: CourseAttrs) => {
  return new Course(attrs);
};
