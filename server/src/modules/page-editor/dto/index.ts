import { IsArray, IsBoolean, IsIn, IsInt, IsNumber, IsOptional, IsString, ValidateNested, Min } from 'class-validator'
import { Type } from 'class-transformer'

// ─── 初始化页面 ───────────────────────────────────────────────────────────────

export class InitPageDto {
  @IsIn(['home','results','play_detail','statistics','category'])
  page_type: string

  @IsOptional() @IsString()
  layout_code?: string

  @IsOptional() @IsInt() @Min(1)
  play_count?: number

  @IsOptional() @IsInt() @Min(0)
  ad_count?: number

  @IsOptional() @IsInt() @Min(0)
  cat_count?: number
}

// ─── 新增组件 ─────────────────────────────────────────────────────────────────

export class AddComponentDto {
  @IsString()
  component_type: string

  @IsOptional() @IsInt()
  sort?: number

  @IsOptional() @IsString()
  template?: string

  @IsOptional()
  config?: Record<string, any>

  @IsOptional() @IsInt()
  play_index?: number

  @IsOptional() @IsInt()
  ad_index?: number

  @IsOptional() @IsInt()
  cat_index?: number
}

// ─── 修改组件（模板/visible/config）──────────────────────────────────────────

export class UpdateComponentDto {
  @IsOptional() @IsString()
  template?: string

  @IsOptional() @IsBoolean()
  visible?: boolean

  @IsOptional()
  config?: Record<string, any>
}

// ─── 拖拽排序 ─────────────────────────────────────────────────────────────────

export class SortComponentsDto {
  @IsArray()
  @IsString({ each: true })
  ids: string[]  // component instance id 数组，按新顺序排列
}

// ─── 修改广告/栏目位置配置 ────────────────────────────────────────────────────

export class UpdateLayoutConfigDto {
  @IsOptional() @IsInt() @Min(1)
  ad_interval?: number

  @IsOptional() @IsArray() @IsInt({ each: true })
  cat_positions?: number[]

  @IsOptional() @IsInt() @Min(1)
  lazy_initial?: number

  @IsOptional() @IsInt() @Min(1)
  lazy_batch?: number
}

// ─── 导入 DSL ─────────────────────────────────────────────────────────────────

export class ImportDslDto {
  dsl: PageDslDoc
}

// ─── DSL 文档结构（供导入导出共用）──────────────────────────────────────────

export interface ComponentDslItem {
  id?:           string
  component_type: string
  sort:           number
  visible:        boolean
  template:       string
  config:         Record<string, any>
  play_index?:    number | null
  ad_index?:      number | null
  cat_index?:     number | null
  is_fixed:       boolean
}

export interface PageDslDoc {
  version:      number
  site_id:      string
  page_type:    string
  layout_code:  string
  layout_name:  string
  lazy:         { enabled: boolean; initial: number; batch: number }
  ad_config:    { count: number; interval: number }
  cat_config:   { count: number; positions: number[] }
  components:   ComponentDslItem[]
  exported_at:  string
  exported_by?: string
}
