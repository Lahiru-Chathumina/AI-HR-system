"use client"

import { useEffect, useState, KeyboardEvent } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { useAuth } from "@/context/auth-context"
import { attendanceService, type Attendance } from "@/services/attendance"
import { 
  Search, Loader2, Clock, CheckCircle, 
  XCircle, LogIn, LogOut, UserCheck 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export default function AttendancePage() {
  const { company } = useAuth()
  const [attendance, setAttendance] = useState<Attendance[]>([])
  const [filteredData, setFilteredData] = useState<Attendance[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  
  // New States for Dialog
  const [isLogOpen, setIsLogOpen] = useState(false)
  const [newLog, setNewLog] = useState({
    employeeName: "",
    status: "Present",
    clockIn: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  })

  const loadAttendance = async () => {
    if (!company?.id) return
    setIsLoading(true)
    try {
      const data = await attendanceService.getAttendanceByCompany(company.id)
      setAttendance(data)
      setFilteredData(data)
    } catch (error) {
      console.error("Failed to load attendance", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { loadAttendance() }, [company?.id])

  const handleSearch = () => {
    const results = attendance.filter(item => 
      item.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.status?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredData(results)
  }

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch()
  }

  // Attendance Log Function
  const handleLogAttendance = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!company?.id) return

    try {
      const entry = await attendanceService.logAttendance({
        ...newLog,
        companyId: company.id,
        date: new Date().toISOString().split('T')[0] // Today's date
      })
      
      setAttendance(prev => [entry, ...prev])
      setFilteredData(prev => [entry, ...prev])
      setIsLogOpen(false)
      setNewLog({ employeeName: "", status: "Present", clockIn: "" })
    } catch (error) {
      alert("Failed to log attendance.")
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Attendance</h1>
            <p className="text-sm text-slate-500">Track and manage employee daily presence.</p>
          </div>

          {/* LOG ATTENDANCE DIALOG */}
          <Dialog open={isLogOpen} onOpenChange={setIsLogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto">
                <UserCheck className="mr-2 h-4 w-4" /> Log Today's Attendance
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleLogAttendance}>
                <DialogHeader>
                  <DialogTitle>Manual Attendance Entry</DialogTitle>
                  <DialogDescription>Record clock-in time for an employee.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label>Employee Name</Label>
                    <Input 
                      required 
                      value={newLog.employeeName}
                      onChange={(e) => setNewLog({...newLog, employeeName: e.target.value})}
                      placeholder="e.g. John Doe" 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Clock In Time</Label>
                      <Input 
                        type="time" 
                        value={newLog.clockIn}
                        onChange={(e) => setNewLog({...newLog, clockIn: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <select 
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
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
                  <Button type="button" variant="outline" onClick={() => setIsLogOpen(false)}>Cancel</Button>
                  <Button type="submit" className="bg-indigo-600">Save Record</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search Bar */}
        <div className="flex gap-2 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search by employee name..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyPress}
            />
          </div>
          <Button variant="secondary" onClick={handleSearch}>Search</Button>
        </div>

        {/* Table View */}
        <div className="rounded-xl border bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-slate-800">
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Clock In</TableHead>
                <TableHead>Clock Out</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Hours</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">
                    <Loader2 className="animate-spin inline-block mr-2" /> Loading records...
                  </TableCell>
                </TableRow>
              ) : filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-slate-500">
                    No attendance records found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((record) => (
                  <TableRow key={record.id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="font-medium">{record.employeeName}</TableCell>
                    <TableCell className="text-slate-500">{record.date}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-emerald-600">
                        <LogIn className="h-3.5 w-3.5" /> {record.clockIn}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-rose-500">
                        <LogOut className="h-3.5 w-3.5" /> {record.clockOut || "--:--"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={cn(
                        "px-2.5 py-0.5 rounded-full text-xs font-bold",
                        record.status === "Present" && "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30",
                        record.status === "Late" && "bg-amber-100 text-amber-700 dark:bg-amber-900/30",
                        record.status === "Absent" && "bg-rose-100 text-rose-700 dark:bg-rose-900/30",
                      )}>
                        {record.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-mono">{record.workHours ? `${record.workHours}h` : "0h"}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  )
}