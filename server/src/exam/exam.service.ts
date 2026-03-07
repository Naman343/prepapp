import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StartTestDto, SubmitAnswerDto } from './dto/exam.dto';

@Injectable()
export class ExamService {
  constructor(private prisma: PrismaService) {}

  async startTest(userId: string, startTestDto: StartTestDto) {
    // Check if test exists
    const test = await this.prisma.test.findUnique({
      where: { id: startTestDto.testId },
    });
    if (!test) throw new NotFoundException('Test not found');

    // Check for existing ongoing attempt
    const existingAttempt = await this.prisma.testAttempt.findFirst({
      where: {
        userId,
        testId: startTestDto.testId,
        status: 'ONGOING',
      },
    });

    if (existingAttempt) return existingAttempt;

    // Note: Allowing multiple attempts for practice/testing
    // Uncomment below to enforce single-attempt rule:
    // const completedAttempt = await this.prisma.testAttempt.findFirst({
    //   where: {
    //     userId,
    //     testId: startTestDto.testId,
    //     status: 'COMPLETED',
    //   },
    // });
    // if (completedAttempt) {
    //   throw new BadRequestException('You have already attempted this test.');
    // }

    return this.prisma.testAttempt.create({
      data: {
        userId,
        testId: startTestDto.testId,
        status: 'ONGOING',
      },
    });
  }

  async submitAnswer(userId: string, submitDto: SubmitAnswerDto) {
    const attempt = await this.prisma.testAttempt.findUnique({
      where: { id: submitDto.attemptId },
    });

    if (!attempt || attempt.userId !== userId) {
      throw new BadRequestException('Invalid attempt');
    }

    if (attempt.status === 'COMPLETED') {
      throw new BadRequestException('Test is already submitted');
    }

    // Check correctness
    const option = await this.prisma.option.findUnique({
      where: { id: submitDto.selectedOptionId },
    });

    if (!option) throw new BadRequestException('Invalid option');

    // UPSERT response (if user changes answer)
    // We need to find if response exists for this question in this attempt
    const existingResponse = await this.prisma.response.findFirst({
      where: {
        attemptId: submitDto.attemptId,
        questionId: submitDto.questionId,
      },
    });

    if (existingResponse) {
      return this.prisma.response.update({
        where: { id: existingResponse.id },
        data: {
          selectedOptionId: submitDto.selectedOptionId,
          isCorrect: option.isCorrect,
          markedForReview: submitDto.markedForReview ?? false,
        },
      });
    }

    return this.prisma.response.create({
      data: {
        attemptId: submitDto.attemptId,
        questionId: submitDto.questionId,
        selectedOptionId: submitDto.selectedOptionId,
        isCorrect: option.isCorrect,
        markedForReview: submitDto.markedForReview ?? false,
      },
    });
  }

  async clearAnswer(userId: string, attemptId: string, questionId: string) {
    const attempt = await this.prisma.testAttempt.findUnique({
      where: { id: attemptId },
    });

    if (!attempt || attempt.userId !== userId) {
      throw new BadRequestException('Invalid attempt');
    }

    if (attempt.status === 'COMPLETED') {
      throw new BadRequestException('Test is already submitted');
    }

    // Delete response if it exists
    const existingResponse = await this.prisma.response.findFirst({
      where: {
        attemptId,
        questionId,
      },
    });

    if (existingResponse) {
      return this.prisma.response.delete({
        where: { id: existingResponse.id },
      });
    }

    return { message: 'No response to clear' };
  }

  async finishTest(userId: string, attemptId: string) {
    const attempt = await this.prisma.testAttempt.findUnique({
      where: { id: attemptId },
      include: { responses: true },
    });

    if (!attempt || attempt.userId !== userId) {
      throw new BadRequestException('Invalid attempt');
    }

    if (attempt.status === 'COMPLETED') return attempt;

    // Calculate Score
    let correct = 0;
    let wrong = 0;

    attempt.responses.forEach((r) => {
      if (r.isCorrect) correct++;
      else wrong++;
    });

    const score = correct * 2 - wrong * 0.66;

    return this.prisma.testAttempt.update({
      where: { id: attemptId },
      data: {
        status: 'COMPLETED',
        submitTime: new Date(),
        score,
      },
    });
  }

  async getExamQuestions(userId: string, attemptId: string) {
    const attempt = await this.prisma.testAttempt.findUnique({
      where: { id: attemptId },
      include: {
        test: { include: { questions: { include: { options: true } } } },
      },
    });

    if (!attempt || attempt.userId !== userId) {
      throw new BadRequestException('Invalid attempt');
    }

    if (attempt.status === 'COMPLETED') {
      // If completed, maybe we can show answers? For now, stick to exam scope.
      // Let's allow viewing history but maybe with answers?
      // For MVP phase 1, just return questions as is (maybe with answers if calculated).
      // But for ONGOING, must hide answers.
    }

    // Shuffle questions
    const questions = attempt.test.questions.sort(() => 0.5 - Math.random());

    // Sanitize (Hide correct answer)
    return questions.map((q) => ({
      id: q.id,
      text: q.text,
      difficulty: q.difficulty,
      topicId: q.topicId,
      options: q.options
        .sort(() => 0.5 - Math.random())
        .map((o) => ({
          id: o.id,
          text: o.text,
          // Omit isCorrect
        })),
      // Omit explanation
    }));
  }

  async getAttemptResult(userId: string, attemptId: string) {
    const attempt = await this.prisma.testAttempt.findUnique({
      where: { id: attemptId },
      include: {
        test: true,
        responses: {
          include: {
            question: { include: { options: true } },
            selectedOption: true,
          },
        },
      },
    });

    if (!attempt || attempt.userId !== userId) {
      throw new NotFoundException('Attempt not found');
    }

    if (attempt.status !== 'COMPLETED') {
      throw new BadRequestException('Test is not completed yet');
    }

    return attempt;
  }
}
