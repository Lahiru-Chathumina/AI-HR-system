"use client"

import { useEffect, useState, KeyboardEvent } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { useAuth } from "@/context/auth-context"
import { employeeService, type Employee } from "@/services/employee"
import { 
  Plus, Search, Loader2, Trash2, UserMinus, AlertCircle
} from "lucide-react" // Note: standard is lucide-react
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

export default function EmployeesPage() {
  const { company } = useAuth()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isOpen, setIsOpen] = useState(false)

  // Form states for new employee
  const [formData, setFormData] = useState({
    name: "",
    position: "",
    salary: ""
  })

  const loadEmployees = async () => {
    if (!company?.id) return
    setIsLoading(true)
    try {
      const data = await employeeService.getEmployeesByCompany(company.id)
      setEmployees(data)
      setFilteredEmployees(data)
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { loadEmployees() }, [company?.id])

  // Search Function
  const handleSearch = () => {
    const results = employees.filter(emp => 
      emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.position?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredEmployees(results)
  }

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  // Add Employee Function
  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!company?.id) return

    try {
      const newEmp = await employeeService.createEmployee({
        ...formData,
        companyId: company.id,
        salary: Number(formData.salary)
      })
      
      // Update local lists
      setEmployees([...employees, newEmp])
      setFilteredEmployees([...employees, newEmp])
      
      // Reset form and close dialog
      setFormData({ name: "", position: "", salary: "" })
      setIsOpen(false)
    } catch (error) {
      alert("Failed to add employee.")
    }
  }

  // Delete Function
  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this employee?")) {
      try {
        await employeeService.deleteEmployee(id)
        setEmployees(prev => prev.filter(e => e.id !== id))
        setFilteredEmployees(prev => prev.filter(e => e.id !== id))
      } catch (error) {
        alert("Failed to delete employee.")
      }
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Employee Directory</h1>
          
          {/* DIALOG BOX START */}
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600">
                <Plus className="mr-2 h-4 w-4" /> Add Member
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <form onSubmit={handleAddEmployee}>
                <DialogHeader>
                  <DialogTitle>Add New Employee</DialogTitle>
                  <DialogDescription>
                    Fill in the details to add a new team member.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input 
                      id="name" 
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="position">Position</Label>
                    <Input 
                      id="position" 
                      required
                      value={formData.position}
                      onChange={(e) => setFormData({...formData, position: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salary">Salary ($)</Label>
                    <Input 
                      id="salary" 
                      type="number" 
                      required
                      value={formData.salary}
                      onChange={(e) => setFormData({...formData, salary: e.target.value})}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-indigo-600">Save Employee</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          {/* DIALOG BOX END */}

        </div>

        {/* Search Bar */}
        <div className="flex gap-2 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search name or position..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyPress}
            />
          </div>
          <Button variant="secondary" onClick={handleSearch}>Search</Button>
        </div>

        <div className="rounded-xl border bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-slate-800">
              <TableRow>
                <TableHead>Employee Name</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Salary</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10">
                    <Loader2 className="animate-spin inline-block mr-2" /> Loading...
                  </TableCell>
                </TableRow>
              ) : filteredEmployees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10 text-slate-500">
                    No employees found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredEmployees.map((emp) => (
                  <TableRow key={emp.id} className="hover:bg-slate-50 transition-colors">
                    <TableCell className="font-medium">{emp.name}</TableCell>
                    <TableCell>{emp.position}</TableCell>
                    <TableCell className="text-emerald-600 font-bold">
                      ${emp.salary?.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                        onClick={() => handleDelete(emp.id)}
                      >
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
