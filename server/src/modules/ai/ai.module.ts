import { Module } from '@nestjs/common'
import { AiController } from './ai.controller'
import { AiService } from './ai.service'
import { AiCommandModule } from '../ai-command/ai-command.module'

@Module({
  imports:     [AiCommandModule],
  controllers: [AiController],
  providers:   [AiService],
  exports:     [AiService],
})
export class AiModule {}
