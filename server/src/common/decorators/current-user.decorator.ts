import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export interface JwtUser {
  id:       bigint
  username: string
  role:     string
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtUser => {
    return ctx.switchToHttp().getRequest().user
  },
)
