import { Subjects } from './../base/subjects';

export interface UserSignInEvent {
  subject: Subjects.UserSignIn;
  data: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    time: Date;
  };
}
