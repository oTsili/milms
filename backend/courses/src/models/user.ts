import mongoose from 'mongoose';
import validator from 'validator';
import { User } from './models';

// An interface that describes the properties
// that are requried to create a new User
export interface UserAttrs {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

// An interface that describes the properties
// that a User Model has
export interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;
}

// An interface that describes the properties
// that a User Document has
export interface UserDoc extends mongoose.Document {
  id: string;
  firstName: string;
  lastName: string;
  email: string;

  role?: string;
}

export const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'Please tell us your first name!'],
    },
    lastName: {
      type: String,
      required: [true, 'Please tell us your last name!'],
    },
    role: {
      type: String,
      enum: ['student', 'instructor', 'admin'],
      default: 'student',
    },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email'],
    },
  },
  {
    // convert _id to id and delete password and __v
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

userSchema.statics.build = (attrs: UserAttrs) => {
  return new User({
    _id: attrs.id,
    firstName: attrs.firstName,
    lastName: attrs.lastName,
    email: attrs.email,
    role: attrs.role,
  });
};
