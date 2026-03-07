import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) { }

  async getUserStats(userId: string) {
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

    // Topic-wise stats
    const topicStats: Record<string, { correct: number; total: number; name: string }> = {};

    attempts.forEach(attempt => {
      totalScore += attempt.score || 0;

      attempt.responses.forEach(r => {
        totalQuestionsAttempted++;
        if (r.isCorrect) totalCorrect++;

        const topicName = r.question.topic.name;
        if (!topicStats[topicName]) {
          topicStats[topicName] = { correct: 0, total: 0, name: topicName };
        }
        topicStats[topicName].total++;
        if (r.isCorrect) topicStats[topicName].correct++;
      });
    });

    const averageScore = totalScore / attempts.length;
    const overallAccuracy = totalQuestionsAttempted > 0 ? (totalCorrect / totalQuestionsAttempted) * 100 : 0;

    // Rules for Topic Strength
    // Strong: >= 70% | Moderate: 40-69% | Weak: < 40%
    const topicPerformance = Object.values(topicStats).map(t => {
      const accuracy = (t.correct / t.total) * 100;
      let status = 'WEAK';
      if (accuracy >= 70) status = 'STRONG';
      else if (accuracy >= 40) status = 'MODERATE';

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
}
