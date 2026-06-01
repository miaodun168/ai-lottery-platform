import { Body, Controller, Delete, Get, Param, Patch, Post, Put, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { PageEditorService } from './page-editor.service'
import {
  InitPageDto, AddComponentDto, UpdateComponentDto,
  SortComponentsDto, UpdateLayoutConfigDto, ImportDslDto,
} from './dto/index'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'
import { CurrentUser, JwtUser } from '../../common/decorators/current-user.decorator'

@ApiTags('页面编辑器（Phase 5.1）')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Admin')
@Controller('admin/sites/:site_id/pages/:page_type')
export class PageEditorController {
  constructor(private readonly pageEditorService: PageEditorService) {}

  // ─── 初始化（首次生成组件实例 + DSL）──────────────────────────────────

  @Post('init')
  @ApiOperation({ summary: '初始化页面（首次生成所有组件实例 + 保存 DSL）' })
  initPage(
    @Param('site_id') siteId: string,
    @Param('page_type') pageType: string,
    @Body() dto: InitPageDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.pageEditorService.initPage(BigInt(siteId), { ...dto, page_type: pageType }, user.id)
  }

  // ─── 组件列表 ─────────────────────────────────────────────────────────

  @Get('components')
  @Roles('Viewer')
  @ApiOperation({ summary: '查询页面所有组件实例（按 sort 排序）' })
  listComponents(@Param('site_id') siteId: string, @Param('page_type') pageType: string) {
    return this.pageEditorService.listComponents(BigInt(siteId), pageType)
  }

  // ─── 新增组件 ─────────────────────────────────────────────────────────

  @Post('components')
  @ApiOperation({ summary: '新增组件（可指定插入位置）' })
  addComponent(
    @Param('site_id') siteId: string,
    @Param('page_type') pageType: string,
    @Body() dto: AddComponentDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.pageEditorService.addComponent(BigInt(siteId), pageType, dto, user.id)
  }

  // ─── 删除组件 ─────────────────────────────────────────────────────────

  @Delete('components/:cid')
  @ApiOperation({ summary: '删除组件（固定组件不可删）' })
  removeComponent(
    @Param('site_id') siteId: string,
    @Param('page_type') pageType: string,
    @Param('cid') cid: string,
    @CurrentUser() user: JwtUser,
  ) {
    return this.pageEditorService.removeComponent(BigInt(siteId), pageType, BigInt(cid), user.id)
  }

  // ─── 修改组件（模板/visible/config）──────────────────────────────────

  @Patch('components/:cid')
  @ApiOperation({ summary: '修改组件属性（模板/显隐/配置）' })
  updateComponent(
    @Param('site_id') siteId: string,
    @Param('page_type') pageType: string,
    @Param('cid') cid: string,
    @Body() dto: UpdateComponentDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.pageEditorService.updateComponent(BigInt(siteId), pageType, BigInt(cid), dto, user.id)
  }

  // ─── 拖拽排序 ─────────────────────────────────────────────────────────

  @Post('components/sort')
  @ApiOperation({ summary: '拖拽排序（传入新的 id 顺序数组）' })
  sortComponents(
    @Param('site_id') siteId: string,
    @Param('page_type') pageType: string,
    @Body() dto: SortComponentsDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.pageEditorService.sortComponents(BigInt(siteId), pageType, dto, user.id)
  }

  // ─── 修改布局配置（广告间隔/栏目位置/懒加载）────────────────────────

  @Put('layout')
  @ApiOperation({ summary: '修改布局参数（广告间隔、栏目位置、懒加载）' })
  updateLayoutConfig(
    @Param('site_id') siteId: string,
    @Param('page_type') pageType: string,
    @Body() dto: UpdateLayoutConfigDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.pageEditorService.updateLayoutConfig(BigInt(siteId), pageType, dto, user.id)
  }

  // ─── DSL 操作 ─────────────────────────────────────────────────────────

  @Post('dsl/save')
  @ApiOperation({ summary: '保存当前状态为 DSL（版本 +1）' })
  saveDsl(
    @Param('site_id') siteId: string,
    @Param('page_type') pageType: string,
    @CurrentUser() user: JwtUser,
  ) {
    return this.pageEditorService.saveDsl(BigInt(siteId), pageType, user.id)
  }

  @Get('dsl')
  @Roles('Viewer')
  @ApiOperation({ summary: '导出页面 DSL（JSON）' })
  exportDsl(@Param('site_id') siteId: string, @Param('page_type') pageType: string) {
    return this.pageEditorService.exportDsl(BigInt(siteId), pageType)
  }

  @Post('dsl')
  @ApiOperation({ summary: '导入页面 DSL（替换所有组件实例）' })
  importDsl(
    @Param('site_id') siteId: string,
    @Param('page_type') pageType: string,
    @Body('dsl') dsl: any,
    @CurrentUser() user: JwtUser,
  ) {
    return this.pageEditorService.importDsl(BigInt(siteId), pageType, dsl, user.id)
  }
}
