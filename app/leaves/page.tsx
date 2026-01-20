"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { leaveService, type Leave } from "@/services/leave"
import { employeeService, type Employee } from "@/services/employee"
import { Plus, Loader2, CheckCircle, XCircle, Clock, Calendar, Briefcase, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"

export default function LeavesPage() {
  const [leaves, setLeaves] = useState<Leave[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)

  const [formData, setFormData] = useState({
    employeeId: "",
    leaveType: "Annual",
    startDate: "",
    endDate: "",
    reason: ""
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [leavesData, empData] = await Promise.all([
          leaveService.getAllLeaves(),
          employeeService.getAllEmployees()
        ])
        setLeaves(leavesData)
        setEmployees(empData)
      } catch (error) {
        console.error("Failed to fetch data", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const payload = {
        employeeId: Number(formData.employeeId),
        leaveType: formData.leaveType,
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: formData.reason
      }

      const newLeave = await leaveService.createLeave(payload as any)
      setLeaves(prev => [newLeave, ...prev])
      setIsOpen(false)
      setFormData({ employeeId: "", leaveType: "Annual", startDate: "", endDate: "", reason: "" })
    } catch (error) {
      alert("Failed to submit leave request. Please check if all fields are filled.")
    }
  }

  // Calculate stats
  const pendingLeaves = leaves.filter(l => l.status === "Pending").length
  const approvedLeaves = leaves.filter(l => l.status === "Approved").length
  const rejectedLeaves = leaves.filter(l => l.status === "Rejected").length

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Leave Management
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">Track and manage employee leave requests</p>
          </div>
          
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/50 transition-all duration-300 hover:scale-105">
                <Plus className="mr-2 h-4 w-4" /> Request Leave
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 text-white border-slate-800">
              <div onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                    Request Leave
                  </DialogTitle>
                </DialogHeader>
                <div className="grid gap-6 py-6">
                  <div className="space-y-3">
                    <Label className="text-slate-300 font-semibold">Select Employee</Label>
                    <select 
                      className="flex h-12 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      value={formData.employeeId}
                      required
                      onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
                    >
                      <option value="">Choose an employee...</option>
                      {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-slate-300 font-semibold flex items-center gap-2">
                      <Briefcase className="h-4 w-4" /> Leave Type
                    </Label>
                    <select 
                      className="flex h-12 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      value={formData.leaveType}
                      onChange={(e) => setFormData({...formData, leaveType: e.target.value})}
                    >
                      <option value="Annual">Annual Leave</option>
                      <option value="Sick">Sick Leave</option>
                      <option value="Personal">Personal Leave</option>
                      <option value="Unpaid">Unpaid Leave</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <Label className="text-slate-300 font-semibold flex items-center gap-2">
                        <Calendar className="h-4 w-4" /> Start Date
                      </Label>
                      <Input 
                        type="date" 
                        className="bg-slate-800 border-slate-700 h-12 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        value={formData.startDate}
                        required
                        onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-slate-300 font-semibold flex items-center gap-2">
                        <Calendar className="h-4 w-4" /> End Date
                      </Label>
                      <Input 
                        type="date" 
                        className="bg-slate-800 border-slate-700 h-12 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        value={formData.endDate}
                        required
                        onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-slate-300 font-semibold flex items-center gap-2">
                      <FileText className="h-4 w-4" /> Reason
                    </Label>
                    <textarea 
                      className="flex min-h-[100px] w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                      placeholder="Please provide a reason for your leave request..."
                      value={formData.reason}
                      required
                      onChange={(e) => setFormData({...formData, reason: e.target.value})}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleSubmit} className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 w-full h-12 font-semibold">
                    Submit Request
                  </Button>
                </DialogFooter>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-6 text-white shadow-xl shadow-amber-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm font-medium">Pending Requests</p>
                <p className="text-4xl font-bold mt-2">{pendingLeaves}</p>
              </div>
              <div className="bg-white/20 p-4 rounded-xl">
                <Clock className="h-8 w-8" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white shadow-xl shadow-emerald-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm font-medium">Approved</p>
                <p className="text-4xl font-bold mt-2">{approvedLeaves}</p>
              </div>
              <div className="bg-white/20 p-4 rounded-xl">
                <CheckCircle className="h-8 w-8" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 text-white shadow-xl shadow-red-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium">Rejected</p>
                <p className="text-4xl font-bold mt-2">{rejectedLeaves}</p>
              </div>
              <div className="bg-white/20 p-4 rounded-xl">
                <XCircle className="h-8 w-8" />
              </div>
            </div>
          </div>
        </div>

        {/* Table View */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Leave Requests
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th className="px-6 py-4 text-left font-bold text-slate-700 dark:text-slate-300">Employee</th>
                  <th className="px-6 py-4 text-left font-bold text-slate-700 dark:text-slate-300">Leave Type</th>
                  <th className="px-6 py-4 text-left font-bold text-slate-700 dark:text-slate-300">Duration</th>
                  <th className="px-6 py-4 text-left font-bold text-slate-700 dark:text-slate-300">Status</th>
                  <th className="px-6 py-4 text-left font-bold text-slate-700 dark:text-slate-300">Reason</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-16">
                      <Loader2 className="animate-spin inline-block mr-2 h-8 w-8 text-indigo-600" />
                      <p className="text-slate-600 dark:text-slate-400 mt-2">Loading leave requests...</p>
                    </td>
                  </tr>
                ) : leaves.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-16">
                      <Briefcase className="h-12 w-12 mx-auto text-slate-400 mb-3" />
                      <p className="text-slate-600 dark:text-slate-400">No leave requests yet</p>
                    </td>
                  </tr>
                ) : leaves.map((leave) => (
                  <tr key={leave.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                      {leave.employeeName}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                        {leave.leaveType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-medium">
                      <Calendar className="inline h-4 w-4 mr-1" />
                      {leave.startDate} - {leave.endDate}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-bold inline-flex items-center gap-1 ${
                        leave.status === "Approved" 
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" 
                          : leave.status === "Pending"
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      }`}>
                        <div className={`h-2 w-2 rounded-full ${
                          leave.status === "Approved" 
                            ? "bg-emerald-500" 
                            : leave.status === "Pending"
                            ? "bg-amber-500"
                            : "bg-red-500"
                        }`} />
                        {leave.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 max-w-xs truncate">
                      {leave.reason}
                    </td>
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