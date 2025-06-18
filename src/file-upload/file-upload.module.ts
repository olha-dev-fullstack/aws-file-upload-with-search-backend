import { Module } from '@nestjs/common';
import { FileUploadService } from './file-upload.service';
import { FileUploadController } from './file-upload.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [FileUploadService, PrismaService],
  controllers: [FileUploadController],
})
export class FileUploadModule {}
