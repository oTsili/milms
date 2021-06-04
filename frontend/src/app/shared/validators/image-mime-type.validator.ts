import { AbstractControl } from '@angular/forms';
import { Observable, Observer, of } from 'rxjs';

export const imgMimeType = (
  control: AbstractControl
): Promise<{ [key: string]: any }> | Observable<{ [key: string]: any }> => {
  if (typeof control.value === 'string') {
    return of(null);
  }

  if (control.value) {
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
          // switch between mime types of jpeg,png and other image mime types
          switch (header) {
            // jpeg/jpg/png, etc magic numbers (file signature)
            case '89504e47':
            case 'ffd8ffe0':
            case 'ffd8ffe1':
            case 'ffd8ffe2':
            case 'ffd8ffe3':
            case 'ffd8ffe8':
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
  } else {
    return of(null);
  }
};
