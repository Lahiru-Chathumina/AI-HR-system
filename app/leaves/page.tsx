"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { leaveService, type Leave } from "@/services/leave"
import { employeeService, type Employee } from "@/services/employee"
import { Plus, Loader2, CheckCircle, XCircle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
        employeeId: Number(formData.employeeId), // ID එක අනිවාර්යයෙන්ම number එකක් විය යුතුයි
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Leave Management</h1>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                <Plus className="mr-2 h-4 w-4" /> Request Leave
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Request Leave</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label>Select Employee</Label>
                    <select 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
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
                  {/* අනෙකුත් Inputs (Date, Type, Reason) මෙතැනට එක් කරන්න */}
                </div>
                <DialogFooter>
                  <Button type="submit" className="bg-indigo-600 text-white w-full">Submit Request</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        {/* Table කොටස කලින් තිබූ පරිදිම පවතී */}
      </div>
    </DashboardLayout>
  )
}