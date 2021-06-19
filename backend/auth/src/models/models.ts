import mongoose from 'mongoose';

import { UserDoc, UserModel, userSchema } from '../models/user';
import { CourseDoc, CourseModel, courseSchema } from '../models/course';
import {
  AssignmentModel,
  AssignmentDoc,
  assignmentSchema,
} from '../models/assignment';
import { MaterialModel, MaterialDoc, materialSchema } from './material';
import {
  StudentDeliveryAssignmentModel,
  StudentDeliveryAssignmentDoc,
  StudentDeliveryAssignmentSchema,
} from './studentDeliveryAssignment';
import {
  StudentDeliveryFileModel,
  StudentDeliveryFileDoc,
  StudentDeliveryFileSchema,
} from './studentDeliveryFile';

// Register all the mongoose schemas together
const Assignment = mongoose.model<AssignmentDoc, AssignmentModel>(
  'Assignment',
  assignmentSchema
);
const StudentDeliveryAssignment = mongoose.model<
  StudentDeliveryAssignmentDoc,
  StudentDeliveryAssignmentModel
>('StudentDeliveryAssignment', StudentDeliveryAssignmentSchema);

const StudentDeliveryFile = mongoose.model<
  StudentDeliveryFileDoc,
  StudentDeliveryFileModel
>('StudentDeliveryFile', StudentDeliveryFileSchema);

const User = mongoose.model<UserDoc, UserModel>('User', userSchema);

const Course = mongoose.model<CourseDoc, CourseModel>('Course', courseSchema);

const Material = mongoose.model<MaterialDoc, MaterialModel>(
  'Material',
  materialSchema
);

export {
  Course,
  User,
  Assignment,
  StudentDeliveryAssignment,
  StudentDeliveryFile,
  Material,
};
