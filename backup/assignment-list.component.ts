import { Component, OnDestroy, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Subscription } from 'rxjs';
import { saveAs } from 'file-saver';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import {
  FormControl,
  FormGroup,
  Validators,
  FormBuilder,
  FormArray,
} from '@angular/forms';

import { AuthService } from 'src/app/auth/auth.service';
import { Assignment } from '../assignment.model';
import { AssignmentsService } from '../assignment.service';
import { assignmentMimeType } from '../../../shared/validators/assignment-mime-type.validator';

@Component({
  selector: 'app-assignment-list',
  templateUrl: './assignment-list.component.html',
  styleUrls: [
    './assignment-list.component.css',
    './assignment-list.component.scss',
  ],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition(
        'expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ),
    ]),
  ],
})
export class AssignmentListComponent implements OnInit, OnDestroy {
  assignments: Assignment[] = [];
  isLoading = false;
  totalAssignments = 0;
  assignmentsPerPage = 5;
  currentPage = 1;
  pageSizeOptions: number[] = [5, 10, 25, 100];
  userIsAuthenticated = false;
  userId: string;
  private assignmentSub: Subscription;
  private authStatusSub: Subscription;
  private editButtonSub: Subscription;
  private filePickedSub: Subscription;
  pdfImgPath: string = '../../../../assets/images/pdf-icon1.png';
  docImgPath: string = '../../../../assets/images/doc-icon.png';
  form: FormGroup;
  assignmentsForm: FormGroup;
  editIsEnabled: boolean = false;
  lastUpdate: string;
  // /////////////////////
  dataSource;
  columnsToDisplay = ['title', 'userName', 'lastUpdate'];
  expandedElement: Assignment | null;
  fileType: string;
  fileTitle: string;
  filePathVar: string;
  filePicked: boolean = false;
  assignmentControls;
  emptyAssignment = {
    title: '',
    description: '',
    filePath: '',
  };

  constructor(
    public assignmentService: AssignmentsService,
    private authService: AuthService,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit() {
    this.assignmentsForm = this.formBuilder.group({
      assignmentsFormArray: this.formBuilder.array([
        this.createItem(this.emptyAssignment),
      ]),
      exampleFormArray: this.formBuilder.array([
        this.createItem(this.emptyAssignment),
      ]),
    });
    this.filePickedSub = this.assignmentService
      .getFilePickedListener()
      .subscribe((picked) => {
        this.filePicked = picked;
      });
    this.editButtonSub = this.assignmentService
      .getEditListener()
      .subscribe((enabled) => {
        this.editIsEnabled = enabled;
      });
    this.isLoading = true;
    this.assignmentService.getAssignments(
      this.assignmentsPerPage,
      this.currentPage
    );
    this.userId = this.authService.getUserId();
    this.assignmentSub = this.assignmentService
      .getAssignmentUpdateListener()
      .subscribe(
        (assignmentData: {
          assignments: Assignment[];
          assignmentCount: number;
        }) => {
          this.isLoading = false;
          this.totalAssignments = assignmentData.assignmentCount;
          this.assignments = assignmentData.assignments;

          this.restoreFirstItem(this.assignments);
          for (let i = 1; i < this.assignments.length; i++) {
            this.addItem(this.assignments[i]);
          }

          // console.log(this.assignments);

          // this.form = new FormGroup({});
          // for (let [index, val] of this.assignments.entries()) {
          //   console.log(val);
          //   this.form.addControl(
          //     `title-${index}`,
          //     new FormControl(val.title, [
          //       Validators.required,
          //       Validators.minLength(3),
          //     ])
          //   );
          //   this.form.addControl(
          //     `description-${index}`,
          //     new FormControl(val.description, [Validators.required])
          //   );
          //   this.form.addControl(
          //     `filePath-${index}`,
          //     new FormControl(null, {
          //       asyncValidators: [assignmentMimeType],
          //     })
          //   );
          //   console.log(this.form.get(`filePath-${index}`));
          // }
          // console.log(this.form);
          this.dataSource = this.assignments;
        }
      );
    // this.userIsAuthenticated = this.authService.getIsAuth(true);
    this.authStatusSub = this.authService
      .getAuthStatusListener()
      .subscribe((isAuthenticated) => {
        this.userIsAuthenticated = isAuthenticated;
        this.userId = this.authService.getUserId();
      });
  }

  createItem(item): FormGroup {
    return this.formBuilder.group({
      title: item.title,
      description: item.description,
      filePath: item.filePath,
    });
  }

  restoreFirstItem(item: Assignment[]) {
    this.assignmentControls = this.assignmentsForm.get(
      'assignmentsFormArray'
    ) as FormArray;

    this.assignmentControls.insert(0, item[0]);
  }

  addItem(item = this.emptyAssignment): void {
    this.assignmentControls = this.assignmentsForm.get(
      'assignmentsFormArray'
    ) as FormArray;
    this.assignmentControls.push(this.createItem(item));
  }

  onChangePage(pageData: PageEvent) {
    // console.log(this.assignments);
    this.isLoading = true;
    this.currentPage = pageData.pageIndex + 1;
    this.assignmentsPerPage = pageData.pageSize;
    this.assignmentService.getAssignments(
      this.assignmentsPerPage,
      this.currentPage
    );
  }

  onDelete(assignmentId: string) {
    this.isLoading = true;
    this.assignmentService.deleteAssignment(assignmentId).subscribe(
      () => {
        this.assignmentService.getAssignments(
          this.assignmentsPerPage,
          this.currentPage
        );
      },
      () => {
        this.isLoading = false;
      }
    );
  }

  onDownload(filePath: string) {
    const flPath = `${filePath.split('/').slice(-1).pop()}`;
    this.isLoading = true;
    this.assignmentService
      .downloadAssignment(`src/files/${flPath}`)
      .subscribe((response: Blob) => {
        saveAs(response, flPath);
        this.isLoading = false;
      });
    // .subscribe(
    //   (response: Blob) => {
    //     // download file
    //     var blob = new Blob([response], { type: 'application/pdf' });
    //     var filename = 'file.pdf';
    //     saveAs(blob, filename);
    //   },
    //   (error) => {
    //     console.error(`Error: ${error.message}`);
    //   }
    // );
  }

  ngOnDestroy() {
    this.assignmentSub.unsubscribe();
    this.authStatusSub.unsubscribe();
    this.editButtonSub.unsubscribe();
    this.filePickedSub.unsubscribe();
  }

  getFloor(number: number) {
    return Math.floor(number);
  }

  permitEdit(event: Event) {
    this.assignmentService.enableEdit();
  }

  onSaveAssignment(assignment) {
    // this.assignmentControls = this.assignmentsForm.get(
    //   'assignmentsFormArray'
    // ) as FormArray;
    // this.assignmentControls.push(this.createItem());

    if (this.form.invalid) {
      console.log(this.form);
      console.log('Invalid form');
      return;
    }
    console.log(this.filePicked);

    // get the current date
    var m = new Date();
    var dateString = `${m.getUTCFullYear()}/${
      m.getUTCMonth() + 1
    }/${m.getUTCDate()} ${String(
      m.getUTCHours() + 2
    )}:${m.getUTCMinutes()}:${m.getUTCSeconds()}`;

    // console.log(dateString);

    this.lastUpdate = dateString;

    this.isLoading = true;

    console.log(this.assignmentsForm);

    // console.log(
    //   assignment.id,
    //   title,
    //   description,
    //   filePath,
    //   this.fileType,
    //   this.lastUpdate
    // );

    // this.assignmentService.updateAssignment(
    //   assignment.id,
    //   title,
    //   description,
    //   filePath,
    //   this.fileType,
    //   this.lastUpdate
    // );
    // this.filePathVar = filePath;
    // this.editIsEnabled = false;
    // this.isLoading = false;
  }
  getIndex(): number {
    return this.totalAssignments;
  }

  print(item: any): void {
    console.log(item);
  }

  onFilePicked(event: Event, index: number) {
    this.assignmentService.imgPicked();

    let assignemtIndex = Math.floor(index);
    // const fileControl = this.form.controls[`filePath-${assignemtIndex}`];

    // get the file
    const file = (event.target as HTMLInputElement).files[0];

    this.fileType = file.type;

    // assign an async validator to the file control of the formGroup
    // fileControl.setValidators([assignmentMimeType]);

    // change the value of a single form control with the name filePath
    this.form.patchValue({
      name: `filePath-${assignemtIndex}`,
      filePath: file,
    });

    // update and validate the image field value
    this.form.get(`filePath-${assignemtIndex}`).updateValueAndValidity();

    // convert the file to data-url in order to be used in src property on image element
    const reader = new FileReader();
    reader.onload = () => {
      this.fileTitle = file.name;
    };

    reader.readAsDataURL(file);
  }
}
