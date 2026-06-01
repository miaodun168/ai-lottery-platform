import { SetMetadata } from '@nestjs/common'

export type Role = 'SuperAdmin' | 'Admin' | 'Editor' | 'Operator' | 'Viewer'

export const Roles = (...roles: Role[]) => SetMetadata('roles', roles)
