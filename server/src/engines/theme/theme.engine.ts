import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { ThemeConfig, THEME_LIBRARY } from './theme.constants'

@Injectable()
export class ThemeEngine {
  constructor(private prisma: PrismaService) {}

  // ─── 解析主题（优先 DB 覆盖，fallback 常量库）────────────────────────────

  resolve(themeCode: string): ThemeConfig {
    return THEME_LIBRARY[themeCode] ?? THEME_LIBRARY['theme_default']
  }

  // ─── 列出所有可用主题 ──────────────────────────────────────────────────

  listAll(): Array<{ code: string; name: string; description: string; preview: { primary: string; secondary: string } }> {
    return Object.values(THEME_LIBRARY).map(t => ({
      code:        t.theme_code,
      name:        t.name,
      description: t.description,
      preview:     { primary: t.colors.primary, secondary: t.colors.secondary },
    }))
  }

  // ─── 生成 CSS 变量字符串（供前端直接注入 :root）─────────────────────────

  toCssVars(theme: ThemeConfig): Record<string, string> {
    return {
      '--color-primary':    theme.colors.primary,
      '--color-secondary':  theme.colors.secondary,
      '--color-success':    theme.colors.success,
      '--color-danger':     theme.colors.danger,
      '--color-warning':    theme.colors.warning,
      '--color-bg':         theme.colors.background,
      '--color-surface':    theme.colors.surface,
      '--color-text':       theme.colors.text,
      '--color-text-muted': theme.colors.text_muted,
      '--color-border':     theme.colors.border,
      '--font-family':      theme.typography.font_family,
      '--font-h1':          `${theme.typography.h1}px`,
      '--font-h2':          `${theme.typography.h2}px`,
      '--font-h3':          `${theme.typography.h3}px`,
      '--font-body':        `${theme.typography.body}px`,
      '--font-small':       `${theme.typography.small}px`,
      '--radius-small':     `${theme.radius.small}px`,
      '--radius-medium':    `${theme.radius.medium}px`,
      '--radius-large':     `${theme.radius.large}px`,
      '--radius-card':      `${theme.radius.card}px`,
      '--radius-button':    `${theme.radius.button}px`,
      '--shadow-small':     theme.shadow.small,
      '--shadow-medium':    theme.shadow.medium,
      '--shadow-large':     theme.shadow.large,
      '--animation':        theme.animation,
      '--btn-height':       `${theme.button.height}px`,
    }
  }

  // ─── 从 DB theme 表加载（已有站点绑定的主题 config_json）────────────────

  async loadFromDb(themeId: bigint): Promise<ThemeConfig | null> {
    const row = await this.prisma.theme.findUnique({ where: { id: themeId } })
    if (!row) return null
    const code = (row.config_json as any)?.theme_code ?? row.theme_code
    return this.resolve(code ?? 'theme_default')
  }

  // ─── 把常量库同步到 DB（首次初始化用）────────────────────────────────

  async syncToDb() {
    for (const t of Object.values(THEME_LIBRARY)) {
      const exists = await this.prisma.theme.findFirst({ where: { theme_code: t.theme_code } })
      if (!exists) {
        await this.prisma.theme.create({
          data: {
            theme_code:  t.theme_code,
            theme_name:  t.name,
            config_json: t as any,
            created_at:  new Date(),
          },
        })
      }
    }
  }
}
