import { Component, OnDestroy, OnInit } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Subscription } from 'rxjs';
import { Material } from 'src/app/models/material.model';
import { SharedService } from 'src/app/shared/services/shared.service';
import { environment } from 'src/environments/environment';
import { AssignmentMaterialsService } from './assignment-materials.service';
@Component({
  selector: 'app-assignment-material-list',
  templateUrl: './assignment-material-list.component.html',
  styleUrls: ['./assignment-material-list.component.css'],
})
export class AssignmentMaterialsComponent implements OnInit, OnDestroy {
  userRoleSubscription: Subscription;
  materialUpdateSubscription: Subscription;
  displayedColumns: string[] = ['position', 'name', 'lastUpdate', 'options'];
  userRole: string;
  courseId: string;
  assignmentId: string;
  isLoading: boolean = false;
  materials: Material[];
  dataSource;
  totalMaterials = environment.TOTAL_COURSES;
  materialsPerPage = environment.COURSES_PER_PAGE;
  currentPage = environment.CURRENT_PAGE;
  constructor(
    // private controlContainer: ControlContainer,
    public route: ActivatedRoute,
    private assignmentMaterialsService: AssignmentMaterialsService,
    private sharedService: SharedService
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

    this.sharedService.getUserRole().subscribe((response) => {
      this.userRole = response.userRole;
    });
    this.userRoleSubscription = this.sharedService
      .getUserRoleListener()
      .subscribe((response) => {
        this.userRole = response;
      });

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
        this.materials = response.materials;
        this.totalMaterials = response.maxMaterials;
        this.dataSource = new MatTableDataSource(this.materials);
      });
  }
  ngOnDestroy() {
    // this.assignmentIdUpdateSub.unsubscribe();
    this.materialUpdateSubscription.unsubscribe();
    this.userRoleSubscription.unsubscribe();
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
        this.totalMaterials = response.maxMaterials;
        this.dataSource = new MatTableDataSource(this.materials);

        this.isLoading = false;
      });
  }

  // deletes a material with regard it's index
  onDeleteAssignmentMaterial(material: Material, materialIndex: number) {
    // this.currentAssignmentControl = (
    //   this.assignmentsForm.get('assignmentsFormArray') as FormArray
    // ).get(`${this.assingnmentIndex}`) as FormControl;

    this.isLoading = true;
    this.assignmentMaterialsService
      .deleteAssignmentMaterial(material)
      .subscribe(
        (response) => {
          // fetch the materials
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
