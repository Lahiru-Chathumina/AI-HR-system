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
  // සේවා ස්ථානය අනුව සේවකයින් ලබා ගැනීම
  async getEmployeesByCompany(companyId: number): Promise<Employee[]> {
    return api.get<Employee[]>(`/api/v1/employees/company/${companyId}`)
  },

  // අලුත් සේවකයෙකු ඇතුළත් කිරීම (POST)
  async createEmployee(data: CreateEmployeeData): Promise<Employee> {
    return api.post<Employee>("/api/v1/employees", data)
  },

  // සේවකයෙකුගේ විස්තර වෙනස් කිරීම (PUT)
  async updateEmployee(id: number, data: Partial<CreateEmployeeData>): Promise<Employee> {
    return api.put<Employee>(`/api/v1/employees/${id}`, data)
  },

  // සේවකයෙකු අයින් කිරීම (DELETE)
  async deleteEmployee(id: number): Promise<void> {
    return api.delete(`/api/v1/employees/${id}`)
  }
}
