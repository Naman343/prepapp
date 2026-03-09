import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    email: string,
    pass: string,
  ): Promise<{ id: string; email: string; role: string } | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user && (await bcrypt.compare(pass, user.passwordHash))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  login(user: { id: string; email: string; role: string }) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }

  async register(email: string, pass: string) {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(pass, 10);
    const memberId = randomBytes(6).toString('hex');

    const user = await this.prisma.user.create({
      data: { email, passwordHash: hashedPassword, memberId },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, memberId: _mid, ...result } = user;
    return result;
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
        mobileNumber: true,
        dob: true,
        location: true,
        category: true,
        pwd: true,
        memberTier: true,
        createdAt: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateProfile(
    userId: string,
    data: {
      name?: string;
      mobileNumber?: string;
      dob?: string;
      location?: string;
      category?: 'GEN' | 'EWS' | 'OBC' | 'SC' | 'ST';
      pwd?: boolean;
    },
  ) {
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...data,
        dob: data.dob ? new Date(data.dob) : undefined,
      },
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
        mobileNumber: true,
        dob: true,
        location: true,
        category: true,
        pwd: true,
        memberTier: true,
        createdAt: true,
      },
    });
    return updated;
  }
}
