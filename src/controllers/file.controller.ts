import { OpenSearchService } from './../services/opensearch.service';
import {
  BadRequestException,
  Controller,
  Get,
  Headers,
  Query,
} from '@nestjs/common';
import { FileService } from 'src/services/file.service';

@Controller('files')
export class FileController {
  constructor(
    private readonly fileService: FileService,
    private readonly opensearchService: OpenSearchService,
  ) {}

  @Get()
  async getFiles(@Headers('x-user-email') userEmail: string) {
    if (!userEmail) {
      throw new BadRequestException('Missing user email in headers');
    }
    console.log(userEmail);
    return this.fileService.findFilesByUser(userEmail);
  }

  @Get('search')
  async search(
    @Query('q') q: string,
    @Headers('x-user-email') userEmail: string,
  ) {
    if (!userEmail) throw new BadRequestException('Missing email header');
    return this.opensearchService.searchByText(q, userEmail);
  }
}
