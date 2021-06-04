import { Subjects } from '../base/subjects';

export interface UserUpdateEvent {
  subject: Subjects.UserUpdate;
  data: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    time: Date;
  };
}
