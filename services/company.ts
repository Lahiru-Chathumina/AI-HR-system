import { api } from "./api"

export interface Company {
  id: number
  name: string
  email: string
  phone?: string
  address?: string
  registrationDate?: string
}

export interface UpdateCompanyData {
  name?: string
  email?: string
  phone?: string
  address?: string
}

export const companyService = {
  async getCompany(id: number): Promise<Company> {
    return api.get<Company>(`/api/companies/${id}`)
  },

  async updateCompany(id: number, data: UpdateCompanyData): Promise<Company> {
    return api.put<Company>(`/api/companies/update/${id}`, data)
  },

  async getAllCompanies(): Promise<Company[]> {
    return api.get<Company[]>("/api/companies")
  },
}
