import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { PrismaService } from '../../prisma/prisma.service'
import { AuditLogService } from '../../common/services/audit-log.service'
import { LoginDto } from './dto/login.dto'

@Injectable()
export class AuthService {
  constructor(
    private prisma:       PrismaService,
    private jwtService:   JwtService,
    private auditLog:     AuditLogService,
  ) {}

  async login(dto: LoginDto): Promise<{ access_token: string; user: any }> {
    const user = await this.prisma.adminUser.findFirst({
      where: { username: dto.username },
    })

    if (!user || !user.status) throw new UnauthorizedException('用户名或密码错误')

    const valid = await bcrypt.compare(dto.password, user.password_hash)
    if (!valid) throw new UnauthorizedException('用户名或密码错误')

    const token = this.jwtService.sign({
      sub:      user.id.toString(),
      username: user.username,
      role:     user.role,
    })

    await this.auditLog.log(user.id, 'LOGIN', 'admin_user', user.id)

    return {
      access_token: token,
      user: { id: user.id.toString(), username: user.username, role: user.role },
    }
  }

  async getProfile(userId: bigint): Promise<any> {
    const user = await this.prisma.adminUser.findUnique({
      where: { id: userId },
    })
    if (!user) throw new UnauthorizedException('用户不存在')
    return { id: user.id.toString(), username: user.username, role: user.role, status: user.status }
  }

  // 初始化超级管理员（首次使用时调用）
  async initSuperAdmin(): Promise<void> {
    const exists = await this.prisma.adminUser.findFirst({ where: { role: 'SuperAdmin' } })
    if (exists) return

    const hash = await bcrypt.hash('admin123456', 10)
    await this.prisma.adminUser.create({
      data: {
        username:      'admin',
        password_hash: hash,
        role:          'SuperAdmin',
        status:        true,
        created_at:    new Date(),
      },
    })
  }
}
