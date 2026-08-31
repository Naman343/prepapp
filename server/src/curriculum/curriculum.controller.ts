import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CurriculumService } from './curriculum.service';
import { CreateSectionDto } from './dto/create-section.dto';
import { CreateTopicDto, UpdateTopicDto } from './dto/topic.dto';
import { CreateSubTopicDto, UpdateSubTopicDto } from './dto/sub-topic.dto';
import { CurriculumQueryDto } from './dto/curriculum-query.dto';
import { SyllabusPaper } from '@prisma/client';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../admin/roles.guard';

@ApiTags('Curriculum')
@Controller('curriculum')
export class CurriculumController {
  constructor(private readonly curriculumService: CurriculumService) {}

  @Get()
  @ApiOperation({ summary: 'Get all syllabus sections with topics' })
  async findAll(@Query() query: CurriculumQueryDto) {
    return this.curriculumService.findAllSections(query);
  }

  @Get('paper/:paper')
  @ApiOperation({ summary: 'Get syllabus section by paper' })
  @ApiParam({ name: 'paper', enum: SyllabusPaper })
  async findByPaper(@Param('paper') paper: SyllabusPaper) {
    return this.curriculumService.findSectionByPaper(paper);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search topics across all sections' })
  @ApiQuery({ name: 'q', required: true, description: 'Search query' })
  async search(@Query('q') query: string) {
    return this.curriculumService.searchTopics(query);
  }

  @Post('seed')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiOperation({ summary: 'Seed default UPSC curriculum (Admin only)' })
  async seed() {
    return this.curriculumService.seedDefaultCurriculum();
  }

  @Post('sections')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiOperation({ summary: 'Create a new syllabus section (Admin only)' })
  async createSection(@Body() dto: CreateSectionDto) {
    return this.curriculumService.createSection(dto);
  }

  @Put('sections/:paper')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiOperation({ summary: 'Update a syllabus section (Admin only)' })
  @ApiParam({ name: 'paper', enum: SyllabusPaper })
  async updateSection(@Param('paper') paper: SyllabusPaper, @Body() dto: Partial<CreateSectionDto>) {
    return this.curriculumService.updateSection(paper, dto);
  }

  @Delete('sections/:paper')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiOperation({ summary: 'Delete a syllabus section (Admin only)' })
  @ApiParam({ name: 'paper', enum: SyllabusPaper })
  async deleteSection(@Param('paper') paper: SyllabusPaper) {
    return this.curriculumService.deleteSection(paper);
  }

  @Post('sections/:sectionId/topics')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiOperation({ summary: 'Create a topic in a section (Admin only)' })
  @ApiParam({ name: 'sectionId', type: 'string' })
  async createTopic(@Param('sectionId') sectionId: string, @Body() dto: CreateTopicDto) {
    return this.curriculumService.createTopic(sectionId, dto);
  }

  @Put('topics/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiOperation({ summary: 'Update a topic (Admin only)' })
  @ApiParam({ name: 'id', type: 'string' })
  async updateTopic(@Param('id') id: string, @Body() dto: UpdateTopicDto) {
    return this.curriculumService.updateTopic(id, dto);
  }

  @Delete('topics/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiOperation({ summary: 'Delete a topic (Admin only)' })
  @ApiParam({ name: 'id', type: 'string' })
  async deleteTopic(@Param('id') id: string) {
    return this.curriculumService.deleteTopic(id);
  }

  @Post('topics/:topicId/subtopics')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiOperation({ summary: 'Create a sub-topic (Admin only)' })
  @ApiParam({ name: 'topicId', type: 'string' })
  async createSubTopic(@Param('topicId') topicId: string, @Body() dto: CreateSubTopicDto) {
    return this.curriculumService.createSubTopic(topicId, dto);
  }

  @Put('subtopics/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiOperation({ summary: 'Update a sub-topic (Admin only)' })
  @ApiParam({ name: 'id', type: 'string' })
  async updateSubTopic(@Param('id') id: string, @Body() dto: UpdateSubTopicDto) {
    return this.curriculumService.updateSubTopic(id, dto);
  }

  @Delete('subtopics/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiOperation({ summary: 'Delete a sub-topic (Admin only)' })
  @ApiParam({ name: 'id', type: 'string' })
  async deleteSubTopic(@Param('id') id: string) {
    return this.curriculumService.deleteSubTopic(id);
  }
}