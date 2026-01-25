"use client"

import { api } from "./api"

export interface LoginRequest {
  email: string
  password: string
}

// Backend එකෙන් එන AuthResponseDTO එකට ගැලපෙන විදියට
export interface LoginResponse {
  token: string
  name: string    // සමාගමේ නම
  role: string    // ROLE_COMPANY
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
  phone: string
  taxId: string
  address?: string
}

export const authService = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    // Backend එකේ v1 පථය නිවැරදිව භාවිතා කර ඇත
    return api.post<LoginResponse>("/api/v1/auth/login", data)
  },

  async register(data: RegisterRequest): Promise<LoginResponse> {
    // Registration පථය
    return api.post<LoginResponse>("/api/companies/add", data)
  },
}