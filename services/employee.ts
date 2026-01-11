import { api } from "./api"

export interface Employee {
  id: number
  firstName: string
  lastName: string
  email: string
  phone?: string
  position?: string
  department?: string
  salary?: number
  hireDate?: string
  companyId: number
}

export interface CreateEmployeeData {
  firstName: string
  lastName: string
  email: string
  phone?: string
  position?: string
  department?: string
  salary?: number
  hireDate?: string
  companyId: number
}

export interface UpdateEmployeeData extends Partial<CreateEmployeeData> {}

export const employeeService = {
  async getAllEmployees(): Promise<Employee[]> {
    return api.get<Employee[]>("/api/employees")
  },

  async getEmployee(id: number): Promise<Employee> {
    return api.get<Employee>(`/api/employees/${id}`)
  },

  async getEmployeesByCompany(companyId: number): Promise<Employee[]> {
    return api.get<Employee[]>(`/api/employees/company/${companyId}`)
  },

  async createEmployee(data: CreateEmployeeData): Promise<Employee> {
    return api.post<Employee>("/api/employees/add", data)
  },

  async updateEmployee(id: number, data: UpdateEmployeeData): Promise<Employee> {
    return api.put<Employee>(`/api/employees/update/${id}`, data)
  },

  async deleteEmployee(id: number): Promise<void> {
    return api.delete(`/api/employees/${id}`)
  },
}
