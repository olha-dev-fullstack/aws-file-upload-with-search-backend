import { Body, Controller, Post } from '@nestjs/common';
import { FileUploadService } from './file-upload.service';

@Controller('upload')
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post()
  async getUploadUrl(
    @Body()
    {
      userEmail,
      fileData,
    }: {
      userEmail: string;
      fileData: { filename: string; mimetype: string };
    },
  ) {
    const { filename, mimetype } = fileData;
    const s3FilePath = `files/${userEmail}/${Date.now()}_${filename}`;
    const generatedUrl = await this.fileUploadService.generateUploadUrl(
      s3FilePath,
      mimetype,
    );
    await this.fileUploadService.uploadToDb(userEmail, filename, s3FilePath);
    return generatedUrl;
  }
}
