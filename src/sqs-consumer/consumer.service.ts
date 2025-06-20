import { Injectable } from '@nestjs/common';
import { SqsMessageHandler } from '@ssut/nestjs-sqs';
import * as AWS from 'aws-sdk';
import { config } from './config';
import {
  FileParseFn,
  FileService,
  SupportedExtensions,
} from 'src/services/file.service';
import { OpenSearchService } from 'src/services/opensearch.service';

type SqsMessageObj = {
  Records: {
    s3: {
      object: {
        key: string;
      };
    };
  }[];
};

@Injectable()
export class ConsumerService {
  constructor(
    private readonly fileService: FileService,
    private readonly opensearchService: OpenSearchService,
  ) {}

  @SqsMessageHandler(config.sqsQueueName, false)
  async handleMessage(message: AWS.SQS.Message) {
    try {
      const obj: SqsMessageObj = JSON.parse(message.Body);
      const s3FileKey = obj.Records[0].s3.object.key;

      const fileFromDb = await this.fileService.findFileByS3Path(s3FileKey);
      if (!fileFromDb) {
        throw new Error("File doesn't exist");
      }

      // load file from s3
      const fileFromS3 = await this.fileService.downloadFileFromS3(s3FileKey);

      // parse file to text
      const buffer = await this.fileService.streamToBuffer(fileFromS3);

      const parsersMap: Record<SupportedExtensions, FileParseFn> = {
        '.pdf': this.fileService.parsePdfToText,
        '.docx': this.fileService.parseDocxToText,
      };
      // get file extension
      const fileExtension = s3FileKey.split('.').at(-1);

      // get parser, handle not supported extension
      const fileParser = parsersMap[`.${fileExtension}`];
      if (!fileParser) {
        throw new Error('Not supported file extension');
      }

      const fileText = await fileParser(buffer);

      // test with .doc
      // Load text to OpenSearch
      await this.opensearchService.indexDocument({
        id: fileFromDb.id,
        filename: fileFromDb.filename,
        text: fileText,
        userEmail: fileFromDb.userEmail,
        uploadedAt: fileFromDb.uploadedAt.toISOString(),
      });
      // console.log(data);
    } catch (e) {
      console.log('error handling message', e);
    }
    // use the data and consume it the way you want //
  }
}
