import { Module } from '@nestjs/common'
import { AiCommandService } from './ai-command.service'
import { CommandParser } from './parsers/command-parser'
import { LlmIntentParser } from './parsers/llm-intent-parser'
import { DslGenerator } from './parsers/dsl-generator'
import { EngineRouter } from './executors/engine-router'
import { TaskQueueService } from './task/task-queue.service'
import { SiteExecutor } from './executors/site.executor'
import { PlayExecutor } from './executors/play.executor'
import { LayoutExecutor } from './executors/layout.executor'
import { ComponentExecutor } from './executors/component.executor'
import { AdExecutor } from './executors/ad.executor'
import { ThemeExecutor } from './executors/theme.executor'
import { PageExecutor } from './executors/page.executor'
import { ResultExecutor } from './executors/result.executor'
import { SitesModule } from '../sites/sites.module'
import { PlaysModule } from '../plays/plays.module'
import { ResultsModule } from '../results/results.module'
import { PageEditorModule } from '../page-editor/page-editor.module'
import { SettingsModule } from '../settings/settings.module'
import { EnginesModule } from '../../engines/engines.module'

const EXECUTORS = [
  SiteExecutor,
  PlayExecutor,
  LayoutExecutor,
  ComponentExecutor,
  AdExecutor,
  ThemeExecutor,
  PageExecutor,
  ResultExecutor,
]

@Module({
  imports: [
    SitesModule,
    PlaysModule,
    ResultsModule,
    PageEditorModule,
    SettingsModule,
    EnginesModule,
  ],
  providers: [
    CommandParser,
    LlmIntentParser,
    DslGenerator,
    TaskQueueService,
    EngineRouter,
    AiCommandService,
    ...EXECUTORS,
  ],
  exports: [AiCommandService],
})
export class AiCommandModule {}
