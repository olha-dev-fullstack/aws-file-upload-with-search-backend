import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FileService {
  constructor(private readonly prisma: PrismaService) {}

  async findFilesByUser(userEmail: string) {
    const files = await this.prisma.document.findMany({
      where: {
        userEmail: userEmail,
      },
      orderBy: { uploadedAt: 'desc' },
    });
    return files;
  }
}
