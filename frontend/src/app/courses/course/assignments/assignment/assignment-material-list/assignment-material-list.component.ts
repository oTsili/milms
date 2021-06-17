import { Component, OnDestroy, OnInit } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Subscription } from 'rxjs';
import { Material } from 'src/app/models/material.model';
import { environment } from 'src/environments/environment';
import { AssignmentMaterialsService } from './assignment-materials.service';
@Component({
  selector: 'app-assignment-material-list',
  templateUrl: './assignment-material-list.component.html',
  styleUrls: ['./assignment-material-list.component.css'],
})
export class AssignmentMaterialsComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = ['position', 'name', 'lastUpdate', 'options'];

  courseId: string;
  assignmentId: string;
  isLoading: boolean = false;
  materials: Material[];
  dataSource;
  materialUpdateSubscription: Subscription;
  totalMaterials = environment.TOTAL_COURSES;
  materialsPerPage = environment.COURSES_PER_PAGE;
  currentPage = environment.CURRENT_PAGE;
  constructor(
    // private controlContainer: ControlContainer,
    public route: ActivatedRoute,
    private assignmentMaterialsService: AssignmentMaterialsService
  ) {}
  ngOnInit() {
    this.route.paramMap.subscribe((paraMap: ParamMap) => {
      if (paraMap.has('courseId') && paraMap.has('assignmentId')) {
        this.courseId = paraMap.get('courseId');
        this.assignmentId = paraMap.get('assignmentId');
      } else {
        // throw new Error('no course id provided');
        console.log('no assignment id or course id provided');
      }
    });

    console.log(this.courseId, this.assignmentId);

    this.materialUpdateSubscription = this.assignmentMaterialsService
      .getAssignmentMaterialListener()
      .subscribe((materials) => {
        this.assignmentMaterialsService
          .getAssignmentMaterials(
            this.materialsPerPage,
            this.currentPage,
            this.courseId,
            this.assignmentId
          )
          .subscribe((response) => {
            this.materials = response.materials;
            this.totalMaterials = response.maxMaterials;
            this.dataSource = new MatTableDataSource(this.materials);
          });
      });

    // fetch the materials
    this.assignmentMaterialsService
      .getAssignmentMaterials(
        this.materialsPerPage,
        this.currentPage,
        this.courseId,
        this.assignmentId
      )
      .subscribe((response) => {
        console.log(response);

        this.materials = response.materials;
        this.totalMaterials = response.maxMaterials;
        this.dataSource = new MatTableDataSource(this.materials);
        console.log(this.materials);
      });
  }
  ngOnDestroy() {
    // this.assignmentIdUpdateSub.unsubscribe();
    this.materialUpdateSubscription.unsubscribe();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  // fetches the assignments sorted with regard the 'sort.active' value
  sortData(sort: Sort) {
    if (!sort.active || sort.direction === '') {
      this.materials = this.materials.slice();
      return;
    }

    this.isLoading = true;
    this.assignmentMaterialsService
      .getAssignmentMaterials(
        this.materialsPerPage,
        this.currentPage,
        this.courseId,
        this.assignmentId,
        sort
      )
      .subscribe((response) => {
        this.materials = response.materials;
        // this.clearFormArray(this.assignmentControls);
        // for (let i = 0; i < this.assignments.length; i++) {
        //   this.addItem(this.assignments[i]);
        // }
        this.isLoading = false;
      });
  }

  // deletes a material with regard it's index
  onDeleteAssignmentMaterial(material: Material, materialIndex: number) {
    console.log('material: ', material);

    // this.currentAssignmentControl = (
    //   this.assignmentsForm.get('assignmentsFormArray') as FormArray
    // ).get(`${this.assingnmentIndex}`) as FormControl;

    this.isLoading = true;
    this.assignmentMaterialsService
      .deleteAssignmentMaterial(material)
      .subscribe(
        (response) => {
          console.log('response: ', response);
          console.log(this.materials);
          this.materials.splice(materialIndex, 1);
          console.log(this.materials);
          this.dataSource = new MatTableDataSource(this.materials);
          this.isLoading = false;
        },
        (err) => {
          console.log(err);
          this.isLoading = false;
        }
      );
  }

  ondDownloadAssignmentMaterial(material: Material) {
    this.isLoading = true;
    this.assignmentMaterialsService
      .downloadAssignmentMaterial(material)
      .subscribe((response: Blob) => {
        saveAs(response, material.name);
        this.isLoading = false;
      });
  }
}
