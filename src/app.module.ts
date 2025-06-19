import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FileUploadModule } from './file-upload/file-upload.module';
import { FileService } from './services/file.service';
import { FileController } from './controllers/file.controller';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    FileUploadModule,
  ],
  controllers: [AppController, FileController],
  providers: [AppService, FileService, PrismaService],
})
export class AppModule {}
