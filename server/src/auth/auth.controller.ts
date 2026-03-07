import { Controller, Post, Get, Body, UseGuards, Request as Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(AuthGuard('local'))
  @Post('login')
  login(
    @Req()
    req: Request & { user?: { id: string; email: string; role: string } },
  ) {
    return this.authService.login(req.user!);
  }

  @Post('signup')
  async signup(@Body() body: { email: string; password: string }) {
    return this.authService.register(body.email, body.password);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  async me(@Req() req: Request & { user?: { userId: string; email: string; role: string } }) {
    return {
      id: req.user!.userId,
      email: req.user!.email,
      role: req.user!.role,
    };
  }
}
