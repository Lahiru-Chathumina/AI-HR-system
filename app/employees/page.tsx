"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { useAuth } from "@/context/auth-context"
import { employeeService, type Employee, type CreateEmployeeData } from "@/services/employee"
import { 
  Plus, Search, MoreVertical, Loader2, 
  Briefcase, DollarSign, Trash2, UserPlus 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

export default function EmployeesPage() {
  const { company } = useAuth()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [open, setOpen] = useState(false)

  // Form State
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    position: "",
    salary: ""
  })

  const loadEmployees = async () => {
    if (!company?.id) return
    try {
      const data = await employeeService.getEmployeesByCompany(company.id)
      setEmployees(data)
    } catch (error) {
      console.error("Failed to load:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadEmployees()
  }, [company?.id])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!company?.id) return
    
    setIsSubmitting(true)
    try {
      await employeeService.createEmployee({
        name: newEmployee.name,
        position: newEmployee.position,
        salary: Number(newEmployee.salary),
        companyId: company.id
      })
      setOpen(false) // Dialog එක වහන්න
      setNewEmployee({ name: "", position: "", salary: "" }) // Form එක reset කරන්න
      loadEmployees() // List එක refresh කරන්න
    } catch (error) {
      alert("Failed to create employee. Please check backend.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const filtered = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.position.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-bold">Employee Management</h1>
          
          {/* Create Employee Dialog */}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                <Plus className="mr-2 h-4 w-4" /> Add Employee
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleCreate}>
                <DialogHeader>
                  <DialogTitle>Add New Employee</DialogTitle>
                  <DialogDescription>Fill in the details to register a new member.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input 
                      required 
                      value={newEmployee.name}
                      onChange={e => setNewEmployee({...newEmployee, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Position</Label>
                    <Input 
                      required 
                      value={newEmployee.position}
                      onChange={e => setNewEmployee({...newEmployee, position: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Salary</Label>
                    <Input 
                      type="number" 
                      required 
                      value={newEmployee.salary}
                      onChange={e => setNewEmployee({...newEmployee, salary: e.target.value})}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={isSubmitting} className="w-full">
                    {isSubmitting ? "Saving..." : "Save Employee"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search by name or position..." 
            className="pl-10"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        {/* List View */}
        {isLoading ? (
          <div className="flex justify-center py-10"><Loader2 className="animate-spin" /></div>
        ) : (
          <div className="border rounded-lg bg-white dark:bg-slate-900">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Salary</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(emp => (
                  <TableRow key={emp.id}>
                    <TableCell className="font-medium">{emp.name}</TableCell>
                    <TableCell>{emp.position}</TableCell>
                    <TableCell className="text-green-600 font-bold">${emp.salary.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
