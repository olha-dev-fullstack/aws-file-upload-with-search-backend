import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FileController } from './controllers/file.controller';
import { FileUploadModule } from './file-upload/file-upload.module';
import { PrismaModule } from './prisma/prisma.module';
import { PrismaService } from './prisma/prisma.service';
import { FileService } from './services/file.service';
import { ConsumerModule } from './sqs-consumer/consumer.module';
import { OpenSearchService } from './services/opensearch.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    FileUploadModule,
    PrismaModule,
    ConsumerModule,
  ],
  controllers: [AppController, FileController],
  providers: [AppService, FileService, PrismaService, OpenSearchService],
})
export class AppModule {}
