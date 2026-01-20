"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { attendanceService, type Attendance } from "@/services/attendance"
import { employeeService, type Employee } from "@/services/employee"
import { UserCheck, LogIn, Loader2, Clock, Calendar, Users } from "lucide-react"
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

  // දත්ත ගෙන්වා ගැනීම
  useEffect(() => {
    const loadData = async () => {
      try {
        const [attData, empData] = await Promise.all([
          attendanceService.getAllAttendance(),
          employeeService.getAllEmployees()
        ]);
        setAttendance(attData);
        setEmployees(empData);
      } catch (e) {
        console.error("Failed to load data", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [])

  const handleLogAttendance = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newLog.employeeId) {
      alert("Please select an employee!");
      return;
    }

    try {
      const entry = await attendanceService.markAttendance({
        employeeId: Number(newLog.employeeId),
        status: newLog.status,
        clockIn: newLog.clockIn
      })
      
      setAttendance(prev => [entry, ...prev])
      setIsLogOpen(false)
      setNewLog({ employeeId: "", status: "Present", clockIn: "08:30" })
    } catch (error) {
      alert("Error logging attendance. Please ensure an employee is selected.")
    }
  }

  // Stats ගණනය කිරීම
  const todayPresent = attendance.filter(a => a.status === "Present").length
  const todayLate = attendance.filter(a => a.status === "Late").length
  const todayAbsent = attendance.filter(a => a.status === "Absent").length

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Attendance Tracking
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">Monitor and manage employee daily presence</p>
          </div>
          
          <Dialog open={isLogOpen} onOpenChange={setIsLogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg transition-all hover:scale-105">
                <UserCheck className="mr-2 h-4 w-4" /> Log Attendance
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 text-white border-slate-800">
              <form onSubmit={handleLogAttendance}>
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                    Manual Entry
                  </DialogTitle>
                </DialogHeader>
                <div className="grid gap-6 py-6">
                  <div className="space-y-3">
                    <Label className="text-slate-300 font-semibold">Select Employee</Label>
                    <select 
                      className="flex h-12 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                      value={newLog.employeeId}
                      required
                      onChange={(e) => setNewLog({...newLog, employeeId: e.target.value})}
                    >
                      <option value="" className="text-slate-400">Choose an employee...</option>
                      {employees.map(emp => (
                        <option key={emp.id} value={emp.id} className="text-black">
                          {emp.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <Label className="text-slate-300 font-semibold flex items-center gap-2">
                        <Clock className="h-4 w-4" /> Clock In
                      </Label>
                      <Input 
                        type="time" 
                        className="bg-slate-800 border-slate-700 h-12 text-white"
                        value={newLog.clockIn}
                        onChange={(e) => setNewLog({...newLog, clockIn: e.target.value})}
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-slate-300 font-semibold">Status</Label>
                      <select 
                        className="flex h-12 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={newLog.status}
                        onChange={(e) => setNewLog({...newLog, status: e.target.value})}
                      >
                        <option value="Present" className="text-black">Present</option>
                        <option value="Late" className="text-black">Late</option>
                        <option value="Absent" className="text-black">Absent</option>
                      </select>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 w-full h-12 font-semibold transition-all">
                    Save Record
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm">Present Today</p>
                <p className="text-4xl font-bold mt-2">{todayPresent}</p>
              </div>
              <UserCheck className="h-10 w-10 opacity-50" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm">Late Today</p>
                <p className="text-4xl font-bold mt-2">{todayLate}</p>
              </div>
              <Clock className="h-10 w-10 opacity-50" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm">Absent Today</p>
                <p className="text-4xl font-bold mt-2">{todayAbsent}</p>
              </div>
              <Users className="h-10 w-10 opacity-50" />
            </div>
          </div>
        </div>

        {/* Table View */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Calendar className="h-5 w-5" /> Attendance Records
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th className="px-6 py-4 text-left font-bold">Employee</th>
                  <th className="px-6 py-4 text-left font-bold">Clock In</th>
                  <th className="px-6 py-4 text-left font-bold">Status</th>
                  <th className="px-6 py-4 text-right font-bold">Hours</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={4} className="text-center py-20"><Loader2 className="animate-spin h-8 w-8 mx-auto text-indigo-600" /></td></tr>
                ) : attendance.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-20 text-slate-500">No records found today.</td></tr>
                ) : attendance.map((record) => (
                  <tr key={record.id} className="border-b dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-6 py-4 font-semibold">{record.employeeName}</td>
                    <td className="px-6 py-4 text-emerald-600 font-medium"><LogIn className="inline h-4 w-4 mr-1" /> {record.clockIn}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        record.status === "Present" ? "bg-emerald-100 text-emerald-700" :
                        record.status === "Late" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                      }`}>{record.status}</span>
                    </td>
                    <td className="px-6 py-4 text-right font-mono">{record.workHours || "0"}h</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}