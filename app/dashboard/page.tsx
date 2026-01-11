"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { useAuth } from "@/context/auth-context"
import { employeeService, type Employee } from "@/services/employee"
import { leaveService, type Leave } from "@/services/leave"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Users, CalendarDays, DollarSign, Loader2 } from "lucide-react"

export default function DashboardPage() {
  const { user, company } = useAuth()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [leaves, setLeaves] = useState<Leave[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      if (!company?.id) return

      try {
        const [empData, leaveData] = await Promise.all([
          employeeService.getEmployeesByCompany(company.id),
          leaveService.getAllLeaves(),
        ])
        setEmployees(empData)
        setLeaves(leaveData)
      } catch (err) {
        console.error("Failed to load dashboard data:", err)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [company?.id])

  const pendingLeaves = leaves.filter((l) => l.status?.toLowerCase() === "pending").length
  const departments = [...new Set(employees.map((e) => e.department).filter(Boolean))]
  const totalSalary = employees.reduce((sum, e) => sum + (e.salary || 0), 0)

  const stats = [
    {
      title: "Total Employees",
      value: isLoading ? "..." : employees.length.toString(),
      description: "Active employees",
      icon: Users,
    },
    {
      title: "Pending Leaves",
      value: isLoading ? "..." : pendingLeaves.toString(),
      description: "Awaiting approval",
      icon: CalendarDays,
    },
    {
      title: "Departments",
      value: isLoading ? "..." : departments.length.toString(),
      description: "Active departments",
      icon: Building2,
    },
    {
      title: "Monthly Payroll",
      value: isLoading ? "..." : `$${totalSalary.toLocaleString()}`,
      description: "Total salary expense",
      icon: DollarSign,
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name}. Here&apos;s what&apos;s happening at{" "}
            <span className="font-medium text-foreground">{user?.companyName}</span>.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Employees */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Employees</CardTitle>
            <CardDescription>Latest employees added to your company</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : employees.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No employees yet. Add your first employee to get started.
              </p>
            ) : (
              <div className="space-y-4">
                {employees.slice(0, 5).map((employee) => (
                  <div key={employee.id} className="flex items-center gap-4 rounded-lg border border-border p-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                      <span className="text-sm font-medium">
                        {employee.firstName?.charAt(0)}
                        {employee.lastName?.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {employee.firstName} {employee.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">{employee.position || "No position"}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{employee.department || "No dept"}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
