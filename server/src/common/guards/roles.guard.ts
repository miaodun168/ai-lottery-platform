import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Role } from '../decorators/roles.decorator'

// 角色权重：越大权限越高
const ROLE_WEIGHT: Record<string, number> = {
  SuperAdmin: 5,
  Admin:      4,
  Editor:     3,
  Operator:   2,
  Viewer:     1,
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<Role[]>('roles', [
      ctx.getHandler(),
      ctx.getClass(),
    ])
    if (!required || required.length === 0) return true

    const { user } = ctx.switchToHttp().getRequest()
    if (!user) return false

    const userWeight  = ROLE_WEIGHT[user.role] ?? 0
    const minRequired = Math.min(...required.map(r => ROLE_WEIGHT[r] ?? 0))

    return userWeight >= minRequired
  }
}
