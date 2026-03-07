import { PrismaService } from '../prisma/prisma.service';
export declare class AnalyticsService {
    private prisma;
    constructor(prisma: PrismaService);
    getUserStats(userId: string): Promise<{
        totalTests: number;
        averageScore: number;
        overallAccuracy: number;
        topicPerformance: {
            topic: string;
            accuracy: number;
            status: string;
        }[];
    }>;
}
