export declare enum Difficulty {
    EASY = "EASY",
    MEDIUM = "MEDIUM",
    HARD = "HARD"
}
declare class CreateOptionDto {
    text: string;
    isCorrect: boolean;
}
export declare class CreateQuestionDto {
    text: string;
    difficulty: Difficulty;
    explanation?: string;
    topicId: string;
    options: CreateOptionDto[];
}
export {};
