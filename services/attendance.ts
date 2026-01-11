import { api } from "./api"

export interface Attendance {
  id: number
  employeeId: number
  date: string
  checkIn?: string
  checkOut?: string
  status?: string
  notes?: string
}

export interface CreateAttendanceData {
  employeeId: number
  date: string
  checkIn?: string
  checkOut?: string
  status?: string
  notes?: string
}

export const attendanceService = {
  async getAllAttendances(): Promise<Attendance[]> {
    return api.get<Attendance[]>("/api/attendances")
  },

  async getAttendance(id: number): Promise<Attendance> {
    return api.get<Attendance>(`/api/attendances/${id}`)
  },

  async getAttendancesByEmployee(employeeId: number): Promise<Attendance[]> {
    return api.get<Attendance[]>(`/api/attendances/employee/${employeeId}`)
  },

  async createAttendance(data: CreateAttendanceData): Promise<Attendance> {
    return api.post<Attendance>("/api/attendances/add", data)
  },

  async updateAttendance(id: number, data: Partial<CreateAttendanceData>): Promise<Attendance> {
    return api.put<Attendance>(`/api/attendances/update/${id}`, data)
  },

  async deleteAttendance(id: number): Promise<void> {
    return api.delete(`/api/attendances/${id}`)
  },
}
