import { CustomError } from './custom-error';

export class MimeValidationError extends CustomError {
  statusCode = 500;
  reason = 'Invalid file type';

  constructor() {
    super('Invalid file type');

    Object.setPrototypeOf(this, MimeValidationError.prototype);
  }

  serializeErrors() {
    return [{ message: this.reason }];
  }
}
