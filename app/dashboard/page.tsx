"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { useAuth } from "@/context/auth-context"
import { employeeService, type Employee } from "@/services/employee"
import { leaveService, type Leave } from "@/services/leave"
// 1. aiService importservices folder 
import { aiService } from "@/services/ai" 
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Building2, Users, CalendarDays, DollarSign, 
  Loader2, Sparkles, TrendingUp, AlertCircle, Send, Brain
} from "lucide-react"

export default function DashboardPage() {
  const { user, company } = useAuth()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [leaves, setLeaves] = useState<Leave[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  const [aiInsight, setAiInsight] = useState<string>("Analyzing workforce data...")
  const [chatInput, setChatInput] = useState("")
  const [chatResponse, setChatResponse] = useState<string>("")

  // 2. : empCount  leaveCount variable  define 
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
        
        // AI Insight 
        const empCount = empData.length
        const pendingCount = leaveData.filter(l => l.status?.toLowerCase() === "pending").length
        
        if (empCount > 0) {
          const insight = await aiService.ask(`Summarize HR status for ${empCount} employees and ${pendingCount} pending leaves in one sentence Sinhala.`);
          setAiInsight(insight);
        }
      } catch (err) {
        console.error("Dashboard error:", err)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [company?.id])

  const handleAskAi = async () => {
    if (!chatInput) return;
    setChatResponse("AI is thinking...");
    try {
      const res = await aiService.ask(chatInput);
      setChatResponse(res);
    } catch (error) {
      setChatResponse("sorry no data.");
    }
  }

  const pendingLeaves = leaves.filter((l) => l.status?.toLowerCase() === "pending").length
  const totalSalary = employees.reduce((sum, e) => sum + (e.salary || 0), 0)

  return (
    <DashboardLayout>
      <div className="relative space-y-6 pb-20">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">AI HR Command Center</h1>
            <p className="text-muted-foreground italic">
              <Sparkles className="inline h-4 w-4 text-primary mr-1" />
              {aiInsight}
            </p>
          </div>
          <div className="bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-bold animate-pulse">
            System Live: AI Monitoring Active
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            { title: "Staff Strength", value: employees.length, icon: Users, color: "text-blue-500" },
            { title: "Leave Requests", value: pendingLeaves, icon: CalendarDays, color: "text-orange-500" },
            { title: "Departments", value: new Set(employees.map(e => e.department)).size, icon: Building2, color: "text-purple-500" },
            { title: "Cost to Company", value: `$${totalSalary.toLocaleString()}`, icon: DollarSign, color: "text-green-500" },
          ].map((stat) => (
            <Card key={stat.title} className="border-none shadow-sm bg-card/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{isLoading ? <Loader2 className="animate-spin h-4 w-4" /> : stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-12">
          {/* AI Strategy Panel */}
          <Card className="md:col-span-8 border-primary/20 shadow-lg shadow-primary/5">
            <CardHeader className="border-b bg-muted/30">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                <CardTitle>AI Strategic Insights</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 flex gap-3">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <p className="text-sm">Budget Analysis: Payroll is within stable limits. AI suggests budget is safe for new hires.</p>
              </div>
              <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 flex gap-3">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                <p className="text-sm">Staffing Risk: {pendingLeaves > 2 ? `Critical: ${pendingLeaves} leaves pending. Dept productivity might drop.` : 'All systems normal.'}</p>
              </div>
            </CardContent>
          </Card>

          {/* Quick AI Search */}
          <Card className="md:col-span-4 overflow-hidden border-primary/20">
            <CardHeader className="bg-primary text-primary-foreground">
              <CardTitle className="text-sm">Ask HR AI Assistant</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="h-32 overflow-y-auto text-xs text-muted-foreground p-2 bg-muted rounded border border-border">
                {chatResponse || "Ask about policy, salary or attendance..."}
              </div>
              <div className="flex gap-2">
                <Input 
                  placeholder="Type here..." 
                  className="h-8 text-xs bg-background" 
                  value={chatInput} 
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAskAi()}
                />
                <Button size="sm" onClick={handleAskAi} className="h-8"><Send className="h-3 w-3" /></Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}