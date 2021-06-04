import mongoose from 'mongoose';
import { StudentDeliveryFile } from './models';
import { AssignmentDoc } from './assignment';
import { UserDoc } from './user';

// An interface that describes the properties
// that are requried to create a new StudentDelivery

export interface StudentDeliveryFileAttrs {
  id?: string;
  name: string;
  lastUpdate?: string;
  filePath?: string;
  fileType?: string;
  assignmentId?: string | AssignmentDoc;
  studentDeliveryAssignmentId?: string | StudentDeliveryFileDoc;
  studentId?: string | UserDoc;
}

// An interface that describes the properties
// that a StudentDelivery Model has
export interface StudentDeliveryFileModel
  extends mongoose.Model<StudentDeliveryFileDoc> {
  build(attrs: StudentDeliveryFileAttrs): StudentDeliveryFileDoc;
}

// An interface that describes the properties
// that a StudentDelivery Document has
export interface StudentDeliveryFileDoc extends mongoose.Document {
  id?: string;
  name: string;
  lastUpdate?: string;
  filePath?: string;
  fileType?: string;
  assignmentId?: string | AssignmentDoc;
  studentDeliveryAssignmentId?: string | StudentDeliveryFileDoc;
  studentId?: string | UserDoc;
}

export const StudentDeliveryFileSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
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
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assignment',
    },
    studentDeliveryAssignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StudentDeliveryAssignment',
    },
    studentId: {
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

StudentDeliveryFileSchema.statics.build = (attrs: StudentDeliveryFileAttrs) => {
  return new StudentDeliveryFile(attrs);
};
