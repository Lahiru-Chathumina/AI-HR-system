"use client"

import type React from "react"
import { useState } from "react"
import { ProtectedRoute } from "./protected-route"
import { Sidebar } from "./sidebar"
import { Menu, X } from "lucide-react" 
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-background overflow-hidden">
        
        {/* Desktop Sidebar (lg වලදී විතරක් පෙනේ) */}
        <div className="hidden lg:block h-full">
          <Sidebar />
        </div>

        {/* Mobile Sidebar Overlay (Drawer) */}
        <div className={cn(
          "fixed inset-0 z-50 lg:hidden transition-opacity duration-300",
          isSidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}>
          {/* කළු පැහැති පසුබිම (Backdrop) */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
            onClick={() => setIsSidebarOpen(false)} 
          />
          
          {/* Sidebar එක එලියට එන Slider එක */}
          <div className={cn(
            "absolute inset-y-0 left-0 w-64 bg-white dark:bg-slate-900 shadow-2xl transition-transform duration-300",
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}>
            <div className="p-4 flex justify-end border-b lg:hidden">
              <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)}>
                <X className="h-6 w-6" />
              </Button>
            </div>
            <Sidebar className="border-r-0" /> {/* Mobile එකේදී අමතර border එක අයින් කරන්න */}
          </div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0">
          {/* Mobile Top Navbar */}
          <header className="lg:hidden flex items-center justify-between px-6 py-4 border-b bg-white dark:bg-slate-900 z-10">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 p-1.5 rounded-lg">
                <div className="w-5 h-5 border-2 border-white rounded-sm" />
              </div>
              <span className="font-bold text-lg">HR System</span>
            </div>
            <Button variant="outline" size="icon" onClick={() => setIsSidebarOpen(true)}>
              <Menu className="h-6 w-6" />
            </Button>
          </header>

          {/* Page Content */}
          <div className="flex-1 overflow-auto bg-slate-50/50 dark:bg-slate-950/50">
            <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
              {children}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
