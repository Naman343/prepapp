import { IsString, IsEnum, IsOptional, IsArray, ValidateNested, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export enum Difficulty {
    EASY = 'EASY',
    MEDIUM = 'MEDIUM',
    HARD = 'HARD',
}

class CreateOptionDto {
    @IsString()
    text: string;

    @IsBoolean()
    isCorrect: boolean;
}

export class CreateQuestionDto {
    @IsString()
    text: string;

    @IsEnum(Difficulty)
    difficulty: Difficulty;

    @IsString()
    @IsOptional()
    explanation?: string;

    @IsString()
    topicId: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateOptionDto)
    options: CreateOptionDto[];
}
