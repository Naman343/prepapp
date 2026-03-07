import { ExamService } from './exam.service';
import { StartTestDto, SubmitAnswerDto } from './dto/exam.dto';
export declare class ExamController {
    private readonly examService;
    constructor(examService: ExamService);
    startTest(req: any, startTestDto: StartTestDto): Promise<{
        id: string;
        testId: string;
        userId: string;
        startTime: Date;
        submitTime: Date | null;
        score: number | null;
        status: string;
    }>;
    submitAnswer(req: any, submitDto: SubmitAnswerDto): Promise<{
        id: string;
        isCorrect: boolean;
        attemptId: string;
        questionId: string;
        selectedOptionId: string;
        markedForReview: boolean;
        timeTaken: number | null;
    }>;
    clearAnswer(req: any, body: {
        attemptId: string;
        questionId: string;
    }): Promise<{
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
    finishTest(req: any, body: {
        attemptId: string;
    }): Promise<{
        id: string;
        testId: string;
        userId: string;
        startTime: Date;
        submitTime: Date | null;
        score: number | null;
        status: string;
    }>;
    getQuestions(req: any, attemptId: string): Promise<{
        id: string;
        text: string;
        difficulty: import(".prisma/client").$Enums.Difficulty;
        topicId: string;
        options: {
            id: string;
            text: string;
        }[];
    }[]>;
    getResult(req: any, attemptId: string): Promise<{
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
