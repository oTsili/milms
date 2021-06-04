import {
  Publisher,
  Subjects,
  UserSignUpEvent,
  UserSignInEvent,
  UserSignOutEvent,
  UserUpdateEvent,
} from '@otmilms/common';

export class UserSignUpPublisher extends Publisher<UserSignUpEvent> {
  readonly subject = Subjects.UserSignUp;
}

export class UserSignInPublisher extends Publisher<UserSignInEvent> {
  readonly subject = Subjects.UserSignIn;
}

export class UserSignOutPublisher extends Publisher<UserSignOutEvent> {
  readonly subject = Subjects.UserSignOut;
}
export class UserUpdatePublisher extends Publisher<UserUpdateEvent> {
  readonly subject = Subjects.UserUpdate;
}
