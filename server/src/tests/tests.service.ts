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
    // Only return published tests for normal users?
    // For now, return all or filter by query param later.
    return this.prisma.test.findMany({
      orderBy: { createdAt: 'desc' },
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
