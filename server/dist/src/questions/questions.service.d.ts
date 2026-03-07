import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { PrismaService } from '../prisma/prisma.service';
export declare class QuestionsService {
    private prisma;
    constructor(prisma: PrismaService);
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
    update(id: number, updateQuestionDto: UpdateQuestionDto): string;
    remove(id: number): string;
}
