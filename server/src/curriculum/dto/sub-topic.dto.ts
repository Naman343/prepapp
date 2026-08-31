import { IsString, IsOptional, IsInt, Min } from 'class-validator';

export class CreateSubTopicDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}

export class UpdateSubTopicDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;

  @IsOptional()
  isActive?: boolean;
}