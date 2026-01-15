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
  // Backend එකේ /company/{id} නැති නිසා සියල්ල ගෙන filter කරමු
  async getEmployeesByCompany(companyId: number): Promise<Employee[]> {
    try {
      const allEmployees = await api.get<Employee[]>("/api/v1/employees")
      // සේවකයාගේ company object එකේ id එක අපේ company id එකට සමාන අය පමණක් ගනී
      return allEmployees.filter(emp => emp.company?.id === companyId)
    } catch (error) {
      console.error("Error filtering employees:", error)
      return []
    }
  },

  // Backend @PostMapping("/api/v1/employees") ට අනුව
  async createEmployee(data: CreateEmployeeData): Promise<Employee> {
    return api.post<Employee>("/api/v1/employees", data)
  },

  async deleteEmployee(id: number): Promise<void> {
    return api.delete(`/api/v1/employees/${id}`)
  }
}
