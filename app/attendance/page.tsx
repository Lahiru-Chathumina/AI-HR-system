"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { attendanceService, type Attendance } from "@/services/attendance"
import { employeeService, type Employee } from "@/services/employee"
import { UserCheck, LogIn, Loader2, Clock, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"

export default function AttendancePage() {
  const [attendance, setAttendance] = useState<Attendance[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLogOpen, setIsLogOpen] = useState(false)
  const [newLog, setNewLog] = useState({ employeeId: "", status: "Present", clockIn: "08:30" })

  // Data Load කිරීමේ ක්‍රියාවලිය
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      // 1. මුලින්ම Employees Load කරගන්න (Dropdown එක සඳහා)
      try {
        const empData = await employeeService.getAllEmployees();
        setEmployees(Array.isArray(empData) ? empData : []);
        console.log("Employees loaded successfully");
      } catch (e) {
        console.error("Failed to load employees:", e);
      }

      // 2. ඉන්පසු Attendance Load කරගන්න
      try {
        const attData = await attendanceService.getAllAttendance();
        setAttendance(Array.isArray(attData) ? attData : []);
      } catch (e) {
        console.error("Failed to load attendance records:", e);
        // මෙහිදී Error එකක් ආවත් Employees ටික dropdown එකේ පෙන්වයි
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [])

  const handleLogAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLog.employeeId) return alert("කරුණාකර සේවකයෙකු තෝරන්න!");

    try {
      const entry = await attendanceService.markAttendance({
        employeeId: Number(newLog.employeeId),
        status: newLog.status,
        clockIn: newLog.clockIn
      });
      
      setAttendance(prev => [entry, ...prev]);
      setIsLogOpen(false);
      setNewLog({ employeeId: "", status: "Present", clockIn: "08:30" });
      alert("පැමිණීම සාර්ථකව සටහන් විය!");
    } catch (error) {
      console.error(error);
      alert("දත්ත ඇතුළත් කිරීම අසාර්ථකයි. සේවකයා පද්ධතියේ ඉන්නවාදැයි බලන්න.");
    }
  };

  const todayPresent = attendance.filter(a => a.status === "Present").length
  const todayLate = attendance.filter(a => a.status === "Late").length
  const todayAbsent = attendance.filter(a => a.status === "Absent").length

  return (
    <DashboardLayout>
      <div className="space-y-8 p-4 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Attendance Tracking
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">Manage employee presence efficiently</p>
          </div>
          
          <Dialog open={isLogOpen} onOpenChange={setIsLogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-lg transition-transform hover:scale-105">
                <UserCheck className="mr-2 h-4 w-4" /> Log Attendance
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 text-white border-slate-800 sm:max-w-[425px]">
              <form onSubmit={handleLogAttendance}>
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-indigo-400">Manual Entry</DialogTitle>
                </DialogHeader>
                <div className="grid gap-6 py-6">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Select Employee</Label>
                    <select 
                      className="flex h-11 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                      value={newLog.employeeId}
                      required
                      onChange={(e) => setNewLog({...newLog, employeeId: e.target.value})}
                    >
                      <option value="" className="bg-slate-900 text-white">Choose an employee...</option>
                      {employees.length > 0 ? (
                        employees.map(emp => (
                          <option key={emp.id} value={emp.id} className="bg-slate-900 text-white">
                            {emp.name}
                          </option>
                        ))
                      ) : (
                        <option disabled className="text-slate-500">Loading employees...</option>
                      )}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-slate-300">Clock In Time</Label>
                      <Input 
                        type="time" 
                        className="bg-slate-800 border-slate-700 h-11 text-white"
                        value={newLog.clockIn}
                        onChange={(e) => setNewLog({...newLog, clockIn: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Status</Label>
                      <select 
                        className="flex h-11 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                        value={newLog.status}
                        onChange={(e) => setNewLog({...newLog, status: e.target.value})}
                      >
                        <option value="Present" className="bg-slate-900 text-white">Present</option>
                        <option value="Late" className="bg-slate-900 text-white">Late</option>
                        <option value="Absent" className="bg-slate-900 text-white">Absent</option>
                      </select>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 w-full h-11 font-semibold">
                    Save Record
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Present" value={todayPresent} color="bg-emerald-500" icon={<UserCheck />} />
          <StatCard title="Late" value={todayLate} color="bg-amber-500" icon={<Clock />} />
          <StatCard title="Absent" value={todayAbsent} color="bg-red-500" icon={<Users />} />
        </div>

        {/* Table View */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr className="border-b dark:border-slate-800">
                  <th className="px-6 py-4 text-left font-bold">Employee</th>
                  <th className="px-6 py-4 text-left font-bold">Clock In</th>
                  <th className="px-6 py-4 text-left font-bold">Status</th>
                  <th className="px-6 py-4 text-right font-bold">Hours</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-slate-800">
                {isLoading ? (
                  <tr><td colSpan={4} className="text-center py-20"><Loader2 className="animate-spin h-8 w-8 mx-auto text-indigo-600" /></td></tr>
                ) : attendance.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-20 text-slate-500">No records found for today.</td></tr>
                ) : (
                  attendance.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 font-semibold">{record.employeeName || "Unknown"}</td>
                      <td className="px-6 py-4 text-emerald-600 font-medium"><LogIn className="inline h-4 w-4 mr-1" /> {record.clockIn}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          record.status === "Present" ? "bg-emerald-100 text-emerald-700" :
                          record.status === "Late" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                        }`}>{record.status}</span>
                      </td>
                      <td className="px-6 py-4 text-right font-mono">{record.workHours || "0"}h</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

function StatCard({ title, value, color, icon }: any) {
  return (
    <div className={`${color} rounded-2xl p-6 text-white shadow-lg`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/80 text-sm font-medium">{title} Today</p>
          <p className="text-4xl font-bold mt-2">{value}</p>
        </div>
        <div className="bg-white/20 p-4 rounded-xl">{icon}</div>
      </div>
    </div>
  )
}