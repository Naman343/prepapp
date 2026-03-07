"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExamService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ExamService = class ExamService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async startTest(userId, startTestDto) {
        const test = await this.prisma.test.findUnique({
            where: { id: startTestDto.testId },
        });
        if (!test)
            throw new common_1.NotFoundException('Test not found');
        const existingAttempt = await this.prisma.testAttempt.findFirst({
            where: {
                userId,
                testId: startTestDto.testId,
                status: 'ONGOING',
            },
        });
        if (existingAttempt)
            return existingAttempt;
        return this.prisma.testAttempt.create({
            data: {
                userId,
                testId: startTestDto.testId,
                status: 'ONGOING',
            },
        });
    }
    async submitAnswer(userId, submitDto) {
        const attempt = await this.prisma.testAttempt.findUnique({
            where: { id: submitDto.attemptId },
        });
        if (!attempt || attempt.userId !== userId) {
            throw new common_1.BadRequestException('Invalid attempt');
        }
        if (attempt.status === 'COMPLETED') {
            throw new common_1.BadRequestException('Test is already submitted');
        }
        const option = await this.prisma.option.findUnique({
            where: { id: submitDto.selectedOptionId },
        });
        if (!option)
            throw new common_1.BadRequestException('Invalid option');
        const existingResponse = await this.prisma.response.findFirst({
            where: {
                attemptId: submitDto.attemptId,
                questionId: submitDto.questionId
            }
        });
        if (existingResponse) {
            return this.prisma.response.update({
                where: { id: existingResponse.id },
                data: {
                    selectedOptionId: submitDto.selectedOptionId,
                    isCorrect: option.isCorrect,
                    markedForReview: submitDto.markedForReview ?? false
                }
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
    async clearAnswer(userId, attemptId, questionId) {
        const attempt = await this.prisma.testAttempt.findUnique({
            where: { id: attemptId },
        });
        if (!attempt || attempt.userId !== userId) {
            throw new common_1.BadRequestException('Invalid attempt');
        }
        if (attempt.status === 'COMPLETED') {
            throw new common_1.BadRequestException('Test is already submitted');
        }
        const existingResponse = await this.prisma.response.findFirst({
            where: {
                attemptId,
                questionId
            }
        });
        if (existingResponse) {
            return this.prisma.response.delete({
                where: { id: existingResponse.id }
            });
        }
        return { message: 'No response to clear' };
    }
    async finishTest(userId, attemptId) {
        const attempt = await this.prisma.testAttempt.findUnique({
            where: { id: attemptId },
            include: { responses: true },
        });
        if (!attempt || attempt.userId !== userId) {
            throw new common_1.BadRequestException('Invalid attempt');
        }
        if (attempt.status === 'COMPLETED')
            return attempt;
        let correct = 0;
        let wrong = 0;
        attempt.responses.forEach((r) => {
            if (r.isCorrect)
                correct++;
            else
                wrong++;
        });
        const score = (correct * 2) - (wrong * 0.66);
        return this.prisma.testAttempt.update({
            where: { id: attemptId },
            data: {
                status: 'COMPLETED',
                submitTime: new Date(),
                score,
            },
        });
    }
    async getExamQuestions(userId, attemptId) {
        const attempt = await this.prisma.testAttempt.findUnique({
            where: { id: attemptId },
            include: { test: { include: { questions: { include: { options: true } } } } },
        });
        if (!attempt || attempt.userId !== userId) {
            throw new common_1.BadRequestException('Invalid attempt');
        }
        if (attempt.status === 'COMPLETED') {
        }
        const questions = attempt.test.questions.sort(() => 0.5 - Math.random());
        return questions.map((q) => ({
            id: q.id,
            text: q.text,
            difficulty: q.difficulty,
            topicId: q.topicId,
            options: q.options.sort(() => 0.5 - Math.random()).map((o) => ({
                id: o.id,
                text: o.text,
            })),
        }));
    }
    async getAttemptResult(userId, attemptId) {
        const attempt = await this.prisma.testAttempt.findUnique({
            where: { id: attemptId },
            include: {
                test: true,
                responses: {
                    include: {
                        question: { include: { options: true } },
                        selectedOption: true
                    }
                }
            },
        });
        if (!attempt || attempt.userId !== userId) {
            throw new common_1.NotFoundException('Attempt not found');
        }
        if (attempt.status !== 'COMPLETED') {
            throw new common_1.BadRequestException('Test is not completed yet');
        }
        return attempt;
    }
};
exports.ExamService = ExamService;
exports.ExamService = ExamService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ExamService);
//# sourceMappingURL=exam.service.js.map