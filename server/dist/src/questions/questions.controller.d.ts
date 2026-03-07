import { QuestionsService } from './questions.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
export declare class QuestionsController {
    private readonly questionsService;
    constructor(questionsService: QuestionsService);
    create(createQuestionDto: CreateQuestionDto): Promise<{
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
    }>;
    findAll(): import(".prisma/client").Prisma.PrismaPromise<({
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
    })[]>;
    findOne(id: string): import(".prisma/client").Prisma.Prisma__QuestionClient<({
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
    }) | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    update(id: string, updateQuestionDto: UpdateQuestionDto): string;
    remove(id: string): string;
}
