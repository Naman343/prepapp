import { Injectable } from '@nestjs/common';
import { CreateTestDto } from './dto/create-test.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TestsService {
  constructor(private prisma: PrismaService) {}

  create(createTestDto: CreateTestDto) {
    return this.prisma.test.create({
      data: createTestDto,
    });
  }

  findAll() {
    return this.prisma.test.findMany({
      where: { isPublished: true },
      select: {
        id: true,
        title: true,
        duration: true,
        totalQuestions: true,
        isPublished: true,
        year: true,
        date: true,
      },
      orderBy: [{ year: 'desc' }, { createdAt: 'desc' }],
    });
  }

  findOne(id: string) {
    return this.prisma.test.findUnique({
      where: { id },
      include: {
        questions: { select: { id: true } }, // Just IDs
      },
    });
  }

  update(id: number) {
    return `This action updates a #${id} test`;
  }

  remove(id: number) {
    return `This action removes a #${id} test`;
  }
}
