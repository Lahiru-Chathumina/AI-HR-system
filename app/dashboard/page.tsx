"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { useAuth } from "@/context/auth-context"
import { employeeService, type Employee } from "@/services/employee"
import { leaveService, type Leave } from "@/services/leave"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Building2, Users, CalendarDays, DollarSign, 
  Loader2, Sparkles, TrendingUp, AlertCircle 
} from "lucide-react"

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
  const avgSalary = employees.length > 0 ? totalSalary / employees.length : 0

  const stats = [
    { title: "Total Employees", value: isLoading ? "..." : employees.length.toString(), description: "Active workforce", icon: Users, color: "text-blue-600" },
    { title: "Pending Leaves", value: isLoading ? "..." : pendingLeaves.toString(), description: "Requires action", icon: CalendarDays, color: "text-orange-600" },
    { title: "Departments", value: isLoading ? "..." : departments.length.toString(), description: "Org units", icon: Building2, color: "text-purple-600" },
    { title: "Monthly Payroll", value: isLoading ? "..." : `$${totalSalary.toLocaleString()}`, description: "Monthly expense", icon: DollarSign, color: "text-green-600" },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">HR Intelligence Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {user?.name}. Managing <span className="font-semibold text-primary">{user?.companyName}</span>
            </p>
          </div>
          <div className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
            <Sparkles className="h-4 w-4" /> AI System Active
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-7">
          {/* AI Insights Panel */}
          <Card className="md:col-span-4 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <CardTitle>AI Smart Insights</CardTitle>
              </div>
              <CardDescription>Automated HR analysis and recommendations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="flex justify-center py-4"><Loader2 className="h-6 w-6 animate-spin" /></div>
              ) : (
                <div className="grid gap-4">
                  <div className="flex gap-3 p-3 rounded-lg bg-background/50 border border-primary/10">
                    <TrendingUp className="h-5 w-5 text-green-500 shrink-0" />
                    <p className="text-sm">
                      <span className="font-semibold">Payroll Analysis:</span> Average salary is 
                      <span className="text-primary font-bold"> ${avgSalary.toFixed(2)}</span>. 
                      This aligns with your current budget constraints.
                    </p>
                  </div>
                  <div className="flex gap-3 p-3 rounded-lg bg-background/50 border border-primary/10">
                    <AlertCircle className={`h-5 w-5 ${pendingLeaves > 3 ? 'text-red-500' : 'text-yellow-500'} shrink-0`} />
                    <p className="text-sm">
                      <span className="font-semibold">Workflow Risk:</span> {pendingLeaves > 0 
                        ? `AI detects ${pendingLeaves} pending leaves. Approval delay might impact next week's productivity.`
                        : "No staffing risks detected. Leave management is optimal."}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Employees Sidebar */}
          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle>Recent Hires</CardTitle>
              <CardDescription>Latest team additions</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-4"><Loader2 className="h-6 w-6 animate-spin" /></div>
              ) : (
                <div className="space-y-4">
                  {employees.slice(0, 4).map((emp) => (
                    <div key={emp.id} className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded-md transition-colors">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                        {emp.firstName?.[0]}{emp.lastName?.[0]}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-medium truncate">{emp.firstName} {emp.lastName}</p>
                        <p className="text-xs text-muted-foreground truncate">{emp.position}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}