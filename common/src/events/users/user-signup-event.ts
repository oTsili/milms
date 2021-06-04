import { Subjects } from './../base/subjects';

export interface UserSignUpEvent {
  subject: Subjects.UserSignUp;
  data: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    time: Date;
  };
}
