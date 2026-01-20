import { api } from "./api"

export interface Attendance {
  id: number;
  employeeId: number;
  employeeName?: string;
  date: string;
  clockIn: string;
  clockOut: string | null;
  status: "Present" | "Absent" | "Late";
  workHours: number | null;
}

export interface MarkAttendanceData {
  employeeId: number;
  status: string;
  clockIn: string; // මෙය "08:30" ලෙස තිබිය යුතුය
}

export const attendanceService = {
  /**
   * පැමිණීම සටහන් කිරීම
   * Backend Endpoint: POST /api/v1/attendance
   */
  async markAttendance(data: MarkAttendanceData): Promise<Attendance> {
    // .data ඉවත් කර ඇත්තේ TypeScript error එක මඟහැරීමටයි
    return api.post<Attendance>("/api/v1/attendance", data);
  }
}