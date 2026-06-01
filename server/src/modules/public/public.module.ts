import { Module } from '@nestjs/common'
import { PublicController } from './public.controller'
import { PublicService } from './public.service'
import { EnginesModule } from '../../engines/engines.module'

@Module({
  imports:     [EnginesModule],
  controllers: [PublicController],
  providers:   [PublicService],
})
export class PublicModule {}
