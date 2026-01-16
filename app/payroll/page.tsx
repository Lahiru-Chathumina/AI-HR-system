"use client"

import { useEffect, useState, KeyboardEvent } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { payrollService, type Payroll } from "@/services/payroll"
import { 
  Plus, Search, Loader2, DollarSign, 
  Calendar, CreditCard, CheckCircle2, AlertCircle, Trash2 
} from "lucide-react"
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

export default function PayrollPage() {
  const [payrolls, setPayrolls] = useState<Payroll[]>([])
  const [filteredPayrolls, setFilteredPayrolls] = useState<Payroll[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isOpen, setIsOpen] = useState(false)

  // අලුත් Payroll එකක් සඳහා Form State
  const [formData, setFormData] = useState({
    employeeId: "",
    month: new Date().toLocaleString('default', { month: 'long' }),
    year: new Date().getFullYear().toString(),
    basicSalary: "",
    deductions: "0"
  })

  const loadPayrolls = async () => {
    setIsLoading(true)
    try {
      const data = await payrollService.getAllPayrolls()
      setPayrolls(data)
      setFilteredPayrolls(data)
    } catch (error) {
      console.error("Failed to load payrolls", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { loadPayrolls() }, [])

  const handleSearch = () => {
    const results = payrolls.filter(p => 
      p.month?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.employeeId.toString().includes(searchTerm)
    )
    setFilteredPayrolls(results)
  }

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch()
  }

  // Payroll එක Process කරන Function එක
  const handleProcessPayroll = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const basic = parseFloat(formData.basicSalary)
      const ded = parseFloat(formData.deductions)
      
      const payload: any = {
        employeeId: parseInt(formData.employeeId),
        month: formData.month,
        year: parseInt(formData.year),
        basicSalary: basic,
        deductions: ded,
        netSalary: basic - ded,
        status: "Pending" // ආරම්භයේදී status එක Pending ලෙස
      }

      const newPayroll = await payrollService.createPayroll(payload)
      setPayrolls(prev => [newPayroll, ...prev])
      setFilteredPayrolls(prev => [newPayroll, ...prev])
      setIsOpen(false)
      
      // Form එක Reset කිරීම
      setFormData({
        employeeId: "",
        month: new Date().toLocaleString('default', { month: 'long' }),
        year: new Date().getFullYear().toString(),
        basicSalary: "",
        deductions: "0"
      })
    } catch (error) {
      alert("Failed to process payroll. Please check employee ID.")
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Payroll Management</h1>
            <p className="text-sm text-slate-500">Generate and manage employee monthly salaries.</p>
          </div>

          {/* DIALOG START */}
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-md">
                <Plus className="mr-2 h-4 w-4" /> Process Payroll
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <form onSubmit={handleProcessPayroll}>
                <DialogHeader>
                  <DialogTitle>Process New Payroll</DialogTitle>
                  <DialogDescription>
                    Enter salary details for the employee.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Employee ID</Label>
                      <Input 
                        type="number" 
                        required 
                        placeholder="e.g. 101"
                        value={formData.employeeId}
                        onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Month</Label>
                      <select 
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={formData.month}
                        onChange={(e) => setFormData({...formData, month: e.target.value})}
                      >
                        {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map(m => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Basic Salary ($)</Label>
                    <Input 
                      type="number" 
                      required 
                      value={formData.basicSalary}
                      onChange={(e) => setFormData({...formData, basicSalary: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Deductions ($)</Label>
                    <Input 
                      type="number" 
                      value={formData.deductions}
                      onChange={(e) => setFormData({...formData, deductions: e.target.value})}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                  <Button type="submit" className="bg-indigo-600">Generate Payroll</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          {/* DIALOG END */}
        </div>

        {/* Search Bar */}
        <div className="flex gap-2 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search by month or ID and press Enter..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyPress}
            />
          </div>
          <Button variant="secondary" onClick={handleSearch}>Search</Button>
        </div>

        {/* Payroll Table */}
        <div className="rounded-xl border bg-white dark:bg-slate-900 shadow-sm overflow-hidden overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-slate-800">
              <TableRow>
                <TableHead>Emp ID</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Basic ($)</TableHead>
                <TableHead>Deductions ($)</TableHead>
                <TableHead className="font-bold text-indigo-600">Net Salary ($)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    <Loader2 className="animate-spin inline-block mr-2" /> Processing Payroll Records...
                  </TableCell>
                </TableRow>
              ) : filteredPayrolls.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-slate-500">
                    No payroll records found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredPayrolls.map((payroll) => (
                  <TableRow key={payroll.id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="font-medium">#{payroll.employeeId}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        {payroll.month} {payroll.year}
                      </div>
                    </TableCell>
                    <TableCell>{payroll.basicSalary?.toLocaleString()}</TableCell>
                    <TableCell className="text-rose-500">-{payroll.deductions?.toLocaleString()}</TableCell>
                    <TableCell className="font-bold text-indigo-600">
                      ${payroll.netSalary?.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <span className={cn(
                        "px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center w-fit gap-1",
                        payroll.status === "Paid" 
                          ? "bg-emerald-100 text-emerald-700" 
                          : "bg-amber-100 text-amber-700"
                      )}>
                        {payroll.status === "Paid" ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                        {payroll.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="text-slate-400 hover:text-rose-500">
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
