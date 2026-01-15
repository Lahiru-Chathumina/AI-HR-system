import { api } from "./api"

export interface Employee {
  id: number
  name: string
  position: string
  salary: number
  company?: {
    id: number
    name: string
  } | null // null විය හැකි බව සඳහන් කරන්න
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
    try {
      // සියලුම සේවකයින් API එකෙන් ලබා ගනී
      const allEmployees = await api.get<Employee[]>("/api/v1/employees")
      
      // Backend එකේ company null නිසා තාවකාලිකව filter එක අයින් කරන්න
      // එවිට Swagger එකේ පේන සේවකයෝ ඔක්කොම මෙතනත් පේනවා
      console.log("Fetched Employees:", allEmployees);
      return allEmployees;
      
      /* Backend එකේ companyId එක හරිගැස්සුවාට පස්සේ මේ පේළිය පාවිච්චි කරන්න:
      return allEmployees.filter(emp => emp.company?.id === companyId) 
      */
    } catch (error) {
      console.error("Error fetching employees:", error)
      return []
    }
  },

  async createEmployee(data: CreateEmployeeData): Promise<Employee> {
    return api.post<Employee>("/api/v1/employees", data)
  },

  async deleteEmployee(id: number): Promise<void> {
    return api.delete(`/api/v1/employees/${id}`)
  }
}
