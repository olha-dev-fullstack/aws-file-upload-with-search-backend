import { Body, Controller, Post } from '@nestjs/common';
import { FileUploadService } from './file-upload.service';

@Controller('upload')
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post()
  getUploadUrl(@Body() fileData: { filename: string; mimetype: string }) {
    const { filename, mimetype } = fileData;
    return this.fileUploadService.generateUploadUrl(filename, mimetype);
  }
}
