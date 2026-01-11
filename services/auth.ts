import { api } from "./api"

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  company: {
    id: number
    name: string
    email: string
    phone?: string
    address?: string
    registrationDate?: string
  }
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
  phone?: string
  address?: string
}

export const authService = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    return api.post<LoginResponse>("/api/auth/login", data)
  },

  async register(data: RegisterRequest): Promise<LoginResponse> {
    return api.post<LoginResponse>("/api/companies/add", data)
  },
}
