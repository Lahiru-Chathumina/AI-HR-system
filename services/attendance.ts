import { api } from "./api"

export interface Attendance {
  id: number
  employeeId: number // DTO එකට අනුව employeeId භාවිතා කිරීම වඩාත් නිවැරදියි
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
  // පැමිණීම සටහන් කිරීම
  async markAttendance(data: MarkAttendanceData): Promise<Attendance> {
    // Backend controller එකට අනුව: POST /api/v1/attendance
    return api.post<Attendance>("/api/v1/attendance", data);
  },

  /* සටහන: ඔබගේ Backend AttendanceController එකේ 
     GET ක්‍රම (getAllAttendance, getAttendanceByCompany) දැනට දක්නට නැත.
     එම නිසා ඒවා භාවිතා කිරීමට පෙර Backend එකට අදාළ GET Endpoints එකතු කළ යුතුය.
  */
}