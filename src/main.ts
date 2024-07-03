import {
  BadRequestException,
  Logger,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';
import { NestApplication, NestFactory } from '@nestjs/core';
import { AppOptions } from '@utils/app.options.utils';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, AppOptions);
  
  //prepend /ap1/v1 to all api endpoints for versioning
  app.setGlobalPrefix('/api/v1')

  //validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, //ensure to only process only expected keys in request body
      transform: true, //transform/validate all key values in request body to usable types for application
      exceptionFactory: (errors: ValidationError[]) => { //configure error messages based on validation error to readable and understandable error messages
        return new BadRequestException({
          statusText: 'bad request',
          status: 400,
          message:
            errors[0]?.children[0]?.children[0]?.constraints[Object?.keys(errors[0]?.children[0]?.children[0]?.constraints)[0]] ||
            errors[0]?.children[0]?.constraints[Object?.keys(errors[0]?.children[0]?.constraints)[0]] ||
            errors[0]?.constraints[Object?.keys(errors[0]?.constraints)[0]] ||
            'Unable to validate request',
        })
      }
    }),
  );

  const logger = new Logger(NestApplication.name);
  const port = process.env.PORT || 5005;
  await app.listen(port, () => {
    logger.log(`Server is now listening on port ${port}`);
  });
}
bootstrap();
