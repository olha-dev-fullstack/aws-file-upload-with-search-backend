import { BadRequestException, Controller, Get, Headers } from '@nestjs/common';
import { FileService } from 'src/services/file.service';

@Controller('files')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Get()
  async getFiles(@Headers('x-user-email') userEmail: string) {
    if (!userEmail) {
      throw new BadRequestException('Missing user email in headers');
    }
    console.log(userEmail);
    return this.fileService.findFilesByUser(userEmail);
  }
}
