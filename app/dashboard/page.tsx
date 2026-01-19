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
  Loader2, Sparkles, Send, Brain, FileUp, Bot, User, Zap
} from "lucide-react"

export default function DashboardPage() {
  const { company } = useAuth()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [leaves, setLeaves] = useState<Leave[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [aiInsight, setAiInsight] = useState<string>("Analyzing workforce data...")
  const [chatInput, setChatInput] = useState("")
  
  // Chat History Management
  const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string}[]>([])
  const chatEndRef = useRef<HTMLDivElement>(null)
  const [isUploading, setIsUploading] = useState(false)

  // Scroll to latest message automatically
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    const loadData = async () => {
      if (!company?.id) { setIsLoading(false); return; }
      try {
        const [empData, leaveData] = await Promise.all([
          employeeService.getEmployeesByCompany(company.id),
          leaveService.getAllLeaves(),
        ])
        setEmployees(empData || [])
        setLeaves(leaveData || [])
        
        if (empData?.length > 0) {
          const insight = await aiService.ask(`Summarize HR status for ${empData.length} employees in one sentence.`);
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
      setMessages(prev => [...prev, { role: 'ai', text: "Error: Unable to connect to the HR AI Core." }]);
    }
  }

  const handlePdfUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const result = await aiService.processCv(file);
      const cvSummary = `CV Analysis Complete!\n\nCandidate: ${result.firstName} ${result.lastName}\nEmail: ${result.email}\nSuggested Role: ${result.position}\nSkills: ${result.skills}`;
      setMessages(prev => [...prev, { role: 'ai', text: cvSummary }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: "Failed to parse CV. Ensure the file is a standard PDF resume." }]);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 p-4 lg:p-10">
        <div className="max-w-7xl mx-auto space-y-10">
          
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-3">
              <h1 className="text-5xl lg:text-7xl font-black tracking-tighter bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                HR Core AI
              </h1>
              <div className="flex items-center gap-3 text-slate-500">
                <div className="bg-amber-100 p-1 rounded">
                   <Sparkles className="h-4 w-4 text-amber-600" />
                </div>
                <p className="font-semibold text-sm md:text-md uppercase tracking-widest">{aiInsight}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
               <input type="file" accept=".pdf" className="hidden" id="cv-upload" onChange={handlePdfUpload} disabled={isUploading} />
               <label htmlFor="cv-upload">
                 <Button asChild className="cursor-pointer bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100 transition-all font-bold px-6 py-6 rounded-xl" variant="outline">
                   <span>
                     {isUploading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <FileUp className="mr-2 h-5 w-5" />}
                     PARSE CANDIDATE CV
                   </span>
                 </Button>
               </label>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { label: "Active Employees", val: employees.length, icon: Users, theme: "blue" },
              { label: "Pending Requests", val: leaves.filter(l => l.status === "Pending").length, icon: CalendarDays, theme: "orange" },
              { label: "Departments", val: new Set(employees.map(e => e.department)).size || 0, icon: Building2, theme: "purple" },
              { label: "Monthly Payroll", val: `$${employees.reduce((s, e) => s + (e.salary || 0), 0).toLocaleString()}`, icon: DollarSign, theme: "green" },
            ].map(s => (
              <Card key={s.label} className="border-none shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs uppercase font-bold text-slate-400 tracking-wider">{s.label}</p>
                    <h3 className="text-3xl font-black text-slate-800">{isLoading ? "..." : s.val}</h3>
                  </div>
                  <div className={`p-4 rounded-2xl bg-${s.theme}-50 text-${s.theme}-600`}>
                    <s.icon className="h-7 w-7" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* LARGE AI CHAT INTERFACE */}
          <Card className="border-none shadow-2xl rounded-[2rem] overflow-hidden bg-white">
            <CardHeader className="bg-slate-900 px-8 py-6 text-white flex flex-row items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-4">
                <div className="bg-indigo-500 p-3 rounded-2xl shadow-lg shadow-indigo-500/30">
                  <Bot className="h-7 w-7" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold">HR Intelligence Assistant</CardTitle>
                  <p className="text-sm text-slate-400 flex items-center gap-2">
                    <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                    Neural Link Active • Connected to {employees.length} Records
                  </p>
                </div>
              </div>
              <div className="hidden md:flex gap-4">
                 <div className="text-right">
                    <p className="text-[10px] text-slate-500 font-mono uppercase">System Engine</p>
                    <p className="text-xs font-bold text-indigo-400">LLAMA 3.3 Versatile</p>
                 </div>
              </div>
            </CardHeader>

            <CardContent className="p-0 flex flex-col h-[650px] bg-slate-50/20">
              {/* Message Feed */}
              <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-thin scrollbar-thumb-slate-200">
                {messages.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                    <div className="bg-indigo-50 p-10 rounded-[3rem]">
                       <Brain className="h-20 w-20 text-indigo-200" />
                    </div>
                    <div className="max-w-xs space-y-2">
                        <h4 className="font-bold text-xl text-slate-800">AI Concierge Ready</h4>
                        <p className="text-sm text-slate-400">Ask me to analyze payroll, check leave trends, or process new candidate resumes.</p>
                    </div>
                  </div>
                )}
                
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} transition-all`}>
                    <div className={`flex gap-4 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center shadow-sm shrink-0 ${
                        m.role === 'user' ? 'bg-slate-800' : 'bg-indigo-600'
                      }`}>
                        {m.role === 'user' ? <User className="h-5 w-5 text-white" /> : <Zap className="h-5 w-5 text-white" />}
                      </div>
                      <div className={`p-5 rounded-3xl shadow-sm text-sm md:text-base leading-relaxed ${
                        m.role === 'user' 
                        ? 'bg-slate-800 text-white rounded-tr-none' 
                        : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                      }`}>
                        <div className="whitespace-pre-wrap">{m.text}</div>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Enhanced Input Area */}
              <div className="p-8 bg-white border-t border-slate-100">
                <div className="max-w-4xl mx-auto flex gap-4 items-center bg-slate-50 p-3 rounded-[2rem] border border-slate-200 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all shadow-inner">
                  <Input 
                    className="border-none bg-transparent focus-visible:ring-0 text-lg px-6 h-12"
                    placeholder="Describe an HR task or ask a workforce question..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAskAi()}
                  />
                  <Button onClick={handleAskAi} className="rounded-2xl bg-indigo-600 hover:bg-indigo-700 h-14 w-14 shrink-0 shadow-xl shadow-indigo-600/20">
                    <Send className="h-6 w-6" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
