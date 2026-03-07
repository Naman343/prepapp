import { AnalyticsService } from './analytics.service';
export declare class AnalyticsController {
    private readonly analyticsService;
    constructor(analyticsService: AnalyticsService);
    getStats(req: any): Promise<{
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
