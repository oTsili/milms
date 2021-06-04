import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import {
  ControlContainer,
  FormGroup,
  FormControl,
  FormArray,
} from '@angular/forms';
import { Material } from '../../../../models/material.model';
import { MaterialsService } from './materials.service';
import { Subscription } from 'rxjs';
import { SharedService } from '../../../../shared/services/shared.service';
import { AssignmentsService } from '../../assignment.service';

@Component({
  selector: 'app-material-list',
  styleUrls: ['./material-list.component.css'],
  templateUrl: './material-list.component.html',
})
export class MaterialListComponent implements OnInit, OnDestroy {
  @Input() assingnmentIndex: number;
  private assignmentIdUpdateSub: Subscription;
  private materialUpdateSub: Subscription;
  assignmentsForm: FormGroup;
  currentAssignmentControl: FormControl;
  materials: Material[];
  courseId: string;
  assignmentId: string;
  isLoading: boolean = false;

  constructor(
    private controlContainer: ControlContainer,
    private materialService: MaterialsService,
    private assignmentsService: AssignmentsService,
  ) {}

  ngOnInit() {
    this.assignmentsForm = <FormGroup>this.controlContainer.control;

    this.currentAssignmentControl = (
      this.assignmentsForm.get('assignmentsFormArray') as FormArray
    ).get(`${this.assingnmentIndex}`) as FormControl;

    // define custom subscriptions
    this.assignmentIdUpdateSub = this.assignmentsService
      .getAssignmentIdListener()
      .subscribe((assignmentId) => {
        this.assignmentId = assignmentId;
      });

    this.materialUpdateSub = this.materialService
      .getMaterialListener()
      .subscribe((materials) => {
        this.materials = materials;
      });

    // save the courseId and the assignmentId from the parent component assignmentForm
    this.courseId = this.currentAssignmentControl.value.courseId;
    this.assignmentId = this.currentAssignmentControl.value.id;

    // if assignment hasn't saved on the db and thus does not have id throw an error
    if (!this.assignmentId) {
      console.log('Please save the assignment first!');
      // this.sharedService.throwError('Please save the assignment first!');

      return;
    }

    // fetch the materials
    this.materialService
      .getMaterials(this.courseId, this.assignmentId)
      .subscribe((response) => {
        console.log(response);

        this.materials = response.materials;
      });
    console.log(this.materials);
  }

  ngOnDestroy() {
    this.assignmentIdUpdateSub.unsubscribe();
    this.materialUpdateSub.unsubscribe();
  }

  // deletes a material with regard it's index
  onDeleteMaterial(material: Material, materialIndex: number) {
    console.log('material: ', material);

    this.currentAssignmentControl = (
      this.assignmentsForm.get('assignmentsFormArray') as FormArray
    ).get(`${this.assingnmentIndex}`) as FormControl;

    this.isLoading = true;
    this.materialService.deleteMaterial(material).subscribe(
      (response) => {
        console.log('response: ', response);
        console.log(this.materials);
        this.materials.splice(materialIndex, 1);
        console.log(this.materials);

        this.isLoading = false;
      },
      (err) => {
        console.log(err);
        this.isLoading = false;
      }
    );
  }

  ondDownloadMaterial(material: Material) {
    this.isLoading = true;
    this.materialService
      .downloadMaterial(material)
      .subscribe((response: Blob) => {
        saveAs(response, material.name);
        this.isLoading = false;
      });
  }
}
