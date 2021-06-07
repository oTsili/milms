import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import {
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
  FormArray,
  ControlContainer,
} from '@angular/forms';

import { AssignmentsService } from '../../courses/assignments/assignment.service';
import { assignmentMimeType } from '../validators/assignment-mime-type.validator';
import { Material } from '../../models/material.model';
import { Assignment } from '../../models/assignment.model';
import { MaterialsService } from '../../courses/assignments/assignment-list/material-list/materials.service';
import { SharedService } from '../services/shared.service';
import { StudentDeliveryFile } from 'src/app/models/student-delivery.model';
import { StudentDeliveriesService } from '../../courses/assignments/assignment-list/student-deliveries/student-deliveries.service';
import { StudentDeliveryAssignment } from '../../models/student-delivery.model';

@Component({
  selector: 'app-dragAndDrop',
  templateUrl: './dragAndDrop.component.html',
  styleUrls: ['./dragAndDrop.component.scss', './dragAndDrop.component.css'],
})
export class DragAndDropComponent implements OnInit {
  @Input() assingnmentIndex;
  @Input() component;
  materials: Material[];
  studentDeliveries: StudentDeliveryAssignment[];
  studentDeliveryFiles: StudentDeliveryFile[];
  files: any[] = [];
  isLoading: boolean = false;
  courseId: string;
  assignmentId: string;
  studentId: string;
  currentAssignmentControl: FormControl;
  studentDeliveriesForm: FormGroup;
  currentStudentDeliveryControl: FormArray;
  materialsForm: FormGroup;
  materialsControl: FormArray;
  assignmentsForm: FormGroup;
  emptyMaterial = {
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
    private assignmentService: AssignmentsService,
    private materialsService: MaterialsService,
    private studentDeliveriesService: StudentDeliveriesService,
    private formBuilder: FormBuilder,
    public route: ActivatedRoute,
    private controlContainer: ControlContainer,
    private sharedService: SharedService
  ) {}

  ngOnInit() {
    this.assignmentsForm = <FormGroup>this.controlContainer.control;

    this.currentAssignmentControl = (
      this.assignmentsForm.get('assignmentsFormArray') as FormArray
    ).get(`${this.assingnmentIndex}`) as FormControl;

    this.assignmentId = this.currentAssignmentControl.value.id;

    console.log(this.assignmentId);
    console.log(this.component);

    this.route.paramMap.subscribe((paraMap: ParamMap) => {
      if (paraMap.has('courseId')) {
        this.courseId = paraMap.get('courseId');
      } else {
        throw new Error('no course id provided');
      }
    });

    this.studentDeliveriesForm = this.formBuilder.group({
      studentDeliveriesFormArray: this.formBuilder.array([]),
    });

    this.currentStudentDeliveryControl = this.studentDeliveriesForm.get(
      'studentDeliveriesFormArray'
    ) as FormArray;

    this.materialsForm = this.formBuilder.group({
      materialsFormArray: this.formBuilder.array([]),
    });

    this.materialsControl = this.materialsForm.get(
      'materialsFormArray'
    ) as FormArray;

    console.log(this.currentAssignmentControl);
    console.log(this.assingnmentIndex);
    console.log(this.assignmentsForm);
  }

  /**
   * on file drop handler
   */
  onFileDropped($event) {
    this.assignmentService
      .getAssignments(this.assignmentsPerPage, this.currentPage, this.courseId)
      .subscribe((response) => {
        if (this.assingnmentIndex > response.maxAssignments - 1) {
          this.sharedService.throwError('Please save the assignment first!');

          return;
        }

        if (this.component === 'material') {
          this.prepareMaterialFilesList($event);
          // materials update the assignment control
          console.log(this.currentAssignmentControl);
        } else if (this.component === 'student-deliveries') {
          this.prepareStudentDeliveriesFileList($event);
          // deliveries update the deliveries control
        }
      });
  }

  onSubmitMaterials(event: Event) {
    const currentAssignment: Assignment = {
      courseId: this.currentAssignmentControl.value.courseId,
      id: this.currentAssignmentControl.value.id,
      title: this.currentAssignmentControl.value.title,
      description: this.currentAssignmentControl.value.description,
      filePath: this.currentAssignmentControl.value.filePath,
      fileType: this.currentAssignmentControl.value.fileType,
      lastUpdate: this.currentAssignmentControl.value.lastUpdate,
    };

    // throw error if user has clicked submit without selecting any files
    if (this.materialsControl.length < 1) {
      this.sharedService.throwError('Please add some files first!');

      return;
    }
    this.isLoading = true;
    // 1) check if the assignment is saved in the db
    this.assignmentService
      .getAssignments(
        this.assignmentsPerPage,
        this.currentPage,
        currentAssignment.courseId as string
      )
      .subscribe((response) => {
        // 1a) if no, throw an error message
        if (this.assingnmentIndex > response.maxAssignments - 1) {
          this.sharedService.throwError('Please save the assignment first!');

          return;
        }

        this.materialsService
          .addMaterials(currentAssignment, this.materialsControl)
          .subscribe((responseData) => {
            this.materialsService.onMaterialsUpdate(responseData.materialFiles);
            this.deleteAllFiles();
            this.isLoading = false;
          });
      });
  }

  onSubmitMyDelivery(event: Event) {
    const currentAssignment: Assignment = {
      courseId: this.currentAssignmentControl.value.courseId,
      id: this.currentAssignmentControl.value.id,
      title: this.currentAssignmentControl.value.title,
      description: this.currentAssignmentControl.value.description,
      filePath: this.currentAssignmentControl.value.filePath,
      fileType: this.currentAssignmentControl.value.fileType,
      lastUpdate: this.currentAssignmentControl.value.lastUpdate,
    };

    // throw error if user has clicked submit without selecting any files
    if (this.currentStudentDeliveryControl.length < 1) {
      this.sharedService.throwError('Please add some files first!');

      return;
    }
    this.isLoading = true;

    // 1) check if the assignment is saved in the db
    this.assignmentService
      .getAssignments(
        this.assignmentsPerPage,
        this.currentPage,
        currentAssignment.courseId as string
      )
      .subscribe((response) => {
        // 1a) if no, throw an error message
        if (this.assingnmentIndex > response.maxAssignments - 1) {
          this.sharedService.throwError('Please save the assignment first!');

          return;
        }
        this.studentDeliveriesService
          .addStudentDeliveryFiles(
            currentAssignment,
            this.currentStudentDeliveryControl
          )
          .subscribe((responseData) => {
            this.studentDeliveriesService.onStudentDeliveriesUpdate(
              responseData.studentDeliveryFiles
            );
            this.deleteAllFiles();
            this.isLoading = false;
          });
      });
  }

  /**
   * handle file from browsing
   */
  fileBrowseHandler(files) {
    this.assignmentService
      .getAssignments(this.assignmentsPerPage, this.currentPage, this.courseId)
      .subscribe((response) => {
        if (this.assingnmentIndex > response.maxAssignments - 1) {
          this.sharedService.throwError('Please save the assignment first!');

          return;
        }

        if (this.component === 'material') {
          this.prepareMaterialFilesList(files);
        } else if (this.component === 'student-deliveries') {
          this.prepareStudentDeliveriesFileList(files);
        }

        console.log(this.currentAssignmentControl);
      });
  }

  /**
   * Delete file from files list
   * @param index (File index)
   */
  deleteMaterialFile(index: number) {
    this.files.splice(index, 1);
  }

  deleteStudentDeliveryFile(index: number) {
    this.files.splice(index, 1);
    this.currentStudentDeliveryControl.removeAt(index);
  }

  deleteAllFiles() {
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
        const progressInterval = setInterval(() => {
          if (this.files[index].progress === 100) {
            clearInterval(progressInterval);
            this.uploadFilesSimulator(index + 1);
          } else {
            this.files[index].progress += 5;
          }
        }, 200);
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
      item.progress = 0;
      this.files.push(item);
    }

    console.log(this.currentStudentDeliveryControl);

    for (let i = 0; i < files.length; i++) {
      let currentStudentDeliveryFile = {
        name: files[i].name,
        filePath: files[i],
        fileType: files[i].type,
        lastUpdate: this.sharedService.toHumanDateTime(new Date().toString()),
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
    if (files.length > 3 || this.materialsControl.length >= 3) {
      this.sharedService.throwError(
        'Max number of files 3! Please consider deleting some.'
      );
      return;
    }

    for (const item of files) {
      item.progress = 0;
      this.files.push(item);
    }

    console.log(this.materialsControl);

    for (let i = 0; i < files.length; i++) {
      let currentMaterialFile = {
        name: files[i].name,
        filePath: files[i],
        fileType: files[i].type,
        lastUpdate: this.sharedService.toHumanDateTime(new Date().toString()),
      };
      this.materialsControl.push(this.createMaterial(currentMaterialFile));

      // update and validate the image field value
      this.materialsControl.updateValueAndValidity();
    }

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
}
