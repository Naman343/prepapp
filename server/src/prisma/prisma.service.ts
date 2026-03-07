import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    try {
        await this.$connect();
    } catch (error) {
        // Proceed even if DB connection fails, to allow partial app startup during development
        console.error('Prisma connection failed (expected if DB is offline):', error);
    }
  }
}
