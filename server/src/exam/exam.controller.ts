import { Controller, Post, Body, UseGuards, Request, Get, Param } from '@nestjs/common';
import { ExamService } from './exam.service';
import { StartTestDto, SubmitAnswerDto } from './dto/exam.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('exam')
@UseGuards(AuthGuard('jwt'))
export class ExamController {
  constructor(private readonly examService: ExamService) { }

  @Post('start')
  startTest(@Request() req: any, @Body() startTestDto: StartTestDto) {
    return this.examService.startTest(req.user.userId, startTestDto);
  }

  @Post('submit-answer')
  submitAnswer(@Request() req: any, @Body() submitDto: SubmitAnswerDto) {
    return this.examService.submitAnswer(req.user.userId, submitDto);
  }

  @Post('clear-answer')
  clearAnswer(@Request() req: any, @Body() body: { attemptId: string; questionId: string }) {
    return this.examService.clearAnswer(req.user.userId, body.attemptId, body.questionId);
  }

  @Post('finish')
  finishTest(@Request() req: any, @Body() body: { attemptId: string }) {
    return this.examService.finishTest(req.user.userId, body.attemptId);
  }

  @Get(':attemptId/questions')
  getQuestions(@Request() req: any, @Param('attemptId') attemptId: string) {
    return this.examService.getExamQuestions(req.user.userId, attemptId);
  }

  @Get('result/:attemptId')
  getResult(@Request() req: any, @Param('attemptId') attemptId: string) {
    return this.examService.getAttemptResult(req.user.userId, attemptId);
  }
}
