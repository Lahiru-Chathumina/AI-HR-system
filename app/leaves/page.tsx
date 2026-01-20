"use client"

import { useEffect, useState, KeyboardEvent } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { leaveService, type Leave } from "@/services/leave"
import { employeeService, type Employee } from "@/services/employee" // Employee service එක අවශ්‍යයි
import { Plus, Search, Loader2, CheckCircle, XCircle, Clock, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

export default function LeavesPage() {
  const [leaves, setLeaves] = useState<Leave[]>([])
  const [employees, setEmployees] = useState<Employee[]>([]) // සේවකයින් සඳහා state
  const [filteredLeaves, setFilteredLeaves] = useState<Leave[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isOpen, setIsOpen] = useState(false)

  const [formData, setFormData] = useState({
    employeeId: "", // ID එක මෙතන තබා ගනී
    leaveType: "Annual",
    startDate: "",
    endDate: "",
    reason: ""
  })

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const [leavesData, empData] = await Promise.all([
          leaveService.getAllLeaves(),
          employeeService.getAllEmployees() // සේවකයින් ගෙන්වා ගැනීම
        ])
        setLeaves(leavesData)
        setFilteredLeaves(leavesData)
        setEmployees(empData)
      } catch (error) {
        console.error("Failed to load data", error)
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
      setFilteredLeaves(prev => [newLeave, ...prev])
      setIsOpen(false)
      setFormData({ employeeId: "", leaveType: "Annual", startDate: "", endDate: "", reason: "" })
    } catch (error) {
      alert("Failed to submit leave request. Ensure all fields are correct.")
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Leave Management</h1>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700"><Plus className="mr-2 h-4 w-4" /> Request Leave</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
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
                  {/* ... ඉතිරි Form fields (Type, Start, End, Reason) මෙහි තිබිය යුතුය ... */}
                </div>
                <DialogFooter>
                  <Button type="submit" className="bg-indigo-600 text-white w-full">Submit Request</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </DashboardLayout>
  )
}