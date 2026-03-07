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
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AnalyticsService = class AnalyticsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getUserStats(userId) {
        const attempts = await this.prisma.testAttempt.findMany({
            where: { userId, status: 'COMPLETED' },
            include: {
                test: true,
                responses: {
                    include: {
                        question: { select: { topic: true } }
                    }
                }
            }
        });
        if (attempts.length === 0) {
            return {
                totalTests: 0,
                averageScore: 0,
                overallAccuracy: 0,
                topicPerformance: []
            };
        }
        let totalScore = 0;
        let totalQuestionsAttempted = 0;
        let totalCorrect = 0;
        const topicStats = {};
        attempts.forEach(attempt => {
            totalScore += attempt.score || 0;
            attempt.responses.forEach(r => {
                totalQuestionsAttempted++;
                if (r.isCorrect)
                    totalCorrect++;
                const topicName = r.question.topic.name;
                if (!topicStats[topicName]) {
                    topicStats[topicName] = { correct: 0, total: 0, name: topicName };
                }
                topicStats[topicName].total++;
                if (r.isCorrect)
                    topicStats[topicName].correct++;
            });
        });
        const averageScore = totalScore / attempts.length;
        const overallAccuracy = totalQuestionsAttempted > 0 ? (totalCorrect / totalQuestionsAttempted) * 100 : 0;
        const topicPerformance = Object.values(topicStats).map(t => {
            const accuracy = (t.correct / t.total) * 100;
            let status = 'WEAK';
            if (accuracy >= 70)
                status = 'STRONG';
            else if (accuracy >= 40)
                status = 'MODERATE';
            return {
                topic: t.name,
                accuracy: parseFloat(accuracy.toFixed(2)),
                status
            };
        });
        return {
            totalTests: attempts.length,
            averageScore: parseFloat(averageScore.toFixed(2)),
            overallAccuracy: parseFloat(overallAccuracy.toFixed(2)),
            topicPerformance
        };
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map