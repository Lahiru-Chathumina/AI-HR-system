"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { useAuth } from "@/context/auth-context"
import { employeeService, type Employee } from "@/services/employee"
import { leaveService, type Leave } from "@/services/leave"
import { aiService } from "@/services/ai" 
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Building2, Users, CalendarDays, DollarSign, 
  Loader2, Sparkles, Send, Brain, FileUp, CheckCircle2
} from "lucide-react"

export default function DashboardPage() {
  const { company } = useAuth()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [leaves, setLeaves] = useState<Leave[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [aiInsight, setAiInsight] = useState<string>("දත්ත පද්ධතිය විශ්ලේෂණය කරමින්...")
  const [chatInput, setChatInput] = useState("")
  const [chatResponse, setChatResponse] = useState<string>("")
  
  // PDF Upload එක සඳහා අවශ්‍ය States
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState("")

  useEffect(() => {
    const loadData = async () => {
      // වැදගත්: Company ID එක ලැබෙන තෙක් බලා සිටීම
      if (!company?.id) {
          setIsLoading(false);
          return;
      }
      
      try {
        const [empData, leaveData] = await Promise.all([
          employeeService.getEmployeesByCompany(company.id),
          leaveService.getAllLeaves(),
        ])
        
        setEmployees(empData || [])
        setLeaves(leaveData || [])
        
        // AI එක හරහා සාරාංශයක් ලබා ගැනීම
        if (empData && empData.length > 0) {
          const insight = await aiService.ask(`Summarize HR status for ${empData.length} employees in one sentence Sinhala.`);
          setAiInsight(insight);
        } else {
          setAiInsight("දැනට පද්ධතියේ සේවක දත්ත නොමැත.");
        }
      } catch (err) {
        console.error("Dashboard error:", err)
        setAiInsight("Backend එක සමඟ සම්බන්ධ වීමේ දෝෂයක් පවතී.");
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [company?.id])

  // PDF (CV) Upload කිරීමේ Function එක
  const handlePdfUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadStatus("AI මගින් CV එක පරීක්ෂා කරමින්...");
    
    try {
      // Backend එකේ අපි හදපු process-cv endpoint එක call කිරීම
      const result = await aiService.processCv(file);
      setChatResponse(`සාර්ථකයි! CV එකේ තොරතුරු සොයාගත්තා: ${result.firstName} ${result.lastName}. තනතුර: ${result.position}`);
      setUploadStatus("CV එක සාර්ථකව කියවන ලදී!");
    } catch (error) {
      console.error("Upload error:", error);
      setUploadStatus("PDF එක කියවීමට අපහසු විය.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleAskAi = async () => {
    if (!chatInput) return;
    setChatResponse("AI සිතමින් පවතී...");
    try {
      const res = await aiService.ask(chatInput);
      setChatResponse(res);
    } catch (error) {
      setChatResponse("AI සේවාව ක්‍රියාවිරහිතයි. Backend එක පරීක්ෂා කරන්න.");
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
            
            {/* PDF Upload Button */}
            <div className="flex items-center gap-4">
               <div className="relative">
                  <input 
                    type="file" 
                    accept=".pdf" 
                    className="hidden" 
                    id="cv-upload" 
                    onChange={handlePdfUpload}
                    disabled={isUploading}
                  />
                  <label htmlFor="cv-upload">
                    <Button asChild variant="outline" className="cursor-pointer border-indigo-200">
                      <span>
                        {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileUp className="mr-2 h-4 w-4" />}
                        {isUploading ? "AI කියවමින්..." : "CV එකක් පරීක්ෂා කරන්න (PDF)"}
                      </span>
                    </Button>
                  </label>
                  {uploadStatus && <p className="absolute -bottom-6 left-0 text-[10px] text-indigo-500">{uploadStatus}</p>}
               </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: "මුළු සේවකයින්", value: employees.length, icon: Users, color: "from-blue-500 to-cyan-500" },
              { title: "නිවාඩු ඉල්ලීම්", value: pendingLeaves, icon: CalendarDays, color: "from-orange-500 to-amber-500" },
              { title: "තනතුරු සංඛ්‍යාව", value: new Set(employees.map(e => e.position)).size, icon: Building2, color: "from-purple-500 to-pink-500" },
              { title: "මාසික වියදම", value: `LKR ${totalSalary.toLocaleString()}`, icon: DollarSign, color: "from-green-500 to-emerald-500" },
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

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <Card className="lg:col-span-8 border-0 shadow-xl overflow-hidden">
                <CardHeader className="bg-slate-50 dark:bg-slate-900 border-b">
                  <div className="flex items-center gap-3">
                    <Brain className="h-6 w-6 text-indigo-600" />
                    <CardTitle>AI Strategic Insights</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-100">
                    <h4 className="font-bold text-green-700">Database Status</h4>
                    <p className="text-sm text-green-600">Backend පද්ධතිය සාර්ථකව සම්බන්ධ වී ඇත.</p>
                  </div>
                </CardContent>
            </Card>

            {/* AI Chat Bot */}
            <Card className="lg:col-span-4 border-0 shadow-xl flex flex-col h-[450px]">
              <CardHeader className="bg-indigo-600 text-white">
                <CardTitle className="text-sm flex items-center gap-2"><Sparkles className="h-4 w-4" /> HR AI Assistant</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden flex flex-col p-4 space-y-4">
                <div className="flex-1 overflow-y-auto p-3 bg-slate-50 dark:bg-slate-900 rounded-lg text-sm border">
                  {chatResponse || "මම ඔබට උදව් කරන්නේ කෙසේද?"}
                </div>
                <div className="flex gap-2 pt-2">
                  <Input 
                    placeholder="AI ගෙන් අසන්න..." 
                    value={chatInput} 
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAskAi()}
                  />
                  <Button onClick={handleAskAi} size="icon" className="bg-indigo-600"><Send className="h-4 w-4" /></Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
