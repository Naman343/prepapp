import { IsString, IsInt, Min, IsNotEmpty } from 'class-validator';

export class CreateTestDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsInt()
    @Min(1)
    duration: number; // in minutes

    @IsInt()
    @Min(1)
    totalQuestions: number;
}
