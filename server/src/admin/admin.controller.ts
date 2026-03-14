import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminService } from './admin.service';
import { RolesGuard } from './roles.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';

type UploadedPdfFile = {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
};

@Controller('admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ── Stats ───────────────────────────────────────────────────────────────────
  @Get('stats')
  getStats() {
    return this.adminService.getStats();
  }

  // ── Subjects ────────────────────────────────────────────────────────────────
  @Get('subjects')
  getSubjects() {
    return this.adminService.getSubjects();
  }

  @Post('subjects')
  createSubject(@Body() body: { name: string }) {
    if (!body.name?.trim()) throw new BadRequestException('name is required');
    return this.adminService.createSubject(body.name.trim());
  }

  @Delete('subjects/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteSubject(@Param('id') id: string) {
    return this.adminService.deleteSubject(id);
  }

  // ── Topics ──────────────────────────────────────────────────────────────────
  @Get('topics')
  getTopics() {
    return this.adminService.getTopics();
  }

  @Post('topics')
  createTopic(
    @Body()
    body: { name: string; subjectId: string; parentTopicId?: string },
  ) {
    if (!body.name?.trim()) throw new BadRequestException('name is required');
    if (!body.subjectId) throw new BadRequestException('subjectId is required');
    return this.adminService.createTopic(
      body.name.trim(),
      body.subjectId,
      body.parentTopicId,
    );
  }

  @Delete('topics/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteTopic(@Param('id') id: string) {
    return this.adminService.deleteTopic(id);
  }

  // ── Questions ───────────────────────────────────────────────────────────────
  @Get('questions')
  getQuestions(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('topicId') topicId?: string,
  ) {
    return this.adminService.getQuestions(page, limit, topicId);
  }

  @Post('questions')
  createQuestion(
    @Body()
    body: {
      text: string;
      examYear?: number;
      difficulty: 'EASY' | 'MEDIUM' | 'HARD';
      explanation?: string;
      topicId: string;
      imageUrl?: string;
      options: { text: string; isCorrect: boolean }[];
    },
  ) {
    return this.adminService.createQuestion(body);
  }

  @Patch('questions/:id')
  updateQuestion(
    @Param('id') id: string,
    @Body()
    body: {
      text?: string;
      examYear?: number;
      difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
      explanation?: string;
      topicId?: string;
      imageUrl?: string;
      options?: { text: string; isCorrect: boolean }[];
    },
  ) {
    return this.adminService.updateQuestion(id, body);
  }

  @Delete('questions/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteQuestion(@Param('id') id: string) {
    return this.adminService.deleteQuestion(id);
  }

  // ── Tests ───────────────────────────────────────────────────────────────────
  @Get('tests')
  getTests() {
    return this.adminService.getTests();
  }

  @Get('tests/:id/questions')
  getTestQuestions(@Param('id') id: string) {
    return this.adminService.getTestQuestions(id);
  }

  @Post('tests')
  createTest(
    @Body()
    body: {
      title: string;
      duration: number;
      totalQuestions: number;
      year?: number;
      date?: string;
      isPublished?: boolean;
    },
  ) {
    return this.adminService.createTest(body);
  }

  @Patch('tests/:id')
  updateTest(
    @Param('id') id: string,
    @Body()
    body: {
      title?: string;
      duration?: number;
      totalQuestions?: number;
      year?: number;
      isPublished?: boolean;
    },
  ) {
    return this.adminService.updateTest(id, body);
  }

  @Delete('tests/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteTest(@Param('id') id: string) {
    return this.adminService.deleteTest(id);
  }

  @Post('tests/:id/questions')
  assignQuestionsToTest(
    @Param('id') testId: string,
    @Body() body: { questionIds: string[] },
  ) {
    return this.adminService.assignQuestionsToTest(testId, body.questionIds);
  }

  @Delete('tests/:testId/questions/:questionId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeQuestionFromTest(
    @Param('testId') testId: string,
    @Param('questionId') questionId: string,
  ) {
    return this.adminService.removeQuestionFromTest(testId, questionId);
  }

  // ── Bulk Import ──────────────────────────────────────────────────────────────
  @Post('import/extract-pdf')
  @UseInterceptors(FileInterceptor('pdf_file'))
  extractPdfForImport(
    @UploadedFile() pdfFile: UploadedPdfFile,
    @Body()
    body: {
      instructions?: string;
      provider?: string;
      model?: string;
      focus_mode?: 'balanced' | 'focused' | 'exhaustive';
      chunk_mode?: 'auto' | 'page' | 'numbered' | 'window';
    },
  ) {
    return this.adminService.extractImportPayloadFromPdf(pdfFile, {
      instructions: body.instructions,
      provider: body.provider,
      model: body.model,
      focusMode: body.focus_mode,
      chunkMode: body.chunk_mode,
    });
  }

  @Post('import')
  bulkImport(@Body() body: object) {
    return this.adminService.bulkImport(body as Parameters<AdminService['bulkImport']>[0]);
  }

  // ── Image Upload ──────────────────────────────────────────────────────────────
  @Post('upload-image')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          const dir = join(process.cwd(), 'uploads');
          if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
          cb(null, dir);
        },
        filename: (_req, file, cb) => {
          const unique = crypto.randomBytes(10).toString('hex');
          cb(null, `${unique}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          cb(new BadRequestException('Only image files are allowed'), false);
        } else {
          cb(null, true);
        }
      },
      limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    }),
  )
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No image uploaded');
    return { url: `/uploads/${file.filename}` };
  }
}
