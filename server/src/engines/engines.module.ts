import { Module } from '@nestjs/common'
import { AttributeEngine } from './attribute/attribute.engine'
import { PlayEngine } from './play/play.engine'
import { ResultEngine } from './result/result.engine'
import { SettlementEngine } from './settlement/settlement.engine'
import { StatisticsEngine } from './statistics/statistics.engine'
import { ThemeEngine } from './theme/theme.engine'
import { LayoutEngine } from './layout/layout.engine'
import { SiteBuilderService } from './site-builder/site-builder.service'

const ENGINES = [
  AttributeEngine, PlayEngine, ResultEngine, SettlementEngine, StatisticsEngine,
  ThemeEngine, LayoutEngine, SiteBuilderService,
]

@Module({
  providers: ENGINES,
  exports:   ENGINES,
})
export class EnginesModule {}
