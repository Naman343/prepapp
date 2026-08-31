import { IsString, IsOptional, IsEnum, IsInt, Min } from 'class-validator';
import { TopicPriority } from '@prisma/client';

export class CreateTopicDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  weightage?: string;

  @IsOptional()
  @IsEnum(TopicPriority)
  priority?: TopicPriority;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}

export class UpdateTopicDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  weightage?: string;

  @IsOptional()
  @IsEnum(TopicPriority)
  priority?: TopicPriority;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;

  @IsOptional()
  isActive?: boolean;
}