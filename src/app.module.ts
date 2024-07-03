import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import * as fs from 'fs-extra';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { RouteLogger } from '@middlewares/route.logger.middleware';
import { AuthMiddleware, SignUpMiddleware } from '@middlewares/auth.middleware';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { JwtModule, JwtSecretRequestType } from '@nestjs/jwt';
import { BlogsModule } from './blogs/blogs.module';
import { CacheInterceptor, CacheModule } from '@nestjs/cache-manager';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import type { RedisClientOptions } from 'redis';
import * as redisStore from 'cache-manager-redis-store';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

declare global {
  interface BigInt {
    toJSON(): string;
  }
}

BigInt.prototype.toJSON = function () {
  return this.toString();
};

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([{
      ttl: 20000,
      limit: 5,  //1 request per 5secs
    }]),
    // CacheModule.register<RedisClientOptions>({
    //   ttl: 10,
    //   // store: redisStore,
      
    // }),
    AuthModule,
    PrismaModule,
    JwtModule.register({
      global: true,
      secret: `${process.env.JWT_SECRET}`,
      secretOrKeyProvider(requestType, tokenOrPayload, options) {
          switch (requestType) {
            case JwtSecretRequestType.SIGN:
              return fs.readFileSync(`./private.pem`)
            case JwtSecretRequestType.VERIFY:
              return fs.readFileSync(`./public.pem`)
            default:
              return null;
          }
      },
      signOptions: {
        algorithm: "RS256",
        issuer: `${process.env.ISSUER}`,
        subject: `${process.env.ISSUER}`
      }
    }),
    BlogsModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    }
    // {
    //   provide: APP_INTERCEPTOR,
    //   useClass: CacheInterceptor,
    // },
  ],
})

export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): any {
    consumer
      .apply(RouteLogger)
      .forRoutes("*")
      .apply(AuthMiddleware)
      .forRoutes("auth/signin")
      .apply(SignUpMiddleware)
      .forRoutes("auth/signup")
  }}