"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { attendanceService, type Attendance } from "@/services/attendance"
import { employeeService, type Employee } from "@/services/employee" //
import { UserCheck, LogIn, LogOut, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"

export default function AttendancePage() {
  const [attendance, setAttendance] = useState<Attendance[]>([])
  const [employees, setEmployees] = useState<Employee[]>([]) // සේවකයින් සඳහා state
  const [isLoading, setIsLoading] = useState(true)
  const [isLogOpen, setIsLogOpen] = useState(false)
  const [newLog, setNewLog] = useState({ employeeId: "", status: "Present", clockIn: "08:30" })

  // දත්ත ගෙන්වා ගැනීම
  useEffect(() => {
  const loadData = async () => {
    try {
      const [attData, empData] = await Promise.all([
        attendanceService.getAllAttendance(), // api.get වෙනුවට මෙය යොදන්න
        employeeService.getAllEmployees()     // මෙය යොදන්න
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
    try {
      const entry = await attendanceService.markAttendance({
        employeeId: Number(newLog.employeeId), // String ID එක Number එකක් ලෙස යැවීම
        status: newLog.status,
        clockIn: newLog.clockIn // Format: "08:30"
      })
      
      setAttendance(prev => [entry, ...prev])
      setIsLogOpen(false)
      setNewLog({ employeeId: "", status: "Present", clockIn: "08:30" })
    } catch (error) {
      alert("Error logging attendance. Please ensure an employee is selected.")
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Attendance Tracking</h1>
          
          <Dialog open={isLogOpen} onOpenChange={setIsLogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                <UserCheck className="mr-2 h-4 w-4" /> Log Attendance
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 text-white">
              <form onSubmit={handleLogAttendance}>
                <DialogHeader>
                  <DialogTitle>Manual Entry</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label>Select Employee</Label>
                    <select 
                      className="flex h-10 w-full rounded-md border border-input bg-slate-800 px-3 py-2 text-sm text-white"
                      value={newLog.employeeId}
                      required
                      onChange={(e) => setNewLog({...newLog, employeeId: e.target.value})}
                    >
                      <option value="">Choose an employee...</option>
                      {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Clock In Time</Label>
                      <Input 
                        type="time" 
                        className="bg-slate-800 border-slate-700"
                        value={newLog.clockIn}
                        onChange={(e) => setNewLog({...newLog, clockIn: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <select 
                        className="flex h-10 w-full rounded-md border border-input bg-slate-800 px-3 py-2 text-sm"
                        value={newLog.status}
                        onChange={(e) => setNewLog({...newLog, status: e.target.value})}
                      >
                        <option value="Present">Present</option>
                        <option value="Late">Late</option>
                        <option value="Absent">Absent</option>
                      </select>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" className="bg-indigo-600 w-full">Save Record</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Table View */}
        <div className="rounded-xl border bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-slate-800">
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Clock In</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Hours</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={4} className="text-center py-10"><Loader2 className="animate-spin inline-block mr-2" /> Loading...</TableCell></TableRow>
              ) : attendance.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{record.employeeName}</TableCell>
                  <TableCell className="text-emerald-600"><LogIn className="inline h-3.5 w-3.5 mr-1" /> {record.clockIn}</TableCell>
                  <TableCell>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                      {record.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-mono">{record.workHours || "0"}h</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  )
}