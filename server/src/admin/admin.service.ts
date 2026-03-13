import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Difficulty } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  // ── Stats ───────────────────────────────────────────────────────────────────
  async getStats() {
    const [questions, tests, subjects, topics, users] = await Promise.all([
      this.prisma.question.count(),
      this.prisma.test.count(),
      this.prisma.subject.count(),
      this.prisma.topic.count(),
      this.prisma.user.count(),
    ]);
    return { questions, tests, subjects, topics, users };
  }

  // ── Subjects ────────────────────────────────────────────────────────────────
  getSubjects() {
    return this.prisma.subject.findMany({
      include: {
        topics: {
          where: { parentTopicId: null },
          include: { subTopics: true },
          orderBy: { name: 'asc' },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  createSubject(name: string) {
    return this.prisma.subject.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  deleteSubject(id: string) {
    return this.prisma.subject.delete({ where: { id } });
  }

  // ── Topics ──────────────────────────────────────────────────────────────────
  getTopics() {
    return this.prisma.topic.findMany({
      where: { parentTopicId: null },
      include: { subject: true, subTopics: true },
      orderBy: { name: 'asc' },
    });
  }

  async createTopic(name: string, subjectId: string, parentTopicId?: string) {
    const existing = await this.prisma.topic.findFirst({
      where: { name, subjectId },
    });
    if (existing) return existing;
    return this.prisma.topic.create({
      data: { name, subjectId, parentTopicId: parentTopicId || null },
    });
  }

  deleteTopic(id: string) {
    return this.prisma.topic.delete({ where: { id } });
  }

  // ── Questions ───────────────────────────────────────────────────────────────
  async getQuestions(page = 1, limit = 20, topicId?: string) {
    const skip = (page - 1) * limit;
    const where = topicId ? { topicId } : {};
    const [questions, total] = await Promise.all([
      this.prisma.question.findMany({
        where,
        skip,
        take: limit,
        include: { options: true, topic: { include: { subject: true } } },
        orderBy: { topic: { name: 'asc' } },
      }),
      this.prisma.question.count({ where }),
    ]);
    return { questions, total, page, limit };
  }

  createQuestion(data: {
    text: string;
    difficulty: Difficulty;
    explanation?: string;
    topicId: string;
    options: { text: string; isCorrect: boolean }[];
  }) {
    return this.prisma.question.create({
      data: {
        text: data.text,
        difficulty: data.difficulty,
        explanation: data.explanation,
        topicId: data.topicId,
        options: { create: data.options },
      },
      include: { options: true },
    });
  }

  async updateQuestion(
    id: string,
    data: {
      text?: string;
      difficulty?: Difficulty;
      explanation?: string;
      topicId?: string;
      options?: { text: string; isCorrect: boolean }[];
    },
  ) {
    const { options, ...questionData } = data;
    if (options) {
      await this.prisma.option.deleteMany({ where: { questionId: id } });
    }
    return this.prisma.question.update({
      where: { id },
      data: {
        ...questionData,
        ...(options && { options: { create: options } }),
      },
      include: { options: true },
    });
  }

  async deleteQuestion(id: string) {
    await this.prisma.option.deleteMany({ where: { questionId: id } });
    return this.prisma.question.delete({ where: { id } });
  }

  // ── Tests ───────────────────────────────────────────────────────────────────
  getTests() {
    return this.prisma.test.findMany({
      orderBy: [{ year: 'desc' }, { createdAt: 'desc' }],
      include: { _count: { select: { questions: true } } },
    });
  }

  getTestQuestions(testId: string) {
    return this.prisma.test.findUnique({
      where: { id: testId },
      include: {
        questions: {
          include: { options: true, topic: { include: { subject: true } } },
        },
      },
    });
  }

  createTest(data: {
    title: string;
    duration: number;
    totalQuestions: number;
    year?: number;
    date?: string;
    isPublished?: boolean;
  }) {
    return this.prisma.test.create({
      data: {
        title: data.title,
        duration: data.duration,
        totalQuestions: data.totalQuestions,
        year: data.year,
        date: data.date ? new Date(data.date) : undefined,
        isPublished: data.isPublished ?? false,
      },
    });
  }

  updateTest(
    id: string,
    data: {
      title?: string;
      duration?: number;
      totalQuestions?: number;
      year?: number;
      isPublished?: boolean;
    },
  ) {
    return this.prisma.test.update({ where: { id }, data });
  }

  deleteTest(id: string) {
    return this.prisma.test.delete({ where: { id } });
  }

  assignQuestionsToTest(testId: string, questionIds: string[]) {
    return this.prisma.test.update({
      where: { id: testId },
      data: { questions: { connect: questionIds.map((id) => ({ id })) } },
      include: { _count: { select: { questions: true } } },
    });
  }

  removeQuestionFromTest(testId: string, questionId: string) {
    return this.prisma.test.update({
      where: { id: testId },
      data: { questions: { disconnect: { id: questionId } } },
    });
  }

  // ── Bulk JSON Import ─────────────────────────────────────────────────────────
  async bulkImport(data: {
    test: {
      title: string;
      year: number;
      date?: string;
      duration: number;
      totalQuestions: number;
      isPublished?: boolean;
    };
    questions: {
      text: string;
      difficulty: string;
      topic: string;
      explanation?: string;
      options: { text: string; isCorrect: boolean }[];
    }[];
  }) {
    const gsSubject = await this.prisma.subject.upsert({
      where: { name: 'General Studies' },
      update: {},
      create: { name: 'General Studies' },
    });

    // Check for duplicate test first
    const existingTest = await this.prisma.test.findFirst({
      where: { title: data.test.title, year: data.test.year },
    });
    if (existingTest) {
      throw new Error(
        `Test "${data.test.title}" (${data.test.year}) already exists.`,
      );
    }

    // Upsert topics
    const topicNames = [...new Set(data.questions.map((q) => q.topic))];
    const topicMap: Record<string, string> = {};
    for (const name of topicNames) {
      const existing = await this.prisma.topic.findFirst({
        where: { name, subjectId: gsSubject.id },
      });
      if (existing) {
        topicMap[name] = existing.id;
      } else {
        const created = await this.prisma.topic.create({
          data: { name, subjectId: gsSubject.id },
        });
        topicMap[name] = created.id;
      }
    }

    // Create questions
    const questionIds: string[] = [];
    for (const q of data.questions) {
      const question = await this.prisma.question.create({
        data: {
          text: q.text,
          difficulty: q.difficulty as Difficulty,
          explanation: q.explanation,
          topicId: topicMap[q.topic],
          options: { create: q.options },
        },
      });
      questionIds.push(question.id);
    }

    // Create the test and link questions
    const test = await this.prisma.test.create({
      data: {
        title: data.test.title,
        year: data.test.year,
        date: data.test.date ? new Date(data.test.date) : null,
        duration: data.test.duration,
        totalQuestions: data.test.totalQuestions,
        isPublished: data.test.isPublished ?? false,
        questions: { connect: questionIds.map((id) => ({ id })) },
      },
    });

    return { test, questionsCreated: questionIds.length };
  }
}
