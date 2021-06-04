export interface SignupAuthData {
  email: string;
  firstName: string;
  lastName: string;
  file: File | string;
  signupDate: string;
  password: string;
  passwordConfirm: string;
}

export interface LoginAuthData {
  email: string;
  password: string;
}

export interface UserPayload {
  id: string;
  email: string;
  userName: string;
}

export interface User {
  email: string;
  id: string;
  photoPath: string;
  role: string;
  firstName: string;
  lastName: string;
}

// An interface that describes the properties
// that are requried to create a new User
export interface UserAttrs {
  firstName: string;
  lastName: string;
  email: string;
  photo: string;
  role?: string;
  id?: string;
  password: string;
  passwordConfirm?: string;
  passwordChangedAt?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
}
