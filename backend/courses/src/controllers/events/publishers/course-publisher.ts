import {
  Publisher,
  Subjects,
  AssignmentCreatedEvent,
  AssignmentDeletedEvent,
  AssignmentUpdatedEvent,
  CourseCreatedEvent,
  CourseUpdatedEvent,
  CourseDeletedEvent,
  CourseMaterialsCreatedEvent,
  CourseMaterialsUpdatedEvent,
  CourseMaterialsDeletedEvent,
  StudentDeliveryAssignmentCreatedEvent,
  StudentDeliveryAssignmentUpdatedEvent,
  StudentDeliveryAssignmentDeletedEvent,
  StudentDeliveryFileCreatedEvent,
  StudentDeliveryFileUpdatedEvent,
  StudentDeliveryFileDeletedEvent,
  AssignmentMaterialsDeletedEvent,
  AssignmentMaterialsUpdatedEvent,
  AssignmentMaterialsCreatedEvent,
} from '@otmilms/common';

export class AssignmentCreatedPublisher extends Publisher<AssignmentCreatedEvent> {
  readonly subject = Subjects.AssignmentCreated;
}
export class AssignmentUpdatedPublisher extends Publisher<AssignmentUpdatedEvent> {
  readonly subject = Subjects.AssignmentUpdated;
}
export class AssignmentDeletedPublisher extends Publisher<AssignmentDeletedEvent> {
  readonly subject = Subjects.AssignmentDeleted;
}
export class CourseCreatedPublisher extends Publisher<CourseCreatedEvent> {
  readonly subject = Subjects.CourseCreated;
}
export class CourseUpdatedPublisher extends Publisher<CourseUpdatedEvent> {
  readonly subject = Subjects.CourseUpdated;
}
export class CourseDeletedPublisher extends Publisher<CourseDeletedEvent> {
  readonly subject = Subjects.CourseDeleted;
}
export class CourseMaterialCreatedPublisher extends Publisher<CourseMaterialsCreatedEvent> {
  readonly subject = Subjects.CourseMaterialCreated;
}
export class CourseMaterialdeletedPublisher extends Publisher<CourseMaterialsDeletedEvent> {
  readonly subject = Subjects.CourseMaterialDeleted;
}
export class AssignmentMaterialCreatedPublisher extends Publisher<AssignmentMaterialsCreatedEvent> {
  readonly subject = Subjects.AssignmentMaterialCreated;
}
export class AssignmentMaterialDeletedPublisher extends Publisher<AssignmentMaterialsDeletedEvent> {
  readonly subject = Subjects.AssignmentMaterialDeleted;
}
export class StudentDeliveryAssignmentCreatedPublisher extends Publisher<StudentDeliveryAssignmentCreatedEvent> {
  readonly subject = Subjects.StudentDeliveryAssignmentCreated;
}
export class StudentDeliveryAssignmentUpdatedPublisher extends Publisher<StudentDeliveryAssignmentUpdatedEvent> {
  readonly subject = Subjects.StudentDeliveryAssignmentUpdated;
}
export class StudentDeliveryAssignmentDeletedPublisher extends Publisher<StudentDeliveryAssignmentDeletedEvent> {
  readonly subject = Subjects.StudentDeliveryAssignmentDeleted;
}
export class StudentDeliveryFileCreatedPublisher extends Publisher<StudentDeliveryFileCreatedEvent> {
  readonly subject = Subjects.StudentDeliveryFileCreated;
}
export class StudentDeliveryFileDeletedPublisher extends Publisher<StudentDeliveryFileDeletedEvent> {
  readonly subject = Subjects.StudentDeliveryFileDeleted;
}
