import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { pdfDefaultOptions } from 'ngx-extended-pdf-viewer';
import { HeaderService } from 'src/app/header/header.service';

@Component({
  selector: 'app-pdf-viewer',
  templateUrl: './pdf-viewer.component.html',
})
export class PdfViewerComponent implements OnInit {
  public pdfFile: string;

  constructor(
    public route: ActivatedRoute,
    private headerService: HeaderService
  ) {
    // pdfDefaultOptions.assetsFolder = 'bleeding-edge';
  }

  ngOnInit() {
    this.headerService.disableHeader();
    this.route.paramMap.subscribe((paraMap: ParamMap) => {
      if (paraMap.has('filePath')) {
        this.pdfFile = paraMap.get('filePath');
      } else {
        throw new Error('no pdf file provided');
      }
    });
  }
}
