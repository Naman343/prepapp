import { Controller, Post, Get, Patch, Body, UseGuards, Request as Req } from '@nestjs/common';
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
    return this.authService.getProfile(req.user!.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('profile')
  async updateProfile(
    @Req() req: Request & { user?: { userId: string } },
    @Body() body: {
      name?: string;
      mobileNumber?: string;
      dob?: string;
      location?: string;
      category?: 'GEN' | 'EWS' | 'OBC' | 'SC' | 'ST';
      pwd?: boolean;
    },
  ) {
    return this.authService.updateProfile(req.user!.userId, body);
  }
}
