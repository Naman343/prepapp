import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request as Req,
  Get,
  Param,
} from '@nestjs/common';
import { Request } from 'express';
import { ExamService } from './exam.service';
import { StartTestDto, SubmitAnswerDto } from './dto/exam.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('exam')
@UseGuards(AuthGuard('jwt'))
export class ExamController {
  constructor(private readonly examService: ExamService) {}

  @Post('start')
  startTest(
    @Req() req: Request & { user?: { userId: string } },
    @Body() startTestDto: StartTestDto,
  ) {
    return this.examService.startTest(req.user!.userId, startTestDto);
  }

  @Post('submit-answer')
  submitAnswer(
    @Req() req: Request & { user?: { userId: string } },
    @Body() submitDto: SubmitAnswerDto,
  ) {
    return this.examService.submitAnswer(req.user!.userId, submitDto);
  }

  @Post('clear-answer')
  clearAnswer(
    @Req() req: Request & { user?: { userId: string } },
    @Body() body: { attemptId: string; questionId: string },
  ) {
    return this.examService.clearAnswer(
      req.user!.userId,
      body.attemptId,
      body.questionId,
    );
  }

  @Post('finish')
  finishTest(
    @Req() req: Request & { user?: { userId: string } },
    @Body() body: { attemptId: string },
  ) {
    return this.examService.finishTest(req.user!.userId, body.attemptId);
  }

  @Get(':attemptId/questions')
  getQuestions(
    @Req() req: Request & { user?: { userId: string } },
    @Param('attemptId') attemptId: string,
  ) {
    return this.examService.getExamQuestions(req.user!.userId, attemptId);
  }

  @Get('result/:attemptId')
  getResult(
    @Req() req: Request & { user?: { userId: string } },
    @Param('attemptId') attemptId: string,
  ) {
    return this.examService.getAttemptResult(req.user!.userId, attemptId);
  }
}
