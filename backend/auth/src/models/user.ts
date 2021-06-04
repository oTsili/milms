import mongoose from 'mongoose';
import validator from 'validator';
import { User } from './models';
import { GeneratePassword } from '../services/generate-password';

// An interface that describes the properties
// that are requried to create a new User
export interface UserAttrs {
  firstName: string;
  lastName: string;
  role?: string;
  email: string;
  photoPath: string;
  password: string;
  passwordConfirm: string;
  courseId?: string;
  assignmentId?: string;
}

// An interface that describes the properties
// that a User Model has
export interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;
}

// An interface that describes the properties
// that a User Document has
export interface UserDoc extends mongoose.Document {
  firstName: string;
  lastName: string;
  role?: string;
  email: string;
  photoPath: string;
  password: string;
  passwordConfirm: string;
  courseId: string;
  assignmentId: string;
  passwordChangedAt: Date;
  passwordResetToken: string;
  passwordResetExpires: Date;
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
    photoPath: {
      type: String,
      default: 'default.jpg',
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [8, 'Password must be at least 8 characters'],
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
    },
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assignment',
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  {
    // convert _id to id and delete password and __v
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.password;
        delete ret.__v;
      },
    },
  }
);

userSchema.pre('save', async function (done) {
  if (this.isModified('password')) {
    const hashed = await GeneratePassword.toHash(this.get('password'));
    this.set('password', hashed);
  }
  done();
});

// userSchema.methods.correctPassword = async function () //   candidatePassword,
//   userPassword
// {
//     return await bcrypt.compare(candidatePassword, userPassword);
// };

// userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
//   if (this.passwordChangedAt) {
//     const changedTimestamp = parseInt(
//       this.passwordChangedAt.getTime() / 1000,
//       10
//     );

//     return JWTTimestamp < changedTimestamp;
//   }

//   // False means NOT changed
//   return false;
// };

// userSchema.methods.createPasswordResetToken = function () {
// const resetToken = crypto.randomBytes(32).toString('hex');
// this.passwordResetToken = crypto
//   .createHash('sha256')
//   .update(resetToken)
//   .digest('hex');
// // console.log({ resetToken }, this.passwordResetToken);
// this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
// return resetToken;
// };

userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs);
};
