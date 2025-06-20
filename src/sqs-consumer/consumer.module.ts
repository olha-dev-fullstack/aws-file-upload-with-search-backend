import { Module } from '@nestjs/common';
import { SqsModule } from '@ssut/nestjs-sqs';
import { config } from './config';
import { ConsumerService } from './consumer.service';
import * as AWS from 'aws-sdk';
import { SQSClient } from '@aws-sdk/client-sqs';
import { TestController } from './controller';
import { FileService } from 'src/services/file.service';
import { OpenSearchService } from 'src/services/opensearch.service';

AWS.config.update({
  region: config.awsRegion, // aws region
  accessKeyId: process.env.S3_ACCESS_KEY_ID, // aws access key id
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY, // aws secret access key
});

@Module({
  imports: [
    SqsModule.register({
      consumers: [
        {
          name: config.sqsQueueName, // name of the queue
          queueUrl: config.sqsQueueUrl, // the url of the queue
          region: config.awsRegion,
          sqs: new SQSClient({
            region: config.awsRegion,
            credentials: {
              accessKeyId: process.env.S3_ACCESS_KEY_ID,
              secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
            },
          }),
        },
      ],
      producers: [],
    }),
  ],
  controllers: [TestController],
  providers: [ConsumerService, FileService, OpenSearchService],
})
export class ConsumerModule {}
