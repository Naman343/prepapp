import { SyllabusPaper } from '@prisma/client';

export class SubTopicEntity {
  id: string;
  title: string;
  order: number;
  isActive: boolean;
}

export class SyllabusTopicEntity {
  id: string;
  title: string;
  description?: string;
  weightage?: string;
  priority: string;
  order: number;
  isActive: boolean;
  subTopics: SubTopicEntity[];
}

export class SyllabusSectionEntity {
  id: string;
  title: string;
  description?: string;
  paper: SyllabusPaper;
  icon?: string;
  color?: string;
  bgColor?: string;
  order: number;
  isActive: boolean;
  topics: SyllabusTopicEntity[];
}