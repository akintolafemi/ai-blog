import { BadRequestException, Controller, ParseFilePipe, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { HelpersService } from './helpers.service';
import MainGuard from 'src/guards/main.guards';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { ALLOWED_FILES_FOR_UPLOAD } from 'src/constants/constant.constants';

@Controller('helpers')
export class HelpersController {
  constructor (
    private readonly service: HelpersService
  ){}

  @UseGuards(MainGuard)
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage({
        destination: "./uploads/tmp",
      }),
      fileFilter(req, file, callback) {
        if (!ALLOWED_FILES_FOR_UPLOAD.includes(file.mimetype))
          callback(new BadRequestException({
            statusText: "bad request",
            status: 400,
            message: `Allowed files types are ${ALLOWED_FILES_FOR_UPLOAD}`, 
          }), false);
        else 
          callback(null, true)
      },
      limits: {
        fileSize: 1000 * 1000 * 5
      },
    }),
  )
  @Post("/upload/file")
  public async uploadDPHelper(@UploadedFile(
    new ParseFilePipe({
      fileIsRequired: true,
      validators: [
        // new MaxFileSizeValidator({ 
        //   maxSize: 1000 * 1000 * 5, 
        // }),
      ],
      exceptionFactory(error) {
        return new BadRequestException({
          statusText: "bad request",
          status: 400,
          message: error || "Unable to validate request", 
        })
      },
    })
  ) file: Express.Multer.File) {
    return this.service.uploadFile(file);
  }
}
