import { api } from "./api"

export interface Leave {
  id: number;
  employeeId: number;    // Backend එකේ Long employeeId
  employeeName?: string; // Response එකේදී ලැබෙන නම
  leaveType: string;
  startDate: string;     // format: "YYYY-MM-DD"
  endDate: string;       // format: "YYYY-MM-DD"
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
}

export interface CreateLeaveData {
  employeeId: number;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
}

export const leaveService = {
  // සියලුම නිවාඩු ඉල්ලීම් ලබා ගැනීම
  async getAllLeaves(): Promise<Leave[]> {
    // GET /api/v1/leaves
    return api.get<Leave[]>("/api/v1/leaves");
  },

  // අලුත් නිවාඩු ඉල්ලීමක් ඇතුළත් කිරීම
  async createLeave(data: CreateLeaveData): Promise<Leave> {
    // TypeScript error එක ඉවත් කිරීමට .data මෙහිදී භාවිතා නොකරයි
    // POST /api/v1/leaves
    return api.post<Leave>("/api/v1/leaves", data);
  },

  // නිවාඩු තත්ත්වය වෙනස් කිරීම
  async updateLeaveStatus(id: number, status: "Approved" | "Rejected"): Promise<Leave> {
    // PUT /api/v1/leaves/{id}/status
    return api.put<Leave>(`/api/v1/leaves/${id}/status`, { status });
  }
}