import { api } from "./api"

export interface Leave {
  id: number
  employeeId: number
  startDate: string
  endDate: string
  leaveType?: string
  reason?: string
  status?: string
}

export interface CreateLeaveData {
  employeeId: number
  startDate: string
  endDate: string
  leaveType?: string
  reason?: string
  status?: string
}

export const leaveService = {
  async getAllLeaves(): Promise<Leave[]> {
    return api.get<Leave[]>("/api/leaves")
  },

  async getLeave(id: number): Promise<Leave> {
    return api.get<Leave>(`/api/leaves/${id}`)
  },

  async getLeavesByEmployee(employeeId: number): Promise<Leave[]> {
    return api.get<Leave[]>(`/api/leaves/employee/${employeeId}`)
  },

  async createLeave(data: CreateLeaveData): Promise<Leave> {
    return api.post<Leave>("/api/leaves/add", data)
  },

  async updateLeave(id: number, data: Partial<CreateLeaveData>): Promise<Leave> {
    return api.put<Leave>(`/api/leaves/update/${id}`, data)
  },

  async deleteLeave(id: number): Promise<void> {
    return api.delete(`/api/leaves/${id}`)
  },
}
