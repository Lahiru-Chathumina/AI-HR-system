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
  const { user, company } = useAuth()
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 space-y-6 sm:space-y-8">
          
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                AI HR Command Center
              </h1>
              <div className="flex items-start sm:items-center gap-2 text-sm sm:text-base text-slate-600 dark:text-slate-400">
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500 flex-shrink-0 mt-0.5 sm:mt-0 animate-pulse" />
                <p className="italic font-medium leading-relaxed">{aiInsight}</p>
              </div>
            </div>
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-bold shadow-lg shadow-emerald-500/30 self-start lg:self-auto">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              System Live: AI Active
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              { title: "Staff Strength", value: employees.length, icon: Users, gradient: "from-blue-500 to-cyan-500" },
              { title: "Leave Requests", value: pendingLeaves, icon: CalendarDays, gradient: "from-orange-500 to-amber-500" },
              { title: "Departments", value: new Set(employees.map(e => e.department)).size, icon: Building2, gradient: "from-purple-500 to-pink-500" },
              { title: "Cost to Company", value: `$${totalSalary.toLocaleString()}`, icon: DollarSign, gradient: "from-green-500 to-emerald-500" },
            ].map((stat, idx) => (
              <Card key={stat.title} className="group relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-5 group-hover:opacity-10 transition-opacity`}></div>
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">{stat.title}</CardTitle>
                  <div className={`p-2 sm:p-2.5 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
                    <stat.icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent className="pt-1">
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-black bg-gradient-to-br from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                    {isLoading ? <Loader2 className="animate-spin h-6 w-6 sm:h-8 sm:w-8" /> : stat.value}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* AI Strategy Panel */}
            <Card className="lg:col-span-8 border-0 shadow-2xl overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
              <CardHeader className="border-b bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-slate-900 dark:to-indigo-950 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                    <Brain className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">AI Strategic Insights</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">Real-time analytics powered by AI</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="group p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-2 border-green-200 dark:border-green-800 hover:border-green-400 dark:hover:border-green-600 transition-all duration-300 hover:shadow-lg">
                  <div className="flex gap-3 sm:gap-4">
                    <div className="flex-shrink-0 p-2 sm:p-2.5 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-md group-hover:shadow-lg transition-shadow">
                      <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-green-900 dark:text-green-100 mb-1 text-sm sm:text-base">Budget Analysis</h4>
                      <p className="text-xs sm:text-sm text-green-800 dark:text-green-200 leading-relaxed">Payroll is within stable limits. AI suggests budget is safe for new hires.</p>
                    </div>
                  </div>
                </div>
                
                <div className="group p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 border-2 border-orange-200 dark:border-orange-800 hover:border-orange-400 dark:hover:border-orange-600 transition-all duration-300 hover:shadow-lg">
                  <div className="flex gap-3 sm:gap-4">
                    <div className="flex-shrink-0 p-2 sm:p-2.5 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 shadow-md group-hover:shadow-lg transition-shadow">
                      <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-orange-900 dark:text-orange-100 mb-1 text-sm sm:text-base">Staffing Risk</h4>
                      <p className="text-xs sm:text-sm text-orange-800 dark:text-orange-200 leading-relaxed">
                        {pendingLeaves > 2 ? `Critical: ${pendingLeaves} leaves pending. Dept productivity might drop.` : 'All systems normal.'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Chat Assistant */}
            <Card className="lg:col-span-4 border-0 shadow-2xl overflow-hidden flex flex-col">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500"></div>
              <CardHeader className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white pb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 animate-pulse" />
                  <CardTitle className="text-base sm:text-lg font-bold">HR AI Assistant</CardTitle>
                </div>
                <CardDescription className="text-indigo-100 text-xs sm:text-sm">Ask anything about your workforce</CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-5 space-y-4 flex-1 flex flex-col">
                <div className="flex-1 min-h-[120px] sm:min-h-[140px] overflow-y-auto text-xs sm:text-sm p-3 sm:p-4 bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-slate-900 dark:to-indigo-950 rounded-xl border-2 border-slate-200 dark:border-slate-700 shadow-inner">
                  {chatResponse ? (
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{chatResponse}</p>
                  ) : (
                    <p className="text-slate-400 dark:text-slate-500 italic">Ask about policy, salary or attendance...</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Type your question..." 
                    className="flex-1 h-10 sm:h-11 text-sm border-2 focus:border-indigo-500 dark:focus:border-indigo-400 bg-white dark:bg-slate-900 shadow-sm" 
                    value={chatInput} 
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAskAi()}
                  />
                  <Button 
                    size="sm" 
                    onClick={handleAskAi} 
                    className="h-10 sm:h-11 px-4 sm:px-5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </DashboardLayout>
  )
}