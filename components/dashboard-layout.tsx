"use client"

import type React from "react"
import { useState } from "react" // Menu එක open/close කරන්න
import { ProtectedRoute } from "./protected-route"
import { Sidebar } from "./sidebar"
import { Menu, X } from "lucide-react" // Icons සඳහා
import { Button } from "@/components/ui/button"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-background overflow-hidden">
        
        {/* Desktop Sidebar - lg (1024px) වලට වඩා වැඩි screen වලදී විතරක් පෙන්වයි */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        {/* Mobile Sidebar Overlay (Drawer) */}
        {isSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Background Dim (පිළිකන්න) */}
            <div 
              className="fixed inset-0 bg-black/50" 
              onClick={() => setIsSidebarOpen(false)} 
            />
            {/* Sidebar Content */}
            <div className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-slate-900 shadow-xl animate-in slide-in-from-left duration-300">
              <div className="p-4 flex justify-end">
                <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)}>
                  <X className="h-6 w-6" />
                </Button>
              </div>
              <Sidebar />
            </div>
          </div>
        )}

        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Mobile Header - Mobile වලදී විතරක් පේන Menu Button එක */}
          <header className="lg:hidden flex items-center justify-between p-4 border-b bg-white dark:bg-slate-900">
            <h2 className="font-bold">HR System</h2>
            <Button variant="outline" size="icon" onClick={() => setIsSidebarOpen(true)}>
              <Menu className="h-6 w-6" />
            </Button>
          </header>

          {/* Main Page Content */}
          <div className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-950">
            <div className="container mx-auto p-4 sm:p-6 lg:p-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
