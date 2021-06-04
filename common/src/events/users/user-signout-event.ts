import { Subjects } from './../base/subjects';

export interface UserSignOutEvent {
  subject: Subjects.UserSignOut;
  data: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    time: Date;
  };
}