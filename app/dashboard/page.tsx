"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { useAuth } from "@/context/auth-context"
import { employeeService, type Employee } from "@/services/employee"
import { leaveService, type Leave } from "@/services/leave"
import { aiService } from "@/services/ai" 
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Building2, Users, CalendarDays, DollarSign, 
  Loader2, Sparkles, TrendingUp, AlertCircle, Send, Brain
} from "lucide-react"

export default function DashboardPage() {
  const { company } = useAuth()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [leaves, setLeaves] = useState<Leave[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [aiInsight, setAiInsight] = useState<string>("Analyzing workforce data...")
  const [chatInput, setChatInput] = useState("")
  const [chatResponse, setChatResponse] = useState<string>("")

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
        
        if (empData.length > 0) {
          const insight = await aiService.ask(`Summarize HR status for ${empData.length} employees in one sentence Sinhala.`);
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
      setChatResponse("Sorry, no data.");
    }
  }

  const pendingLeaves = leaves.filter((l) => l.status?.toLowerCase() === "pending").length
  const totalSalary = employees.reduce((sum, e) => sum + (e.salary || 0), 0)

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950">
        <div className="container mx-auto px-4 py-6 space-y-8">
          
          {/* Header */}
          <div className="flex flex-col lg:flex-row justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-3xl lg:text-5xl font-black bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent">
                AI HR Command Center
              </h1>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" />
                <p className="italic text-sm sm:text-base">{aiInsight}</p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: "Staff Strength", value: employees.length, icon: Users, color: "from-blue-500 to-cyan-500" },
              { title: "Leave Requests", value: pendingLeaves, icon: CalendarDays, color: "from-orange-500 to-amber-500" },
              { title: "Positions", value: new Set(employees.map(e => e.position)).size, icon: Building2, color: "from-purple-500 to-pink-500" },
              { title: "Cost to Company", value: `$${totalSalary.toLocaleString()}`, icon: DollarSign, color: "from-green-500 to-emerald-500" },
            ].map((stat) => (
              <Card key={stat.title} className="border-0 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color}`}>
                    <stat.icon className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : stat.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* AI Strategy & Chat */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <Card className="lg:col-span-8 border-0 shadow-xl overflow-hidden">
               <CardHeader className="bg-slate-50 dark:bg-slate-900 border-b">
                  <div className="flex items-center gap-3">
                    <Brain className="h-6 w-6 text-indigo-600" />
                    <CardTitle>AI Strategic Insights</CardTitle>
                  </div>
               </CardHeader>
               <CardContent className="p-6 space-y-4">
                  <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800">
                    <h4 className="font-bold text-green-700">Budget Analysis</h4>
                    <p className="text-sm">Total payroll is healthy. Current spending is within stable limits.</p>
                  </div>
               </CardContent>
            </Card>

            <Card className="lg:col-span-4 border-0 shadow-xl flex flex-col h-[400px]">
              <CardHeader className="bg-indigo-600 text-white">
                <CardTitle className="text-sm flex items-center gap-2"><Sparkles className="h-4 w-4" /> HR AI Assistant</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden flex flex-col p-4 space-y-4">
                <div className="flex-1 overflow-y-auto p-3 bg-slate-50 dark:bg-slate-900 rounded-lg text-sm">
                  {chatResponse || "How can I help you today?"}
                </div>
                <div className="flex gap-2 pt-2">
                  <Input 
                    placeholder="Ask AI..." 
                    value={chatInput} 
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAskAi()}
                  />
                  <Button onClick={handleAskAi} size="icon"><Send className="h-4 w-4" /></Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
