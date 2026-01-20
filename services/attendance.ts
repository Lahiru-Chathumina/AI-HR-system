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

export const attendanceService = {
  // සියලුම පැමිණීම් ලබා ගැනීම
  async getAllAttendance(): Promise<Attendance[]> {
    return api.get<Attendance[]>("/api/v1/attendance");
  },

  // පැමිණීම සටහන් කිරීම (.data error එක මෙහිදී ඉවත් කර ඇත)
  async markAttendance(data: any): Promise<Attendance> {
    const response = await api.post<Attendance>("/api/v1/attendance", data);
    return response; 
  }
}