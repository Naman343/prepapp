import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class StartTestDto {
    @IsString()
    @IsNotEmpty()
    testId: string;
}

export class SubmitAnswerDto {
    @IsString()
    @IsNotEmpty()
    attemptId: string;

    @IsString()
    @IsNotEmpty()
    questionId: string;

    @IsString()
    @IsNotEmpty()
    selectedOptionId: string;

    @IsOptional()
    @IsBoolean()
    markedForReview?: boolean;
}
