import { PrismaService } from '../prisma/prisma.service';
import { StartTestDto, SubmitAnswerDto } from './dto/exam.dto';
export declare class ExamService {
    private prisma;
    constructor(prisma: PrismaService);
    startTest(userId: string, startTestDto: StartTestDto): Promise<{
        id: string;
        testId: string;
        userId: string;
        startTime: Date;
        submitTime: Date | null;
        score: number | null;
        status: string;
    }>;
    submitAnswer(userId: string, submitDto: SubmitAnswerDto): Promise<{
        id: string;
        isCorrect: boolean;
        attemptId: string;
        questionId: string;
        selectedOptionId: string;
        markedForReview: boolean;
        timeTaken: number | null;
    }>;
    clearAnswer(userId: string, attemptId: string, questionId: string): Promise<{
        id: string;
        isCorrect: boolean;
        attemptId: string;
        questionId: string;
        selectedOptionId: string;
        markedForReview: boolean;
        timeTaken: number | null;
    } | {
        message: string;
    }>;
    finishTest(userId: string, attemptId: string): Promise<{
        id: string;
        testId: string;
        userId: string;
        startTime: Date;
        submitTime: Date | null;
        score: number | null;
        status: string;
    }>;
    getExamQuestions(userId: string, attemptId: string): Promise<{
        id: string;
        text: string;
        difficulty: import(".prisma/client").$Enums.Difficulty;
        topicId: string;
        options: {
            id: string;
            text: string;
        }[];
    }[]>;
    getAttemptResult(userId: string, attemptId: string): Promise<{
        test: {
            id: string;
            title: string;
            duration: number;
            totalQuestions: number;
            isPublished: boolean;
            createdAt: Date;
        };
        responses: ({
            question: {
                options: {
                    id: string;
                    text: string;
                    isCorrect: boolean;
                    questionId: string;
                }[];
            } & {
                id: string;
                text: string;
                difficulty: import(".prisma/client").$Enums.Difficulty;
                topicId: string;
                explanation: string | null;
                imageUrl: string | null;
            };
            selectedOption: {
                id: string;
                text: string;
                isCorrect: boolean;
                questionId: string;
            };
        } & {
            id: string;
            isCorrect: boolean;
            attemptId: string;
            questionId: string;
            selectedOptionId: string;
            markedForReview: boolean;
            timeTaken: number | null;
        })[];
    } & {
        id: string;
        testId: string;
        userId: string;
        startTime: Date;
        submitTime: Date | null;
        score: number | null;
        status: string;
    }>;
}
