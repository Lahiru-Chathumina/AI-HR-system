"use client"

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
    taxId: string; // මෙයද මෙහි ඇතුළත් කිරීම සුදුසුයි
    registrationDate?: string
  }
}

// මෙන්න මේ interface එකට taxId ඇතුළත් කරන්න
export interface RegisterRequest {
  name: string
  email: string
  password: string
  phone: string;  // Backend validation එකට ගැලපෙන්න ? ඉවත් කළා
  taxId: string;  // අනිවාර්යයෙන්ම තිබිය යුතුයි (මෙය එකතු කරන්න)
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