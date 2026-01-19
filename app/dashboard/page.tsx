"use client"

import { useEffect, useState, useRef } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { useAuth } from "@/context/auth-context"
import { employeeService, type Employee } from "@/services/employee"
import { leaveService, type Leave } from "@/services/leave"
import { aiService } from "@/services/ai" 
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Users, CalendarDays, Building2, DollarSign, 
  Loader2, Sparkles, Send, Brain, FileUp, Bot, User, Zap, TrendingUp
} from "lucide-react"

export default function DashboardPage() {
  const { company } = useAuth()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [leaves, setLeaves] = useState<Leave[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [aiInsight, setAiInsight] = useState<string>("Analyzing workforce data...")
  const [chatInput, setChatInput] = useState("")
  
  const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string}[]>([])
  const chatEndRef = useRef<HTMLDivElement>(null)
  const [isUploading, setIsUploading] = useState(false)

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    const loadData = async () => {
      // Safety check for Auth Context
      if (!company?.id) { 
        setIsLoading(false); 
        return; 
      }
      
      try {
        const [empData, leaveData] = await Promise.all([
          employeeService.getEmployeesByCompany(company.id),
          leaveService.getAllLeaves(),
        ])
        
        const safeEmpData = empData || [];
        const safeLeaveData = leaveData || [];
        
        setEmployees(safeEmpData)
        setLeaves(safeLeaveData)
        
        if (safeEmpData.length > 0) {
          const insight = await aiService.ask(`Summarize HR status for ${safeEmpData.length} employees in one concise sentence in English.`);
          setAiInsight(insight);
        }
      } catch (err) {
        console.error("Dashboard Load Error:", err)
        setAiInsight("Live data synchronization failed.")
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [company?.id])

  const handleAskAi = async () => {
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatInput("");

    try {
      const res = await aiService.ask(userMsg);
      setMessages(prev => [...prev, { role: 'ai', text: res }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: "Error: Unable to connect to the HR AI Core. Please check backend connectivity." }]);
    }
  }

  const handlePdfUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    setMessages(prev => [...prev, { role: 'ai', text: "AI is analyzing the uploaded CV. Please wait..." }]);
    
    try {
      const result = await aiService.processCv(file);
      const cvSummary = `CV Analysis Complete!\n\nCandidate: ${result.firstName || 'N/A'} ${result.lastName || ''}\nEmail: ${result.email || 'N/A'}\nSuggested Role: ${result.position || 'N/A'}\nKey Skills: ${result.skills || 'N/A'}`;
      setMessages(prev => [...prev, { role: 'ai', text: cvSummary }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: "Failed to parse CV. Ensure the file is a valid PDF and the backend parser is active." }]);
    } finally {
      setIsUploading(false);
    }
  };

  const pendingLeaves = leaves.filter(l => l.status?.toLowerCase() === "pending").length;
  const totalSalary = employees.reduce((s, e) => s + (e.salary || 0), 0);

  const stats = [
    { 
      label: "Active Employees", 
      val: employees.length, 
      icon: Users, 
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-50 to-cyan-50",
      iconBg: "bg-gradient-to-br from-blue-500 to-cyan-500"
    },
    { 
      label: "Pending Requests", 
      val: pendingLeaves, 
      icon: CalendarDays, 
      gradient: "from-orange-500 to-amber-500",
      bgGradient: "from-orange-50 to-amber-50",
      iconBg: "bg-gradient-to-br from-orange-500 to-amber-500"
    },
    { 
      label: "Total Positions", 
      val: new Set(employees.map(e => e.position)).size, 
      icon: Building2, 
      gradient: "from-purple-500 to-pink-500",
      bgGradient: "from-purple-50 to-pink-50",
      iconBg: "bg-gradient-to-br from-purple-500 to-pink-500"
    },
    { 
      label: "Monthly Payroll", 
      val: `LKR ${totalSalary.toLocaleString()}`, 
      icon: DollarSign, 
      gradient: "from-emerald-500 to-teal-500",
      bgGradient: "from-emerald-50 to-teal-50",
      iconBg: "bg-gradient-to-br from-emerald-500 to-teal-500"
    },
  ];

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4 lg:p-10">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 animate-in fade-in slide-in-from-top duration-700">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-200/50 backdrop-blur-sm">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">System Online</span>
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-black tracking-tighter">
                <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient">
                  HR Core AI
                </span>
              </h1>
              
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-2 rounded-lg shadow-lg shadow-amber-500/30">
                   <Sparkles className="h-4 w-4 text-white animate-pulse" />
                </div>
                <p className="font-semibold text-sm md:text-base">{aiInsight}</p>
              </div>
            </div>

            <div className="relative group">
               <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-200" />
               <div className="relative bg-white dark:bg-slate-900 p-1 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700">
                 <input type="file" accept=".pdf" className="hidden" id="cv-upload" onChange={handlePdfUpload} disabled={isUploading} />
                 <label htmlFor="cv-upload">
                   <Button asChild className="cursor-pointer bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 transition-all font-bold px-8 py-6 rounded-xl shadow-lg" variant="default">
                     <span>
                       {isUploading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <FileUp className="mr-2 h-5 w-5" />}
                       Upload CV
                     </span>
                   </Button>
                 </label>
               </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom duration-700">
            {stats.map((s, idx) => (
              <Card key={s.label} className={`border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden group bg-gradient-to-br ${s.bgGradient} dark:from-slate-800 dark:to-slate-900`} style={{ animationDelay: `${idx * 100}ms` }}>
                <CardContent className="p-6 relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/50 to-transparent rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
                  
                  <div className="relative space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <p className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400 tracking-widest">{s.label}</p>
                        <h3 className="text-4xl font-black bg-gradient-to-r ${s.gradient} bg-clip-text text-transparent">
                          {isLoading ? <Loader2 className="h-8 w-8 animate-spin text-slate-400"/> : s.val}
                        </h3>
                      </div>
                      
                      <div className={`p-3 rounded-2xl ${s.iconBg} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <s.icon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      <TrendingUp className="h-3 w-3" />
                      <span>Live Data</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* AI Chat Interface */}
          <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900 animate-in fade-in slide-in-from-bottom duration-700 delay-300">
            <CardHeader className="bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900 px-8 py-6 text-white border-b border-slate-700/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-indigo-500 rounded-2xl blur-xl opacity-50 animate-pulse" />
                    <div className="relative bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-2xl shadow-2xl">
                      <Bot className="h-7 w-7 text-white" />
                    </div>
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent">HR Intelligence Assistant</CardTitle>
                    <p className="text-sm text-indigo-300 flex items-center gap-2 mt-1">
                      <span className="h-2 w-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50" />
                       • {employees.length} 
                    </p>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0 flex flex-col h-[650px] bg-gradient-to-b from-slate-50/50 to-white dark:from-slate-900 dark:to-slate-950">
              <div className="flex-1 overflow-y-auto p-8 space-y-6">
                {messages.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in zoom-in duration-500">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-[3rem] blur-2xl opacity-20 animate-pulse" />
                      <div className="relative bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 p-12 rounded-[3rem] border border-indigo-100 dark:border-indigo-900">
                         <Brain className="h-24 w-24 text-indigo-300 dark:text-indigo-700" />
                      </div>
                    </div>
                    <div className="max-w-md space-y-3">
                        <h4 className="font-bold text-2xl bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent">AI Concierge Ready</h4>
                        <p className="text-slate-500 dark:text-slate-400 leading-relaxed">Ask me about payroll analytics, leave trends, or process new candidate resumes.</p>
                    </div>
                  </div>
                )}
                
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom duration-300`} style={{ animationDelay: `${i * 50}ms` }}>
                    <div className={`flex gap-4 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`h-11 w-11 rounded-2xl flex items-center justify-center shadow-lg shrink-0 ${
                        m.role === 'user' 
                          ? 'bg-gradient-to-br from-slate-700 to-slate-900 shadow-slate-900/30' 
                          : 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-indigo-500/30'
                      }`}>
                        {m.role === 'user' ? <User className="h-5 w-5 text-white" /> : <Zap className="h-5 w-5 text-white" />}
                      </div>
                      <div className={`p-6 rounded-3xl shadow-lg text-sm md:text-base leading-relaxed backdrop-blur-sm ${
                        m.role === 'user' 
                        ? 'bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-tr-md shadow-slate-900/20' 
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-tl-md'
                      }`}>
                        <div className="whitespace-pre-wrap">{m.text}</div>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Enhanced Input Area */}
              <div className="p-8 bg-gradient-to-t from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-900/50 border-t border-slate-200 dark:border-slate-700">
                <div className="max-w-4xl mx-auto relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-[2rem] blur opacity-20 group-focus-within:opacity-40 transition duration-200" />
                  <div className="relative flex gap-3 items-center bg-white dark:bg-slate-800 p-2 rounded-[2rem] border-2 border-slate-200 dark:border-slate-700 focus-within:border-indigo-500 dark:focus-within:border-indigo-500 transition-all shadow-xl">
                    <Input 
                      className="border-none bg-transparent focus-visible:ring-0 text-lg px-6 h-14 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                      placeholder="Ask HR AI anything..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAskAi()}
                    />
                    <Button 
                      onClick={handleAskAi} 
                      className="rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 h-14 w-14 shrink-0 shadow-2xl shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all hover:scale-105"
                    >
                      <Send className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
