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
  studentDeliveriesControl: FormControl;
  materialFormArray: FormArray;
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
          console.log(this.studentDeliveriesControl);
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
      materials: this.currentAssignmentControl.value.materials,
    };

    console.log(currentAssignment);
    console.log(this.currentAssignmentControl);

    if (!this.currentAssignmentControl.value.materials) {
      this.sharedService.throwError('No materials to upload');

      return;
    }

    this.assignmentService
      .getAssignments(
        this.assignmentsPerPage,
        this.currentPage,
        currentAssignment.courseId as string
      )
      .subscribe((response) => {
        if (this.assingnmentIndex > response.maxAssignments - 1) {
          this.sharedService.throwError('Please save the assignment first!');

          return;
        }

        // if the assignment is saved and has gained an id from mongodb
        this.materialsService
          .getMaterials(
            currentAssignment.courseId as string,
            currentAssignment.id
          )
          .subscribe((fetchedMaterials) => {
            if (fetchedMaterials) {
              this.materials = fetchedMaterials.materials;
              this.totalMaterials = fetchedMaterials.maxMaterials;

              console.log(this.assingnmentIndex, this.totalMaterials);
            }

            this.isLoading = true;
            this.materialsService
              .addMaterials(currentAssignment)
              .subscribe((responseData) => {
                console.log(responseData);

                const currentControl = (
                  this.assignmentsForm.get('assignmentsFormArray') as FormArray
                ).get(`${this.assingnmentIndex}`) as FormControl;

                // change the form values with the new values for web view
                currentControl.patchValue({
                  materials: responseData.updatedMaterials,
                });

                // update and validate the image field value
                currentControl.updateValueAndValidity();
                this.deleteAllFiles();

                this.materialsService.onMaterialsUpdate(
                  responseData.updatedMaterials
                );
              });

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
      materials: this.currentAssignmentControl.value.materials,
    };

    console.log(currentAssignment);
    console.log(this.currentAssignmentControl);

    // throw error if user has clicked submit without selecting any files
    if (this.studentDeliveriesControl.value.length < 1) {
      this.sharedService.throwError('Please add some files first!');

      return;
    }
    // 1) check if the assignment is saved in the db
    this.assignmentService
      .getAssignments(
        this.assignmentsPerPage,
        this.currentPage,
        currentAssignment.courseId as string
      )
      .subscribe((response) => {
        console.log(response);
        // 1a) if no, throw an error message
        if (this.assingnmentIndex > response.maxAssignments - 1) {
          this.sharedService.throwError('Please save the assignment first!');

          return;
        }
        //2) If yes, get it's delivery files
        this.studentDeliveriesService
          .getMyStudentDeliveryFiles(
            currentAssignment.courseId as string,
            currentAssignment.id
          )
          .subscribe((response) => {
            console.log(response);

            let studentDeliveryFiles: StudentDeliveryFile[] = [];
            // 3) if there are allready delivery files in the db push the new to the existing
            if (response.totalDeliveries > 0) {
              console.log(response.studentDeliveryFiles);
              studentDeliveryFiles = response.studentDeliveryFiles;

              for (let i = 0; i < studentDeliveryFiles.length; i++) {
                studentDeliveryFiles.push(
                  this.studentDeliveriesControl.value[i]
                );
              }
            } else {
              // if there are not any previous delivery files, assign the new one
              studentDeliveryFiles = this.studentDeliveriesControl.value;
            }
            console.log(studentDeliveryFiles);

            this.isLoading = true;
            this.studentDeliveriesService
              .addStudentDeliveryFiles(
                currentAssignment,
                studentDeliveryFiles,
                response.totalDeliveries
              )
              .subscribe((responseData) => {
                console.log(responseData);

                // change the form values with the new values for web view
                this.studentDeliveriesControl.patchValue({
                  studentDeliveries: responseData.studentDeliveryFiles,
                });

                // update and validate the image field value
                this.studentDeliveriesControl.updateValueAndValidity();

                this.studentDeliveriesService.onStudentDeliveriesUpdate(
                  responseData.studentDeliveryFiles
                );
                this.deleteAllFiles();
              });

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
  deleteFile(index: number) {
    this.files.splice(index, 1);
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
  prepareMaterialFilesList(files: Array<any>) {
    for (const item of files) {
      item.progress = 0;
      this.files.push(item);
    }

    let currentMaterials: Material[] =
      this.currentAssignmentControl.value.materials;
    console.log(currentMaterials);

    // if there pre-exist materials add the new
    if (currentMaterials) {
      for (let i = 0; i < files.length; i++) {
        currentMaterials.push({
          name: files[i].name,
          filePath: files[i],
          fileType: files[i].type,
          lastUpdate: this.sharedService.toHumanDateTime(new Date().toString()),
          assignmentId: this.currentAssignmentControl.value.id,
          courseId: this.currentAssignmentControl.value.courseId,
        });
      }
    } else {
      currentMaterials = [];

      //or assign the new files
      for (let i = 0; i < files.length; i++) {
        currentMaterials.push({
          name: files[i].name,
          filePath: files[i],
          fileType: files[i].type,
          lastUpdate: this.sharedService.toHumanDateTime(new Date().toString()),
          assignmentId: this.currentAssignmentControl.value.id,
          courseId: this.currentAssignmentControl.value.courseId,
        });
      }
    }

    // change the value of a single form control with the name filePath
    this.currentAssignmentControl.patchValue({
      materials: currentMaterials,
    });

    // update and validate the image field value
    this.currentAssignmentControl.updateValueAndValidity();

    console.log(this.currentAssignmentControl);

    this.uploadFilesSimulator(0);
  }

  /**
   * Convert Files list to normal array list
   * @param files (Files List)
   */
  prepareStudentDeliveriesFileList(files: Array<any>) {
    if (files.length > 3) {
      this.sharedService.throwError(
        'Max number of files 3! Please consider deleting some.'
      );
      return;
    }

    for (const item of files) {
      item.progress = 0;
      this.files.push(item);
    }

    let currentDeliveries: StudentDeliveryFile[] = [];

    console.log(this.studentDeliveriesControl);

    // if there pre-exist deliveries add the new
    if (this.studentDeliveriesControl) {
      currentDeliveries = this.studentDeliveriesControl.value.studentDeliveries;

      for (let i = 0; i < files.length; i++) {
        currentDeliveries.push({
          name: files[i].name,
          filePath: files[i],
          fileType: files[i].type,
          lastUpdate: this.sharedService.toHumanDateTime(new Date().toString()),
        });
      }

      // change the value of a single form control with the name filePath
      this.studentDeliveriesControl.patchValue({
        studentDeliveries: currentDeliveries,
      });

      // update and validate the image field value
      this.studentDeliveriesControl.updateValueAndValidity();
    } else {
      //or assign the new files
      currentDeliveries = [];

      for (let i = 0; i < files.length; i++) {
        currentDeliveries.push({
          name: files[i].name,
          filePath: files[i],
          fileType: files[i].type,
          lastUpdate: this.sharedService.toHumanDateTime(new Date().toString()),
        });
      }

      this.studentDeliveriesControl = new FormControl(currentDeliveries);
    }

    console.log(currentDeliveries);

    console.log(this.studentDeliveriesControl);

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
}
