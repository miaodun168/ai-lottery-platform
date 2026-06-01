import { Injectable, ConflictException, NotFoundException } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { PrismaService } from '../../prisma/prisma.service'
import { AuditLogService } from '../../common/services/audit-log.service'
import { CreateAdminUserDto } from './dto/create-admin-user.dto'
import { UpdateAdminUserDto } from './dto/update-admin-user.dto'

@Injectable()
export class AdminUsersService {
  constructor(
    private prisma:    PrismaService,
    private auditLog:  AuditLogService,
  ) {}

  async findAll() {
    const users = await this.prisma.adminUser.findMany({
      orderBy: { created_at: 'desc' },
    })
    return users.map(u => ({
      id: u.id.toString(), username: u.username, role: u.role, status: u.status, created_at: u.created_at,
    }))
  }

  async findOne(id: bigint) {
    const u = await this.prisma.adminUser.findUnique({ where: { id } })
    if (!u) throw new NotFoundException('用户不存在')
    return { id: u.id.toString(), username: u.username, role: u.role, status: u.status }
  }

  async create(dto: CreateAdminUserDto, operatorId: bigint) {
    const exists = await this.prisma.adminUser.findFirst({ where: { username: dto.username } })
    if (exists) throw new ConflictException(`用户名 ${dto.username} 已存在`)

    const hash = await bcrypt.hash(dto.password, 10)
    const user = await this.prisma.adminUser.create({
      data: { username: dto.username, password_hash: hash, role: dto.role, status: true, created_at: new Date() },
    })

    await this.auditLog.log(operatorId, 'CREATE_USER', 'admin_user', user.id, { username: dto.username, role: dto.role })
    return { id: user.id.toString(), username: user.username, role: user.role }
  }

  async update(id: bigint, dto: UpdateAdminUserDto, operatorId: bigint) {
    const user = await this.prisma.adminUser.findUnique({ where: { id } })
    if (!user) throw new NotFoundException('用户不存在')

    const updateData: any = {}
    if (dto.role !== undefined)   updateData.role   = dto.role
    if (dto.status !== undefined) updateData.status = dto.status
    if (dto.password)             updateData.password_hash = await bcrypt.hash(dto.password, 10)

    const updated = await this.prisma.adminUser.update({ where: { id }, data: updateData })
    await this.auditLog.log(operatorId, 'UPDATE_USER', 'admin_user', id, dto)
    return { id: updated.id.toString(), username: updated.username, role: updated.role, status: updated.status }
  }

  async remove(id: bigint, operatorId: bigint) {
    const user = await this.prisma.adminUser.findUnique({ where: { id } })
    if (!user) throw new NotFoundException('用户不存在')
    if (user.role === 'SuperAdmin') throw new ConflictException('不能删除超级管理员')

    await this.prisma.adminUser.update({ where: { id }, data: { status: false } })
    await this.auditLog.log(operatorId, 'DISABLE_USER', 'admin_user', id)
    return { success: true }
  }
}
