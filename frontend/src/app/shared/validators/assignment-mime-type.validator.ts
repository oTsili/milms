import { AbstractControl } from '@angular/forms';
import { Observable, Observer, of } from 'rxjs';

export const assignmentMimeType = (
  control: AbstractControl
): Promise<{ [key: string]: any }> | Observable<{ [key: string]: any }> => {
  if (typeof control.value === 'string') {
    return of(null);
  }

  const file = control.value as File;
  const fileReader = new FileReader();
  const frObs = Observable.create(
    (observer: Observer<{ [key: string]: any }>) => {
      // get the mime type of the file uploaded
      fileReader.addEventListener('loadend', () => {
        const arr = new Uint8Array(fileReader.result as ArrayBuffer).subarray(
          0,
          4
        );
        let header = '';
        let isValid = false;
        // convert the mime type to hexadecimal string
        for (let i = 0; i < arr.length; i++) {
          header += arr[i].toString(16);
        }
        // console.log(header);

        // switch between mime types of jpeg,png and other image mime types
        switch (header) {
          case 'ECA5C100': //Doc
          case 'd0cf11e0': //DOC
          case 'CF11E0A1': //DOC
          case 'DBA52D00': //DOC
          case 'ECA5C100': //DOC
          case '504b34': //DOCX
            console.log('doc/docx loaded');
            isValid = true;
            break;
          case '25504446': //pdf
            console.log('pdf loaded');
            isValid = true;
            break;

          default:
            isValid = false; // Or you can use the blob.type as fallback
            break;
        }
        if (isValid) {
          observer.next(null);
        } else {
          observer.next({ invalidMimeType: true });
        }
        observer.complete();
      });
      fileReader.readAsArrayBuffer(file);
    }
  );
  return frObs;
};
