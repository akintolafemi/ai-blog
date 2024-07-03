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
    ThrottlerModule.forRoot([{ //configure rate limit to prevent brute-force attacks
      ttl: 20000,
      limit: 5,  //1 request per 5secs
    }]),
    // CacheModule.register<RedisClientOptions>({ //uncomment to use caching with redis
    //   ttl: 10,
    //   // store: redisStore,
      
    // }),
    AuthModule,
    PrismaModule,
    JwtModule.register({ //handle/configure JWT rules
      global: true, 
      secret: `${process.env.JWT_SECRET}`, 
      secretOrKeyProvider(requestType, tokenOrPayload, options) {  //configure private and public keys to encrypt and decrypt tokens
          switch (requestType) {
            case JwtSecretRequestType.SIGN:
              return fs.readFileSync(`./private.pem`) //private key to encrypt
            case JwtSecretRequestType.VERIFY:
              return fs.readFileSync(`./public.pem`) //public key to decrypt
            default:
              return null;
          }
      },
      signOptions: {
        algorithm: "RS256", //jwt algorithm
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
      .apply(RouteLogger) //use logger for all endpoints... see full functionality in the path @middlewares/route.logger.middleware
      .forRoutes("*")
      .apply(AuthMiddleware) //add a middleware to check user login details before proceeding to sign in service
      .forRoutes("auth/signin")
      .apply(SignUpMiddleware) //add a middleware to check sign up data before proceeding to sign up service
      .forRoutes("auth/signup")
  }}