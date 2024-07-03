import { Module } from '@nestjs/common';
import { HelpersService } from './helpers.service';
import { HelpersController } from './helpers.controller';

@Module({
  providers: [HelpersService],
  controllers: [HelpersController]
})
export class HelpersModule {}
