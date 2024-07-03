import {
  Injectable,
  OnModuleInit,
  INestApplication,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    super({
      // log: `${process.env.NODE_ENV}` === "development" ? ['query', 'error'] : undefined,
      errorFormat: `${process.env.NODE_ENV}` === "development" ? "pretty" : undefined,
    });
  }
  async onModuleInit() {
    await this.$extends(withAccelerate()).$connect();
    new Logger(PrismaService.name).log('Connected to MySQL service database');
  }

  async enableShutdownHooks(app: INestApplication) {
    process.on("beforeExit", async () => {
      await app.close();
    });
  }
}
