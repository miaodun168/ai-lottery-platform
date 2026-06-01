import { http } from './index'

export interface LoginDto { username: string; password: string }
export interface LoginResult { access_token: string; user: { id: string; username: string; role: string } }

export const authApi = {
  login:   (dto: LoginDto)  => http.post<any, LoginResult>('/auth/login', dto),
  profile: ()               => http.get<any, any>('/auth/profile'),
}
