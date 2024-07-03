import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UploadFileToAWSS3 } from '@utils/fileupload.utils';
import { ResponseManager } from '@utils/response.manager.utils';

@Injectable()
export class HelpersService {
  public async uploadFile(file: Express.Multer.File) {
    try {
      const upload = await UploadFileToAWSS3(file.path, file.originalname, 'documents/');
      const result = {
        ...upload,
        size: file.size,
        originalname: file.originalname,
        mimetype: file.mimetype,
      }
      return ResponseManager.standardResponse({
        message: `File uploaded`,
        status: HttpStatus.OK,
        statusText: `success`,
        data: result
      })

    } catch (error) {
      throw new HttpException({
        message: "Unknown error has occured",
        statusText: "error",
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        data: error
      }, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
}
