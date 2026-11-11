import { ValidationError } from '@errors/app-error'
import type { RequestHandler } from 'express'
import multer from 'multer'

export interface IUploadFileOptions {
  fieldName: string
  maxSizeBytes: number
  allowedMimeTypes: readonly string[]
}

export const createUploadFileMiddleware = (options: IUploadFileOptions): RequestHandler => {
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: options.maxSizeBytes, files: 1, fields: 10 },
    fileFilter: (_request, file, callback) => {
      if (!options.allowedMimeTypes.includes(file.mimetype)) {
        return callback(
          new ValidationError(`File type ${file.mimetype} is not allowed`, { code: 'UNSUPPORTED_FILE_TYPE' }),
        )
      }

      callback(null, true)
    },
  }).single(options.fieldName)

  return (request, response, next) => {
    upload(request, response, (error?: unknown) => {
      if (error) {
        return next(error)
      }

      if (!request.file) {
        return next(new ValidationError('File not uploaded or not correct', { code: 'FILE_REQUIRED' }))
      }

      next()
    })
  }
}
