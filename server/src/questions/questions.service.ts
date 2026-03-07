import { Injectable } from '@nestjs/common';
import { CreateQuestionDto } from './dto/create-question.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class QuestionsService {
  constructor(private prisma: PrismaService) {}

  async create(createQuestionDto: CreateQuestionDto) {
    const { options, ...questionData } = createQuestionDto;

    // Create question and options in one go
    return this.prisma.question.create({
      data: {
        ...questionData,
        options: {
          create: options,
        },
      },
      include: {
        options: true,
      },
    });
  }

  findAll() {
    return this.prisma.question.findMany({
      include: { options: true },
    });
  }

  findOne(id: string) {
    return this.prisma.question.findUnique({
      where: { id },
      include: { options: true },
    });
  }

  update(id: number) {
    return `This action updates a #${id} question`;
  }

  remove(id: number) {
    return `This action removes a #${id} question`;
  }
}
