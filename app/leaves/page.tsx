"use client"

import { useEffect, useState, KeyboardEvent } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { leaveService, type Leave } from "@/services/leave"
import { 
  Plus, Search, Loader2, Calendar, 
  CheckCircle, XCircle, Clock, Trash2 
} from "lucide-react" // නිවැරදි කරන ලද import එක
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

export default function LeavesPage() {
  const [leaves, setLeaves] = useState<Leave[]>([])
  const [filteredLeaves, setFilteredLeaves] = useState<Leave[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isOpen, setIsOpen] = useState(false)

  // Form එක සඳහා state
  const [formData, setFormData] = useState({
    employeeName: "",
    leaveType: "Annual",
    startDate: "",
    endDate: "",
    reason: ""
  })

  const loadLeaves = async () => {
    setIsLoading(true)
    try {
      const data = await leaveService.getAllLeaves()
      setLeaves(data)
      setFilteredLeaves(data)
    } catch (error) {
      console.error("Failed to load leaves", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { loadLeaves() }, [])

  const handleSearch = () => {
    const results = leaves.filter(leave => 
      leave.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      leave.leaveType?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredLeaves(results)
  }

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // TypeScript error එක මඟහරවා ගැනීමට ඕනෑම (any) විදිහට දත්ත යවන්න 
      // එසේත් නැත්නම් service එකේ 'status' ඇතුළත් කර ඇත්නම් එය පාවිච්චි කරන්න
      const payload: any = {
        ...formData,
        status: "Pending"
      }

      const newLeave = await leaveService.createLeave(payload)
      
      setLeaves(prev => [newLeave, ...prev])
      setFilteredLeaves(prev => [newLeave, ...prev])
      setIsOpen(false)
      setFormData({ employeeName: "", leaveType: "Annual", startDate: "", endDate: "", reason: "" })
    } catch (error) {
      alert("Failed to submit leave request")
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Approved": return <CheckCircle className="h-4 w-4 text-emerald-500" />
      case "Rejected": return <XCircle className="h-4 w-4 text-rose-500" />
      default: return <Clock className="h-4 w-4 text-amber-500" />
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
            <DialogContent className="sm:max-w-[425px]">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Request Leave</DialogTitle>
                  <DialogDescription>
                    Fill in the details for your leave application.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="empName">Employee Name</Label>
                    <Input 
                      id="empName"
                      required 
                      value={formData.employeeName}
                      onChange={(e) => setFormData({...formData, employeeName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lType">Leave Type</Label>
                    <select 
                      id="lType"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
                      value={formData.leaveType}
                      onChange={(e) => setFormData({...formData, leaveType: e.target.value})}
                    >
                      <option value="Annual">Annual Leave</option>
                      <option value="Sick">Sick Leave</option>
                      <option value="Casual">Casual Leave</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sDate">Start Date</Label>
                      <Input 
                        id="sDate"
                        type="date" 
                        required
                        value={formData.startDate}
                        onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="eDate">End Date</Label>
                      <Input 
                        id="eDate"
                        type="date" 
                        required
                        value={formData.endDate}
                        onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-indigo-600 text-white">
                    Submit Request
                  </Button>
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
              placeholder="Search by name and press Enter..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyPress}
            />
          </div>
          <Button variant="secondary" onClick={handleSearch}>Search</Button>
        </div>

        {/* Leaves Table */}
        <div className="rounded-xl border bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-slate-800">
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10">
                    <Loader2 className="animate-spin inline-block mr-2" /> Loading Leaves...
                  </TableCell>
                </TableRow>
              ) : filteredLeaves.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-slate-500">
                    No leave requests found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredLeaves.map((leave) => (
                  <TableRow key={leave.id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="font-medium">{leave.employeeName}</TableCell>
                    <TableCell>{leave.leaveType}</TableCell>
                    <TableCell className="text-sm">
                      <div className="flex flex-col">
                        <span>{leave.startDate}</span>
                        <span className="text-slate-400 text-xs">to {leave.endDate}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {getStatusIcon(leave.status)}
                        <span className={cn(
                          "text-xs font-semibold",
                          leave.status === "Approved" && "text-emerald-600",
                          leave.status === "Rejected" && "text-rose-600",
                          leave.status === "Pending" && "text-amber-600"
                        )}>
                          {leave.status}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="text-rose-500 hover:text-rose-700 hover:bg-rose-50">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
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
