import express from 'express';
import {
  currentUser,
  extractFile,
  extractMultipleFiles,
  requireAuth,
} from '@otmilms/common';
const router = express.Router();

import * as CourseController from '../controllers/courses';
import * as AssignmentController from '../controllers/assignments';
import { currentUserRouter } from './current-user';
import * as StudentDeliveriesController from '../controllers/studentDeliveries';
import * as MaterialsController from '../controllers/materials';

const MIME_TYPE_MAP: { [key: string]: any } = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
    'docx',
  'application/msword': 'doc',
};

router.get('', currentUser, requireAuth, CourseController.getCourses);

router.get('/:id', currentUser, requireAuth, CourseController.getCourse);

/////////////////  Course Materials /////////////////
router.get(
  '/:courseId/materials',
  currentUser,
  requireAuth,
  MaterialsController.getCourseMaterials
);

router.post(
  '/:courseId/materials',
  extractMultipleFiles(
    MIME_TYPE_MAP,
    'src/public/course-materials',
    'filePaths[]'
  ),
  currentUser,
  requireAuth,
  MaterialsController.createCourseMaterials
);

router.delete(
  '/:courseId/materials/:materialId',
  currentUser,
  requireAuth,
  MaterialsController.deleteCourseMaterials
);

// download file (pdf, doc)
router.post(
  '/:courseId/materials/:materialId/dump',
  currentUser,
  requireAuth,
  MaterialsController.downloadCourseMaterials
);

/////////////////  Assignment Materials /////////////////

router.get(
  '/:courseId/assignments/:assignmentId/materials',
  currentUser,
  requireAuth,
  MaterialsController.getAssignmentMaterials
);

router.post(
  '/:courseId/assignments/:assignmentId/materials',
  extractMultipleFiles(
    MIME_TYPE_MAP,
    'src/public/assignment-materials',
    'filePaths[]'
  ),
  currentUser,
  requireAuth,
  MaterialsController.createAssignmentMaterials
);

router.delete(
  '/:courseId/assignments/:assignmentId/materials/:materialId',
  currentUser,
  requireAuth,
  MaterialsController.deleteAssignmentMaterials
);

// download file (pdf, doc)
router.post(
  '/:courseId/assignments/:assignmentId/materials/:materialId/dump',
  currentUser,
  requireAuth,
  MaterialsController.downloadAssignmentMaterials
);

///////////////// Assignmnets /////////////////
router.get(
  '/:courseId/assignments',
  currentUser,
  requireAuth,
  AssignmentController.getAssignments
);

router.get(
  '/:courseId/assignments/:assignmentId',
  currentUser,
  requireAuth,
  AssignmentController.getAssignment
);

router.post(
  '/:courseId/assignments',
  // AssignmentController.mkDir,
  // AssignmentController.extractFileController,
  extractFile(MIME_TYPE_MAP, 'src/public/assignments', 'filePath'),
  currentUser,
  requireAuth,
  AssignmentController.createAssignment
);

router.put('/:id', currentUser, requireAuth, CourseController.updateCourse);

router.post('', currentUser, requireAuth, CourseController.createCourse);

router.delete('/:id', currentUser, requireAuth, CourseController.deleteCourse);

router.delete(
  '/:courseId/assignments/:assignmentId',
  currentUser,
  requireAuth,
  AssignmentController.deleteAssignment
);

router.put(
  '/:courseId/assignments/:assignmentId',
  extractFile(MIME_TYPE_MAP, 'src/public/assignments', 'filePath'),
  currentUser,
  requireAuth,
  AssignmentController.updateAssignment
);

// download file (pdf, doc)
router.post(
  '/:courseId/assignments/:assignmentId/dump',
  currentUser,
  requireAuth,
  AssignmentController.downloadAssignment
);

/////////////// Student Deliveries ///////////////

router.post(
  '/:courseId/assignments/:assignmentId/student-deliveries',
  extractMultipleFiles(
    MIME_TYPE_MAP,
    'src/public/student-deliveries',
    'filePaths[]'
  ),
  currentUser,
  requireAuth,
  StudentDeliveriesController.createStudentDelivery
);

router.get(
  '/:courseId/assignments/:assignmentId/student-deliveries',
  currentUser,
  requireAuth,
  StudentDeliveriesController.getStudentDeliveries
);

router.delete(
  '/:courseId/assignments/:assignmentId/student-deliveries/:fileId',
  currentUser,
  requireAuth,
  StudentDeliveriesController.deleteStudentDelivery
);

router.post(
  '/:courseId/assignments/:assignmentId/student-deliveries/:fileId/dump',
  currentUser,
  requireAuth,
  StudentDeliveriesController.downloadStudentDeliveryFile
);

router.post(
  '/events',
  currentUser,
  requireAuth,
  CourseController.getAuthEvents
);

export { router as CourseRouter };
