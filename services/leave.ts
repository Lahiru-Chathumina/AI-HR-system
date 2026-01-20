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
    // documentation එකට අනුව: GET /api/v1/leaves
    return api.get<Leave[]>("/api/v1/leaves");
  },

  // අලුත් නිවාඩු ඉල්ලීමක් ඇතුළත් කිරීම
  async createLeave(data: CreateLeaveData): Promise<Leave> {
    // documentation එකට අනුව: POST /api/v1/leaves
    // මෙතන .data ඉවත් කළේ ඔබේ api instance එක කෙලින්ම object එක return කරන නිසා විය යුතුයි
    return api.post<Leave>("/api/v1/leaves", data);
  },

  // නිවාඩු ඉල්ලීමක් Approve හෝ Reject කිරීම
  async updateLeaveStatus(id: number, status: "Approved" | "Rejected"): Promise<Leave> {
    // documentation එකට අනුව: PUT /api/v1/leaves/{id}/status
    return api.put<Leave>(`/api/v1/leaves/${id}/status`, { status });
  }
}