import { Component } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { HeaderService } from 'src/app/header/header.service';
import { AssignmentsService } from '../../assignment.service';
import { handleFileUpload, ViewerType } from 'ngx-doc-viewer';

@Component({
  selector: 'app-doc-viewer',
  templateUrl: './doc-viewer.component.html',
  styleUrls: ['./doc-viewer.component.css'],
})
export class DocViewerComponent {
  // docFilePath: string;
  filePreview: string;
  docRelPath;
  docPath;
  googlePreviewer = 'https://docs.google.com/gview?url=%URL%&embedded=true';

  constructor(
    private assignmentService: AssignmentsService,
    private headerService: HeaderService,
    public route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.headerService.disableHeader();
    this.route.paramMap.subscribe((paraMap: ParamMap) => {
      if (paraMap.has('filePath')) {
        this.docPath = paraMap.get('filePath');

        // console.log(this.docPath);
        // this.docRelPath = `files/${paraMap
        //   .get('filePath')
        //   .split('/')
        //   .slice(-1)
        //   .pop()}`;

        // this.assignmentService.readFile(this.docRelPath).subscribe((data) => {
        //   const reader = new FileReader();
        //   reader.onload = () => {
        //     this.filePreview = reader.result as string;
        //     console.log(this.filePreview);
        //   };
        //   reader.readAsDataURL(data);
        // });
      } else {
        throw new Error('no doc file provided');
      }
    });
  }
}
