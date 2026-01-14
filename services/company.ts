import { api } from "./api"

export interface Company {
  id: number
  name: string
  email: string
  phone?: string
  address?: string
  website?: string   // අලුතින් එක් කළා
  industry?: string  // අලුතින් එක් කළා
  size?: string      // අලුතින් එක් කළා
  registrationDate?: string
}

export interface UpdateCompanyData {
  name?: string
  email?: string
  phone?: string
  address?: string
  website?: string   // අලුතින් එක් කළා
  industry?: string  // අලුතින් එක් කළා
  size?: string      // අලුතින් එක් කළා
}

export const companyService = {
  async getCompany(id: number): Promise<Company> {
    return api.get<Company>(`/api/companies/get/${id}`)
  },

  // මෙතන Promise<any> දැම්මේ Backend එකෙන් String එකක් එන නිසා
  async updateCompany(id: number, data: UpdateCompanyData): Promise<any> {
    return api.put<any>(`/api/companies/update/${id}`, data)
  },

  async getAllCompanies(): Promise<Company[]> {
    return api.get<Company[]>("/api/companies/get-all")
  },
} 