export declare class StartTestDto {
    testId: string;
}
export declare class SubmitAnswerDto {
    attemptId: string;
    questionId: string;
    selectedOptionId: string;
    markedForReview?: boolean;
}
