import { api } from "./api"

export interface Payroll {
  id: number
  employeeId: number
  month: string
  year: number
  basicSalary?: number
  allowances?: number
  deductions?: number
  netSalary?: number
  paymentDate?: string
  status?: string
}

export interface CreatePayrollData {
  employeeId: number
  month: string
  year: number
  basicSalary?: number
  allowances?: number
  deductions?: number
  netSalary?: number
  paymentDate?: string
  status?: string
}

export const payrollService = {
  async getAllPayrolls(): Promise<Payroll[]> {
    return api.get<Payroll[]>("/api/payrolls")
  },

  async getPayroll(id: number): Promise<Payroll> {
    return api.get<Payroll>(`/api/payrolls/${id}`)
  },

  async getPayrollsByEmployee(employeeId: number): Promise<Payroll[]> {
    return api.get<Payroll[]>(`/api/payrolls/employee/${employeeId}`)
  },

  async createPayroll(data: CreatePayrollData): Promise<Payroll> {
    return api.post<Payroll>("/api/payrolls/add", data)
  },

  async updatePayroll(id: number, data: Partial<CreatePayrollData>): Promise<Payroll> {
    return api.put<Payroll>(`/api/payrolls/update/${id}`, data)
  },

  async deletePayroll(id: number): Promise<void> {
    return api.delete(`/api/payrolls/${id}`)
  },
}
