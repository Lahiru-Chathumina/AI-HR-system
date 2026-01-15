import { api } from "./api"

export interface Attendance {
  id: number
  employeeName: string
  date: string
  clockIn: string
  clockOut: string | null
  status: "Present" | "Absent" | "Late"
  workHours: number | null
}

export interface MarkAttendanceData {
  employeeId: number
  status: string
  clockIn: string
}

export const attendanceService = {
  // සියලුම පැමිණීමේ වාර්තා ලබා ගැනීම
  async getAllAttendance(): Promise<Attendance[]> {
    return api.get<Attendance[]>("/api/v1/attendance")
  },

  // සමාගමට අනුව පැමිණීමේ වාර්තා ලබා ගැනීම
  async getAttendanceByCompany(companyId: number): Promise<Attendance[]> {
    return api.get<Attendance[]>(`/api/v1/attendance/company/${companyId}`)
  },

  // පැමිණීම සටහන් කිරීම
  async markAttendance(data: MarkAttendanceData): Promise<Attendance> {
    return api.post<Attendance>("/api/v1/attendance", data)
  }
}
