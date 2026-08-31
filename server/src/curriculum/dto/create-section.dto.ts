import { IsString, IsOptional, IsEnum, IsInt, Min } from 'class-validator';
import { SyllabusPaper } from '@prisma/client';

export class CreateSectionDto {
  @IsEnum(SyllabusPaper)
  paper: SyllabusPaper;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  bgColor?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}