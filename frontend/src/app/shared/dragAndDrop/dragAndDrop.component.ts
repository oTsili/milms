import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import {
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
  FormArray,
  ControlContainer,
  AbstractControl,
} from '@angular/forms';

import { AssignmentsService } from 'src/app/courses/course/assignments/assignments.service';
import { assignmentMimeType } from 'src/app/shared/validators/assignment-mime-type.validator';
import { Material } from 'src/app/models/material.model';
import { Assignment } from 'src/app/models/assignment.model';
import { CourseMaterialsService } from 'src/app/courses/course/course-material-list/course-materials.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { StudentDeliveryFile } from 'src/app/models/student-delivery.model';
// import { StudentDeliveriesService } from 'src/app/'
import { StudentDeliveryAssignment } from 'src/app/models/student-delivery.model';
import { CoursesService } from 'src/app/courses/courses.service';
import { Course } from 'src/app/models/course.model';
import { AssignmentMaterialsService } from 'src/app/courses/course/assignments/assignment/assignment-material-list/assignment-materials.service';
import { StudentDeliveriesService } from 'src/app/courses/course/assignments/assignment/student-delivery-files/student-delivery.service';

@Component({
  selector: 'app-dragAndDrop',
  templateUrl: './dragAndDrop.component.html',
  styleUrls: ['./dragAndDrop.component.scss', './dragAndDrop.component.css'],
})
export class DragAndDropComponent implements OnInit {
  @Input() component: string;
  @Input() parentComponent: string;
  @Input() currentControl: AbstractControl;

  materials: Material[];
  studentDeliveries: StudentDeliveryAssignment[];
  studentDeliveryFiles: StudentDeliveryFile[];
  files: any[] = [];
  file: any;
  isLoading: boolean = false;
  courseId: string;
  assignmentId: string;
  studentId: string;
  course: Course;
  studentDeliveriesForm: FormGroup;
  currentStudentDeliveryControl: FormArray;
  materialsForm: FormGroup;
  materialsControl: FormArray;
  assignmentsForm: FormGroup;
  assignmentsControl: FormArray;
  emptyMaterial: Material = {
    name: null,
    filePath: null,
    fileType: null,
    id: null,
    lastUpdate: null,
    courseId: null,
    assignmentId: null,
  };
  emptyStudentDelivery: StudentDeliveryFile = {
    name: null,
    filePath: null,
    fileType: null,
    id: null,
    lastUpdate: null,
    courseId: null,
    assignmentId: null,
  };
  totalMaterials = 0;
  totalStudentDeliveries = 0;
  assignmentsPerPage = 5;
  currentPage = 1;
  initialStudentDeliveries;

  constructor(
    private coursesService: CoursesService,
    private assignmentsService: AssignmentsService,
    private courseMaterialsService: CourseMaterialsService,
    private studentDeliveriesService: StudentDeliveriesService,
    private formBuilder: FormBuilder,
    public route: ActivatedRoute,
    private sharedService: SharedService,
    private assignmentMaterialsService: AssignmentMaterialsService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((paraMap: ParamMap) => {
      if (paraMap.has('courseId')) {
        this.courseId = paraMap.get('courseId');
      } else if (this.currentControl) {
        this.courseId = this.currentControl.value.courseId;
      } else {
        // throw new Error('no course id provided');
        console.log('no course id provided');
      }

      if (paraMap.has('assignmentId')) {
        this.assignmentId = paraMap.get('assignmentId');
      } else {
        console.log('no assignment id provided');
      }
    });

    // initialize the form for student deliveries and materials respectively
    this.studentDeliveriesForm = this.formBuilder.group({
      studentDeliveriesFormArray: this.formBuilder.array([
        // this.createStudentDelivery(this.emptyMaterial),
      ]),
    });

    this.materialsForm = this.formBuilder.group({
      materialsFormArray: this.formBuilder.array([
        // this.createMaterial(this.emptyMaterial),
      ]),
    });

    // keep their formArrays in variables
    this.currentStudentDeliveryControl = this.studentDeliveriesForm.get(
      'studentDeliveriesFormArray'
    ) as FormArray;
    this.materialsControl = this.materialsForm.get(
      'materialsFormArray'
    ) as FormArray;
  }

  /**
   * on file drop handler
   */
  onFileDropped($event) {
    if (this.component === 'material') {
      this.prepareMaterialFilesList($event);
      // materials update the assignment control
    } else if (this.component === 'student-delivery') {
      this.prepareStudentDeliveriesFileList($event);
      // deliveries update the deliveries control
    } else if (this.component === 'assignment') {
      this.prepareAssignmentFileList($event);
      // deliveries update the deliveries control
    }
  }

  /**
   * handle file from browsing
   */
  fileBrowseHandler(files) {
    console.log(this.component);
    if (this.component === 'material') {
      this.prepareMaterialFilesList(files);
    } else if (this.component === 'student-delivery') {
      this.prepareStudentDeliveriesFileList(files);
    } else if (this.component === 'assignment') {
      this.prepareAssignmentFileList(files);
    }
  }

  onSubmitCourseMaterials(event: Event) {
    // throw error if user has clicked submit without selecting any files
    if (this.materialsControl.length < 1) {
      this.sharedService.throwError('Please add some files first!');

      return;
    }
    this.isLoading = true;
    // fetch the current course
    this.coursesService.getCourse(this.courseId).subscribe((response) => {
      this.course = response.course;
      this.courseMaterialsService
        .addCourseMaterials(this.course, this.materialsControl)
        .subscribe((response) => {
          this.courseMaterialsService.onCourseMaterialsUpdate(
            response.fetchedMaterialFiles
          );
          this.deleteAllFiles(this.materialsControl);
          this.isLoading = false;
        });
      (err) => {
        console.log(err);
        this.isLoading = false;
      };
      () => {
        console.log('complete');
        this.isLoading = false;
      };
    });
  }

  onSubmitAssignmentMaterials(event: Event) {
    // throw error if user has clicked submit without selecting any files
    if (this.materialsControl.length < 1) {
      this.sharedService.throwError('Please add some files first!');
      return;
    }

    this.isLoading = true;
    this.assignmentMaterialsService
      .addAssignmentMaterials(
        this.courseId,
        this.assignmentId,
        this.materialsControl
      )
      .subscribe((responseData) => {
        this.assignmentMaterialsService.onAssignmentMaterialsUpdate(
          responseData.fetchedMaterialFiles
        );
        this.deleteAllFiles(this.materialsControl);
        this.isLoading = false;
      });
  }

  onSubmitMyDelivery(event: Event) {
    // throw error if user has clicked submit without selecting any files
    if (this.currentStudentDeliveryControl.length < 1) {
      this.sharedService.throwError('Please add some files first!');
      return;
    }

    this.isLoading = true;
    this.studentDeliveriesService
      .addStudentDeliveries(
        this.courseId,
        this.assignmentId,
        this.currentStudentDeliveryControl
      )
      .subscribe((responseData) => {
        this.studentDeliveriesService.onStudentDeliveriesUpdate(
          responseData.fetchedStudentDeliveryFiles
        );
        this.deleteAllFiles(this.currentStudentDeliveryControl);
        this.isLoading = false;
      });
  }

  /**
   * Delete file from files list
   * @param index (File index)
   */

  deleteStudentDeliveryFile(index: number) {
    this.files.splice(index, 1);
    this.currentStudentDeliveryControl.removeAt(index);
  }

  deleteAllFiles(formArray: FormArray) {
    for (let i = 0; i <= formArray.length; i++) {
      formArray.removeAt(i);
    }
    this.files = [];
  }

  /**
   * Simulate the upload process
   */
  uploadFilesSimulator(index: number) {
    setTimeout(() => {
      if (index === this.files.length) {
        return;
      } else {
        // const progressInterval = setInterval(() => {
        //   if (this.files[index].progress === 100) {
        //     clearInterval(progressInterval);
        //     this.uploadFilesSimulator(index + 1);
        //   } else {
        //     this.files[index].progress += 5;
        //   }
        // }, 200);
      }
    }, 1000);
  }

  /**
   * Convert Files list to normal array list
   * @param files (Files List)
   */
  prepareStudentDeliveriesFileList(files: Array<any>) {
    if (files.length > 3 || this.currentStudentDeliveryControl.length >= 3) {
      this.sharedService.throwError(
        'Max number of files 3! Please consider deleting some.'
      );
      return;
    }

    for (const item of files) {
      // item.progress = 0;
      this.files.push(item);
    }

    for (let i = 0; i < files.length; i++) {
      let currentStudentDeliveryFile = {
        name: files[i].name,
        filePath: files[i],
        fileType: files[i].type,
      };
      this.currentStudentDeliveryControl.push(
        this.createStudentDelivery(currentStudentDeliveryFile)
      );

      // update and validate the image field value
      this.currentStudentDeliveryControl.updateValueAndValidity();
    }

    this.uploadFilesSimulator(0);
  }

  /**
   * Convert Files list to normal array list
   * @param files (Files List)
   */
  prepareMaterialFilesList(files: Array<any>) {
    // if (files.length > 3 || this.materialsControl.length >= 3) {
    //   this.sharedService.throwError(
    //     'Max number of files 3! Please consider deleting some.'
    //   );
    //   return;
    // }

    for (const item of files) {
      // item.progress = 0;
      this.files.push(item);
    }

    for (let i = 0; i < files.length; i++) {
      let currentMaterialFile = {
        name: files[i].name,
        filePath: files[i],
        fileType: files[i].type,
      };
      this.materialsControl.push(this.createMaterial(currentMaterialFile));

      // update and validate the image field value
      this.materialsControl.updateValueAndValidity();
    }
    this.uploadFilesSimulator(0);
  }

  /**
   * Convert Files list to normal array list
   * @param files (Files List)
   */
  prepareAssignmentFileList(files: Array<any>) {
    if (files.length > 1) {
      this.sharedService.throwError('Only one file is permitted!');
      return;
    }

    const file = files[0];

    this.currentControl.patchValue({
      filePath: file,
      fileType: file.type,
    });

    // update and validate the image field value
    this.currentControl.updateValueAndValidity();

    this.uploadFilesSimulator(0);
  }

  /**
   * format bytes
   * @param bytes (File size in bytes)
   * @param decimals (Decimals point)
   */
  formatBytes(bytes, decimals) {
    if (bytes === 0) {
      return '0 Bytes';
    }
    const k = 1024;
    const dm = decimals <= 0 ? 0 : decimals || 2;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  // initialize a form control
  createStudentDelivery(studentDelivery: StudentDeliveryFile): FormGroup {
    return this.formBuilder.group({
      name: studentDelivery.name,
      lastUpdate: studentDelivery.lastUpdate,
      filePath: studentDelivery.filePath,
      fileType: studentDelivery.fileType,
      id: studentDelivery.id,
      courseId: studentDelivery.courseId,
      assignmentId: studentDelivery.assignmentId,
    });
  }

  // initialize a form control
  createMaterial(material: Material): FormGroup {
    return this.formBuilder.group({
      name: material.name,
      lastUpdate: material.lastUpdate,
      filePath: material.filePath,
      fileType: material.fileType,
      id: material.id,
      courseId: material.courseId,
      assignmentId: material.assignmentId,
      creatorId: material.creatorId,
    });
  }
  // initialize a form control
  createAssignmnet(assignment: Assignment): FormGroup {
    return this.formBuilder.group({
      title: assignment.title,
      lastUpdate: assignment.lastUpdate,
      filePath: assignment.filePath,
      fileType: assignment.fileType,
      id: assignment.id,
      courseId: assignment.courseId,
      instructorId: assignment.instructorId,
    });
  }
}
