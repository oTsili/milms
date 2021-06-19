import mongoose from 'mongoose';
import { StudentDeliveryAssignment } from './models';
import { UserDoc } from './user';
import { CourseDoc } from './course';
import { AssignmentDoc } from './assignment';
import { StudentDeliveryFileDoc } from './studentDeliveryFile';

// An interface that describes the properties
// that are requried to create a new StudentDelivery

export interface StudentDeliveryAssignmentAttrs {
  id?: string;
  name: string;
  lastUpdate?: Date;
  rank?: number;
  studentId?: UserDoc | string;
  courseId?: CourseDoc | string;
  assignmentId?: AssignmentDoc | string;
  instructorId?: UserDoc | string;
  studentName?: string;
  comment?: string;
}

// An interface that describes the properties
// that a StudentDelivery Model has
export interface StudentDeliveryAssignmentModel
  extends mongoose.Model<StudentDeliveryAssignmentDoc> {
  build(attrs: StudentDeliveryAssignmentAttrs): StudentDeliveryAssignmentDoc;
}

// An interface that describes the properties
// that a StudentDelivery Document has
export interface StudentDeliveryAssignmentDoc extends mongoose.Document {
  _id: string;
  id?: string;
  name: string;
  lastUpdate?: Date;
  rank?: number;
  studentId?: UserDoc | string;
  courseId?: CourseDoc | string;
  assignmentId?: AssignmentDoc | string;
  instructorId?: UserDoc | string;
  studentName?: string;
  comment?: string;
}

export const StudentDeliveryAssignmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    lastUpdate: {
      type: Date,
      default: Date.now(),
    },
    rank: { type: Number },
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
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assignment',
    },
    instructorId: {
      // required: true,
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    studentName: {
      type: String,
    },
    comment: {
      type: String,
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

StudentDeliveryAssignmentSchema.statics.build = (
  attrs: StudentDeliveryAssignmentAttrs
) => {
  return new StudentDeliveryAssignment(attrs);
};
