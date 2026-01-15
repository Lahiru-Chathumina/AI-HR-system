"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { useAuth } from "@/context/auth-context"
import { employeeService, type Employee } from "@/services/employee"
import { 
  Plus, Search, Loader2, DollarSign, Briefcase, Trash2 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"

export default function EmployeesPage() {
  const { company } = useAuth()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [isOpen, setIsOpen] = useState(false)

  const [formData, setFormData] = useState({ name: "", position: "", salary: "" })

  const loadEmployees = async () => {
    if (!company?.id) return
    setIsLoading(true)
    try {
      const data = await employeeService.getEmployeesByCompany(company.id)
      setEmployees(data)
    } catch (error) {
      console.error("Load failed", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { loadEmployees() }, [company?.id])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!company?.id) return
    setIsSubmitting(true)
    try {
      await employeeService.createEmployee({
        name: formData.name,
        position: formData.position,
        salary: Number(formData.salary),
        companyId: company.id
      })
      setIsOpen(false)
      setFormData({ name: "", position: "", salary: "" })
      loadEmployees()
    } catch (error) {
      alert("Error adding employee. Check if backend is running.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const filtered = employees.filter(emp => 
    emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.position?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl sm:text-3xl font-bold">Employees</h1>
          
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                <Plus className="mr-2 h-4 w-4" /> Add Member
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <form onSubmit={handleCreate}>
                <DialogHeader>
                  <DialogTitle>Add New Employee</DialogTitle>
                  <DialogDescription>
                    Provide employee's full name, position and monthly salary to register.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Position</Label>
                    <Input required value={formData.position} onChange={(e) => setFormData({...formData, position: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Salary ($)</Label>
                    <Input type="number" required value={formData.salary} onChange={(e) => setFormData({...formData, salary: e.target.value})} />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={isSubmitting} className="w-full">
                    {isSubmitting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : "Save Employee"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input placeholder="Search..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>

        <div className="rounded-xl border bg-white dark:bg-slate-900 shadow-sm overflow-hidden overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-slate-800">
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Position</TableHead>
                <TableHead className="text-right">Salary</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={3} className="text-center py-10"><Loader2 className="animate-spin inline-block" /></TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={3} className="text-center py-10">No employees found.</TableCell></TableRow>
              ) : (
                filtered.map((emp) => (
                  <TableRow key={emp.id}>
                    <TableCell className="font-medium">{emp.name}</TableCell>
                    <TableCell>{emp.position}</TableCell>
                    <TableCell className="text-right font-bold text-emerald-600">${emp.salary.toLocaleString()}</TableCell>
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
