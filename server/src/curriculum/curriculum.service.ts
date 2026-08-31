import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSectionDto } from './dto/create-section.dto';
import { CreateTopicDto, UpdateTopicDto } from './dto/topic.dto';
import { CreateSubTopicDto, UpdateSubTopicDto } from './dto/sub-topic.dto';
import { CurriculumQueryDto } from './dto/curriculum-query.dto';
import { SyllabusPaper, TopicPriority, Prisma } from '@prisma/client';

@Injectable()
export class CurriculumService {
  constructor(private prisma: PrismaService) {}

  async createSection(dto: CreateSectionDto) {
    return this.prisma.syllabusSection.create({
      data: {
        paper: dto.paper,
        title: dto.title,
        description: dto.description,
        icon: dto.icon,
        color: dto.color,
        bgColor: dto.bgColor,
        order: dto.order ?? 0,
      },
    });
  }

  async findAllSections(query: CurriculumQueryDto) {
    const where: Prisma.SyllabusSectionWhereInput = {};

    if (query.paper) {
      where.paper = query.paper;
    }

    if (!query.includeInactive) {
      where.isActive = true;
    }

    return this.prisma.syllabusSection.findMany({
      where,
      include: {
        topics: {
          where: query.includeInactive ? {} : { isActive: true },
          include: {
            subTopics: {
              where: query.includeInactive ? {} : { isActive: true },
              orderBy: { order: 'asc' },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    });
  }

  async findSectionByPaper(paper: SyllabusPaper) {
    const section = await this.prisma.syllabusSection.findUnique({
      where: { paper },
      include: {
        topics: {
          where: { isActive: true },
          include: {
            subTopics: {
              where: { isActive: true },
              orderBy: { order: 'asc' },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!section) {
      throw new NotFoundException(`Syllabus section for paper ${paper} not found`);
    }

    return section;
  }

  async updateSection(paper: SyllabusPaper, data: Partial<CreateSectionDto>) {
    return this.prisma.syllabusSection.update({
      where: { paper },
      data,
    });
  }

  async deleteSection(paper: SyllabusPaper) {
    return this.prisma.syllabusSection.delete({
      where: { paper },
    });
  }

  async createTopic(sectionId: string, dto: CreateTopicDto) {
    const section = await this.prisma.syllabusSection.findUnique({
      where: { id: sectionId },
    });

    if (!section) {
      throw new NotFoundException('Syllabus section not found');
    }

    return this.prisma.syllabusTopic.create({
      data: {
        title: dto.title,
        description: dto.description,
        weightage: dto.weightage,
        priority: dto.priority ?? TopicPriority.MEDIUM,
        order: dto.order ?? 0,
        sectionId,
      },
    });
  }

  async findTopicById(id: string) {
    const topic = await this.prisma.syllabusTopic.findUnique({
      where: { id },
      include: {
        subTopics: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
        },
        section: true,
      },
    });

    if (!topic) {
      throw new NotFoundException('Topic not found');
    }

    return topic;
  }

  async updateTopic(id: string, dto: UpdateTopicDto) {
    return this.prisma.syllabusTopic.update({
      where: { id },
      data: dto,
    });
  }

  async deleteTopic(id: string) {
    return this.prisma.syllabusTopic.delete({
      where: { id },
    });
  }

  async createSubTopic(topicId: string, dto: CreateSubTopicDto) {
    const topic = await this.prisma.syllabusTopic.findUnique({
      where: { id: topicId },
    });

    if (!topic) {
      throw new NotFoundException('Topic not found');
    }

    return this.prisma.subTopic.create({
      data: {
        title: dto.title,
        order: dto.order ?? 0,
        topicId,
      },
    });
  }

  async updateSubTopic(id: string, dto: UpdateSubTopicDto) {
    return this.prisma.subTopic.update({
      where: { id },
      data: dto,
    });
  }

  async deleteSubTopic(id: string) {
    return this.prisma.subTopic.delete({
      where: { id },
    });
  }

  async searchTopics(query: string) {
    return this.prisma.syllabusTopic.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          {
            subTopics: {
              some: { title: { contains: query, mode: 'insensitive' } },
            },
          },
        ],
        isActive: true,
      },
      include: {
        subTopics: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
        },
        section: true,
      },
    });
  }

  async seedDefaultCurriculum() {
    const sections = [
      {
        paper: SyllabusPaper.GS_PAPER_I,
        title: 'General Studies Paper I',
        description: 'History, Geography, Polity, Economy, Environment, Science & Current Affairs',
        icon: 'BookOpen',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50 border-blue-100',
        order: 1,
        topics: [
          {
            title: 'History of India & Indian National Movement',
            description: 'Ancient, Medieval, Modern Indian History and Freedom Struggle',
            weightage: '~15-20 questions',
            priority: TopicPriority.HIGH,
            order: 1,
            subTopics: [
              'Indus Valley Civilization, Vedic Period',
              'Mauryan & Gupta Empires',
              'Delhi Sultanate, Mughal Empire',
              'British Expansion & Economic Policies',
              'Revolt of 1857, Social Reform Movements',
              'Indian National Congress, Gandhian Era',
              'Quit India Movement, Partition & Independence',
            ],
          },
          {
            title: 'Indian & World Geography',
            description: 'Physical, Social, Economic Geography of India and World',
            weightage: '~10-15 questions',
            priority: TopicPriority.HIGH,
            order: 2,
            subTopics: [
              'Physical Geography: Landforms, Climate, Oceans',
              'Indian Physiography, Drainage, Climate',
              'Natural Resources: Minerals, Energy, Forests',
              'Agriculture, Industries, Transport',
              'Population, Urbanization, Settlements',
              'World Geography: Continents, Major Regions',
              'Map-based questions',
            ],
          },
          {
            title: 'Indian Polity & Governance',
            description: 'Constitution, Political System, Panchayati Raj, Public Policy',
            weightage: '~15-20 questions',
            priority: TopicPriority.HIGH,
            order: 3,
            subTopics: [
              'Constitution: Preamble, Features, Amendments',
              'Fundamental Rights, Duties, DPSP',
              'Union & State Executive, Legislature',
              'Judiciary: Supreme Court, High Courts',
              'Centre-State Relations, Emergency Provisions',
              'Panchayati Raj, Municipalities',
              'Constitutional & Non-Constitutional Bodies',
            ],
          },
          {
            title: 'Economic & Social Development',
            description: 'Sustainable Development, Poverty, Demographics, Social Sector',
            weightage: '~10-15 questions',
            priority: TopicPriority.MEDIUM,
            order: 4,
            subTopics: [
              'National Income, Planning, NITI Aayog',
              'Money, Banking, Financial Markets',
              'Public Finance, Budget, Taxation',
              'Inflation, Employment, Poverty',
              'Social Sector: Health, Education, Schemes',
              'Sustainable Development Goals',
              'Recent Economic Surveys & Budgets',
            ],
          },
          {
            title: 'Environment & Ecology',
            description: 'Biodiversity, Climate Change, Conservation, Environmental Laws',
            weightage: '~10-15 questions',
            priority: TopicPriority.MEDIUM,
            order: 5,
            subTopics: [
              'Ecosystem, Biodiversity, Hotspots',
              'Climate Change: Causes, Impact, Mitigation',
              'Pollution: Air, Water, Soil, Waste',
              'Conservation: Protected Areas, Species',
              'Environmental Laws, Policies, Treaties',
              'EIA, Green Initiatives, Renewable Energy',
              'Current Environmental Issues',
            ],
          },
          {
            title: 'General Science',
            description: 'Physics, Chemistry, Biology basics + Science & Technology',
            weightage: '~10-15 questions',
            priority: TopicPriority.MEDIUM,
            order: 6,
            subTopics: [
              'Physics: Motion, Energy, Light, Sound',
              'Chemistry: Matter, Reactions, Periodic Table',
              'Biology: Cell, Genetics, Human Body, Diseases',
              'Space Technology: ISRO, Missions, Satellites',
              'Defense Technology: Missiles, Systems',
              'Biotechnology, Nanotechnology, AI',
              'Nobel Prizes, Recent Discoveries',
            ],
          },
          {
            title: 'Current Affairs',
            description: 'National & International Events of Last 12-18 Months',
            weightage: '~15-25 questions',
            priority: TopicPriority.HIGH,
            order: 7,
            subTopics: [
              'Government Schemes & Policies',
              'International Relations, Summits, Treaties',
              'Economic Developments, Reports, Indices',
              'Science & Tech Breakthroughs',
              'Environment & Climate Agreements',
              'Sports, Awards, Books, Personalities',
              'State-specific Developments',
            ],
          },
        ],
      },
      {
        paper: SyllabusPaper.GS_PAPER_II_CSAT,
        title: 'General Studies Paper II (CSAT)',
        description: 'Comprehension, Reasoning, Quantitative Aptitude, Decision Making',
        icon: 'Target',
        color: 'text-green-600',
        bgColor: 'bg-green-50 border-green-100',
        order: 2,
        topics: [
          {
            title: 'Comprehension',
            description: 'Reading passages with inference-based questions',
            weightage: '~25-30 questions',
            priority: TopicPriority.MEDIUM,
            order: 1,
            subTopics: [
              'Short & Long Passages',
              'Inference & Assumption Questions',
              'Tone & Theme Identification',
              'Vocabulary in Context',
            ],
          },
          {
            title: 'Logical Reasoning & Analytical Ability',
            description: 'Pattern recognition, logical deduction, analytical puzzles',
            weightage: '~15-20 questions',
            priority: TopicPriority.MEDIUM,
            order: 2,
            subTopics: [
              'Syllogisms, Statements & Conclusions',
              'Blood Relations, Direction Sense',
              'Coding-Decoding, Series Completion',
              'Puzzles: Seating, Scheduling, Grouping',
              'Data Sufficiency, Decision Making',
            ],
          },
          {
            title: 'Quantitative Aptitude',
            description: 'Basic numeracy, data interpretation, mental math',
            weightage: '~10-15 questions',
            priority: TopicPriority.MEDIUM,
            order: 3,
            subTopics: [
              'Number System, HCF/LCM, Percentages',
              'Ratio, Proportion, Partnership',
              'Time & Work, Time Speed Distance',
              'Profit Loss, Simple/Compound Interest',
              'Data Interpretation: Tables, Charts, Graphs',
              'Permutation, Combination, Probability',
            ],
          },
          {
            title: 'Decision Making & Problem Solving',
            description: 'Situational judgment, administrative decision scenarios',
            weightage: '~5-10 questions',
            priority: TopicPriority.LOW,
            order: 4,
            subTopics: [
              'Ethical Decision Making',
              'Administrative Scenarios',
              'Policy Implementation Challenges',
              'Conflict Resolution',
            ],
          },
        ],
      },
    ];

    for (const sectionData of sections) {
      const { topics, ...sectionFields } = sectionData;

      const existingSection = await this.prisma.syllabusSection.findUnique({
        where: { paper: sectionFields.paper },
      });

      let section;
      if (existingSection) {
        section = await this.prisma.syllabusSection.update({
          where: { paper: sectionFields.paper },
          data: sectionFields,
        });
      } else {
        section = await this.prisma.syllabusSection.create({
          data: sectionFields,
        });
      }

      for (const topicData of topics) {
        const { subTopics, ...topicFields } = topicData;

        const existingTopic = await this.prisma.syllabusTopic.findFirst({
          where: {
            title: topicFields.title,
            sectionId: section.id,
          },
        });

        let topic;
        if (existingTopic) {
          topic = await this.prisma.syllabusTopic.update({
            where: { id: existingTopic.id },
            data: topicFields,
          });
        } else {
          topic = await this.prisma.syllabusTopic.create({
            data: {
              ...topicFields,
              sectionId: section.id,
            },
          });
        }

        for (const subTopicTitle of subTopics) {
          const existingSub = await this.prisma.subTopic.findFirst({
            where: {
              title: subTopicTitle,
              topicId: topic.id,
            },
          });

          if (!existingSub) {
            await this.prisma.subTopic.create({
              data: {
                title: subTopicTitle,
                topicId: topic.id,
              },
            });
          }
        }
      }
    }

    return { message: 'Default curriculum seeded successfully' };
  }
}