import multer from 'multer';
import { Request } from 'express';
import { MimeValidationError } from '../errors/invalid-mime-error';

const storage = (mimeTypeMap: { [key: string]: any }, folder: string) => {
  return multer.diskStorage({
    destination: (
      req: Request,
      file: Express.Multer.File,
      cb: { (error: Error | null, destination: string): void }
    ) => {
      // throw a specific error from the middlewares of common library I have published
      const isValid = mimeTypeMap[file.mimetype]!;
      let error = new MimeValidationError();
      if (isValid) {
        error = null as any;
      }
      cb(error, folder);
    },
    filename: (
      req: Request,
      file: Express.Multer.File,
      cb: { (error: Error | null, destination: string): void }
    ) => {
      const name = file.originalname.toLowerCase().split(' ').join('-');
      const ext = mimeTypeMap[file.mimetype];
      cb(null, `${name}-${Date.now()}.${ext}`);
    },
  });
};

const extractFile = (
  MIME_TYPE_MAP: { [key: string]: any },
  folder: string,
  formName: string
) => multer({ storage: storage(MIME_TYPE_MAP, folder) }).single(formName);

export { extractFile };
