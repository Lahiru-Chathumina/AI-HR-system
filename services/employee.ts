import { api } from "./api"

export interface Employee {
  id: number
  name: string
  position: string
  salary: number
  company?: {
    id: number
    name: string
  }
}

export interface CreateEmployeeData {
  name: string
  position: string
  salary: number
  companyId: number
}

export const employeeService = {
  async getEmployeesByCompany(companyId: number): Promise<Employee[]> {
    return api.get<Employee[]>(`/api/employees/company/${companyId}`)
  },

  async createEmployee(data: CreateEmployeeData): Promise<Employee> {
    return api.post<Employee>("/api/employees/add", data)
  },

  async deleteEmployee(id: number): Promise<void> {
    return api.delete(`/api/employees/${id}`)
  }
}
