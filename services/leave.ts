import { api } from "./api"

export interface Leave {
  id: number
  employeeName: string
  leaveType: string
  startDate: string
  endDate: string
  reason: string
  status: "Pending" | "Approved" | "Rejected"
}

export interface CreateLeaveData {
  employeeId: number
  leaveType: string
  startDate: string
  endDate: string
  reason: string
}

export const leaveService = {
  // සියලුම නිවාඩු ඉල්ලීම් ලබා ගැනීම
  async getAllLeaves(): Promise<Leave[]> {
    return api.get<Leave[]>("/api/v1/leaves")
  },

  // අලුත් නිවාඩු ඉල්ලීමක් ඇතුළත් කිරීම
  async createLeave(data: CreateLeaveData): Promise<Leave> {
    return api.post<Leave>("/api/v1/leaves", data)
  },

  // නිවාඩු ඉල්ලීමක් Approve හෝ Reject කිරීම
  async updateLeaveStatus(id: number, status: string): Promise<Leave> {
    return api.put<Leave>(`/api/v1/leaves/${id}/status`, { status })
  },

  // නිවාඩු ඉල්ලීමක් ඉවත් කිරීම
  async deleteLeave(id: number): Promise<void> {
    return api.delete(`/api/v1/leaves/${id}`)
  }
}
