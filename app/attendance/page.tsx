"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { attendanceService, type Attendance } from "@/services/attendance"
import { employeeService, type Employee } from "@/services/employee"
import { UserCheck, Loader2, LogIn, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"

export default function AttendancePage() {
  const [attendance, setAttendance] = useState<Attendance[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLogOpen, setIsLogOpen] = useState(false)
  const [newLog, setNewLog] = useState({ employeeId: "", status: "Present", clockIn: "08:00" })

  useEffect(() => {
    const loadData = async () => {
      try {
        const [attData, empData] = await Promise.all([
          attendanceService.getAllAttendance(), // getAllAttendance backend එකේ තිබිය යුතුයි
          employeeService.getAllEmployees()
        ])
        setAttendance(attData)
        setEmployees(empData)
      } catch (e) { console.error(e) }
      finally { setIsLoading(false) }
    }
    loadData()
  }, [])

  const handleLogAttendance = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const entry = await attendanceService.markAttendance({
        employeeId: Number(newLog.employeeId),
        status: newLog.status,
        clockIn: newLog.clockIn
      })
      setAttendance(prev => [entry, ...prev])
      setIsLogOpen(false)
      setNewLog({ employeeId: "", status: "Present", clockIn: "08:00" })
    } catch (error) { alert("Error logging attendance.") }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Attendance</h1>
          <Dialog open={isLogOpen} onOpenChange={setIsLogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600"><UserCheck className="mr-2 h-4 w-4" /> Log Attendance</Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleLogAttendance}>
                <DialogHeader><DialogTitle>Manual Attendance Entry</DialogTitle></DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label>Select Employee</Label>
                    <select 
                      className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm"
                      value={newLog.employeeId}
                      required
                      onChange={(e) => setNewLog({...newLog, employeeId: e.target.value})}
                    >
                      <option value="">Select Employee...</option>
                      {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.name}</option>
                      ))}
                    </select>
                  </div>
                  {/* Clock In සහ Status fields මෙහි තිබිය යුතුය */}
                </div>
                <DialogFooter><Button type="submit">Save Record</Button></DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        {/* Table කොටස කලින් තිබූ පරිදිම පවතී */}
      </div>
    </DashboardLayout>
  )
}