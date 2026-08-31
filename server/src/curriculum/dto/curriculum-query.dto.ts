import { IsOptional, IsEnum, IsString } from 'class-validator';
import { SyllabusPaper, TopicPriority } from '@prisma/client';

export class CurriculumQueryDto {
  @IsOptional()
  @IsEnum(SyllabusPaper)
  paper?: SyllabusPaper;

  @IsOptional()
  @IsEnum(TopicPriority)
  priority?: TopicPriority;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  includeInactive?: boolean;
}