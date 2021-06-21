// export interface EventCourse {
//   title: string;
//   description: string;
//   semester: string;
//   year: string;
//   lastUpdate: Date;
//   time: Date;
// }

// export interface EventMaterial {
//   name: string;
//   lastUpdate: Date;
//   time: Date;
// }

// export interface EventAssignment {
//   title: string;
//   description: string;
//   lastUpdate: Date;
//   time: Date;
// }

// export interface EventStudentDeliveryAssignment {
//   name: string;
//   lastUpdate: Date;
//   studentName: string;
//   time: Date;
// }

// export interface EventStudentDeliveryFile {
//   name: string;
//   lastUpdate: Date;
//   time: Date;
// }

export interface RiakEvent {
  user: string;
  email: string;
  time: Date;
}
