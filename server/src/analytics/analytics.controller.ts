import { Controller, Get, UseGuards, Request as Req } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Controller('analytics')
@UseGuards(AuthGuard('jwt'))
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get()
  getStats(@Req() req: Request & { user?: { userId: string } }) {
    return this.analyticsService.getUserStats(req.user!.userId);
  }
}
