import { memoryStorage } from 'multer';

export const multerOptions = {
  storage: memoryStorage(), //! first file remain in RAM buffer after upload
  limits: {
    fileSize: 1000 * 1024 * 1024, //! 1GB
  },
};
