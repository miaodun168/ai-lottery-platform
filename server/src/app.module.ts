import { Module } from '@nestjs/common'
import { APP_INTERCEPTOR } from '@nestjs/core'
import { PrismaModule } from './prisma/prisma.module'
import { ResponseInterceptor } from './common/interceptors/response.interceptor'
import { EnginesModule } from './engines/engines.module'

import { AuthModule } from './modules/auth/auth.module'
import { AdminUsersModule } from './modules/admin-users/admin-users.module'
import { LotteryModule } from './modules/lottery/lottery.module'
import { SitesModule } from './modules/sites/sites.module'
import { TemplatesModule } from './modules/templates/templates.module'
import { ThemesModule } from './modules/themes/themes.module'
import { LayoutsModule } from './modules/layouts/layouts.module'
import { PlaysModule } from './modules/plays/plays.module'
import { ResultsModule } from './modules/results/results.module'
import { AttributesModule } from './modules/attributes/attributes.module'
import { PredictionsModule } from './modules/predictions/predictions.module'
import { PredictionBatchesModule } from './modules/prediction-batches/prediction-batches.module'
import { GeneratorModule } from './modules/generator/generator.module'
import { SettlementModule } from './modules/settlement/settlement.module'
import { StatisticsModule } from './modules/statistics/statistics.module'
import { AdsModule } from './modules/ads/ads.module'
import { PagesModule } from './modules/pages/pages.module'
import { ComponentsModule } from './modules/components/components.module'
import { AiModule } from './modules/ai/ai.module'
import { LogsModule } from './modules/logs/logs.module'
import { DeployModule } from './modules/deploy/deploy.module'
import { SettingsModule } from './modules/settings/settings.module'
import { WebhookModule } from './modules/webhook/webhook.module'
import { HkCalendarModule } from './modules/hk-calendar/hk-calendar.module'
import { PublicModule } from './modules/public/public.module'
import { PageEditorModule } from './modules/page-editor/page-editor.module'

@Module({
  imports: [
    PrismaModule,
    EnginesModule,
    // ── 认证与用户
    AuthModule,
    AdminUsersModule,
    // ── 业务核心
    LotteryModule,
    SitesModule,
    PlaysModule,
    ResultsModule,
    HkCalendarModule,
    // ── 预测与结算
    AttributesModule,
    PredictionsModule,
    PredictionBatchesModule,
    GeneratorModule,
    SettlementModule,
    StatisticsModule,
    // ── 内容
    TemplatesModule,
    ThemesModule,
    LayoutsModule,
    AdsModule,
    PagesModule,
    ComponentsModule,
    // ── 系统
    AiModule,
    LogsModule,
    DeployModule,
    SettingsModule,
    WebhookModule,
    // ── 前台公开接口（Site Builder）
    PublicModule,
    // ── 页面编辑器（Phase 5.1）
    PageEditorModule,
  ],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
  ],
})
export class AppModule {}
