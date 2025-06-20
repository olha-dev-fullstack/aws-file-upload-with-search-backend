import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3 } from 'aws-sdk';
import * as mammoth from 'mammoth';
import Stream from 'node:stream';
import * as pdf from 'pdf-parse';
import { PrismaService } from 'src/prisma/prisma.service';

export type SupportedExtensions = '.pdf' | '.docx';
export type FileParseFn = (buffer: Buffer) => Promise<string>;
@Injectable()
export class FileService {
  private s3: S3;
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    this.s3 = new S3({
      region: config.get('AWS_REGION'),
      accessKeyId: config.get('S3_ACCESS_KEY_ID'),
      secretAccessKey: config.get('S3_SECRET_ACCESS_KEY'),
    });
  }

  async findFilesByUser(userEmail: string) {
    const files = await this.prisma.document.findMany({
      where: {
        userEmail: userEmail,
      },
      orderBy: { uploadedAt: 'desc' },
    });
    return files;
  }

  async findFileByS3Path(s3Key: string) {
    const file = await this.prisma.document.findFirst({
      where: {
        s3Url: s3Key,
      },
    });
    console.log(file);
    
    return file;
  }

  async streamToBuffer(readableStream) {
    return new Promise<Buffer>((resolve, reject) => {
      const chunks = [];
      readableStream.on('data', (chunk) => {
        chunks.push(chunk);
      });
      readableStream.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
      readableStream.on('error', (err) => {
        reject(err);
      });
    });
  }

  async downloadFileFromS3(fileKey: string): Promise<Stream.Readable> {
    const params = {
      Bucket: this.config.get('AWS_S3_BUCKET'),
      Key: fileKey,
    };
    try {
      const s3Stream = this.s3.getObject(params).createReadStream();

      return s3Stream;
    } catch (error) {
      // Handle errors appropriately, e.g., log the error and return a 404 or 500
      console.error('Error downloading file:', error);
      throw new Error('Failed to download file');
    }
  }

  async parsePdfToText(buffer: Buffer): Promise<string> {
    const parsedData = await pdf(buffer);
    return parsedData.text;
  }

  async parseDocxToText(buffer: Buffer): Promise<string> {
    const parsedData = await mammoth.extractRawText({ buffer: buffer });
    return parsedData.value;
  }
}
