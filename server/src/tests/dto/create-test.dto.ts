import { IsString, IsInt, IsOptional, Min, IsNotEmpty } from 'class-validator';

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

  @IsOptional()
  @IsInt()
  @Min(2000)
  year?: number; // e.g. 2024
}
