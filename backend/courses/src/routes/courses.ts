import express from 'express';
import {
  currentUser,
  extractFile,
  extractMultipleFiles,
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

router.get('', currentUser, CourseController.getCourses);

router.get(
  '/:id/assignments',
  currentUser,
  AssignmentController.getAssignments
);

router.post(
  '/:id/assignments',
  // AssignmentController.mkDir,
  // AssignmentController.extractFileController,
  extractFile(MIME_TYPE_MAP, 'src/public/assignments', 'filePath'),
  currentUser,
  AssignmentController.createAssignment
);

router.put('/:id', currentUser, CourseController.updateCourse);

router.post('', currentUser, CourseController.createCourse);

router.delete('/:id', currentUser, CourseController.deleteCourse);

router.delete(
  '/:courseId/assignments/:assignmentId',
  currentUser,
  AssignmentController.deleteAssignment
);

router.put(
  '/:courseId/assignments/:assignmentId',
  currentUser,
  AssignmentController.updateAssignment
);

// download file (pdf, doc)
router.post(
  '/:courseId/assignments/:assignmentId/dump',
  currentUser,
  AssignmentController.downloadAssignment
);

router.get(
  '/:courseId/assignments/:assignmentId/materials',
  currentUser,
  MaterialsController.getMaterials
);

router.post(
  '/:courseId/assignments/:assignmentId/materials',
  extractMultipleFiles(MIME_TYPE_MAP, 'src/public/materials', 'filePath[]'),
  currentUser,
  MaterialsController.createMaterials
);

router.delete(
  '/:courseId/assignments/:assignmentId/materials/:materialId',
  currentUser,
  MaterialsController.deleteMaterial
);

// download file (pdf, doc)
router.post(
  '/:courseId/assignments/:assignmentId/materials/:materialId/dump',
  currentUser,
  MaterialsController.downloadMaterial
);

router.post(
  '/:courseId/assignments/:assignmentId/student-deliveries',
  extractMultipleFiles(
    MIME_TYPE_MAP,
    'src/public/student-deliveries',
    'filePaths[]'
  ),
  currentUser,
  StudentDeliveriesController.createStudentDelivery
);

router.get(
  '/:courseId/assignments/:assignmentId/all-student-deliveries',
  currentUser,
  StudentDeliveriesController.getAllStudentDeliveries
);

router.get(
  '/:courseId/assignments/:assignmentId/my-student-delivery',
  currentUser,
  StudentDeliveriesController.getMyStudentDelivery
);

router.delete(
  '/:courseId/assignments/:assignmentId/student-deliveries/:studentDeliveryAssignmentId/files/:fileId',
  currentUser,
  StudentDeliveriesController.deleteStudentDelivery
);

export { router as CourseRouter };
