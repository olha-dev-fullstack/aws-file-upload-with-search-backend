import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';

@Injectable()
export class FileUploadService {
  private awsS3BucketName: string;
  private awsS3Bucket: AWS.S3;

  constructor(private configService: ConfigService) {
    this.awsS3BucketName = this.configService.get<string>('AWS_S3_BUCKET');
    this.awsS3Bucket = new AWS.S3({
      accessKeyId: this.configService.get<string>('S3_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get<string>('S3_SECRET_ACCESS_KEY'),
    });
  }
  async getS3Url(fileName, bucket, mimetype) {
    const params = {
      Bucket: bucket,
      Key: String(fileName),
      ContentType: mimetype,
      Expires: 1800,
    };
    try {
      const s3Response = await this.awsS3Bucket.getSignedUrlPromise(
        'putObject',
        params,
      );
      return { uploadUrl: s3Response };
    } catch (e) {
      console.log(e);
    }
  }

  async generateUploadUrl(filename: string, mimetype: string) {
    return await this.getS3Url(filename, this.awsS3BucketName, mimetype);
  }
}
