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
  StudentDeliveryModel,
  StudentDeliveryDoc,
  studentDeliverySchema,
} from './studentDelivery';

// Register all the mongoose schemas together
const Assignment = mongoose.model<AssignmentDoc, AssignmentModel>(
  'Assignment',
  assignmentSchema
);
const StudentDelivery = mongoose.model<
  StudentDeliveryDoc,
  StudentDeliveryModel
>('StudentDelivery', studentDeliverySchema);
const User = mongoose.model<UserDoc, UserModel>('User', userSchema);

const Course = mongoose.model<CourseDoc, CourseModel>('Course', courseSchema);

const Material = mongoose.model<MaterialDoc, MaterialModel>(
  'Material',
  materialSchema
);

export { Course, User, Assignment, StudentDelivery, Material };
