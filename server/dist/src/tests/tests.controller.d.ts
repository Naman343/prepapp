import { TestsService } from './tests.service';
import { CreateTestDto } from './dto/create-test.dto';
import { UpdateTestDto } from './dto/update-test.dto';
export declare class TestsController {
    private readonly testsService;
    constructor(testsService: TestsService);
    create(createTestDto: CreateTestDto): import(".prisma/client").Prisma.Prisma__TestClient<{
        id: string;
        title: string;
        duration: number;
        totalQuestions: number;
        isPublished: boolean;
        createdAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    findAll(): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        title: string;
        duration: number;
        totalQuestions: number;
        isPublished: boolean;
        createdAt: Date;
    }[]>;
    findOne(id: string): import(".prisma/client").Prisma.Prisma__TestClient<({
        questions: {
            id: string;
        }[];
    } & {
        id: string;
        title: string;
        duration: number;
        totalQuestions: number;
        isPublished: boolean;
        createdAt: Date;
    }) | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    update(id: string, updateTestDto: UpdateTestDto): string;
    remove(id: string): string;
}
