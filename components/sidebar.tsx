"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { cn } from "@/lib/utils"
import {
  Building2,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
  CalendarDays,
  DollarSign,
  ClipboardCheck,
} from "lucide-react"
import { Button } from "@/components/ui/button"

// 1. TypeScript සඳහා Props interface එකක් එකතු කරන්න
interface SidebarProps {
  className?: string;
}

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Employees", href: "/employees", icon: Users },
  { label: "Attendance", href: "/attendance", icon: ClipboardCheck },
  { label: "Leaves", href: "/leaves", icon: CalendarDays },
  { label: "Payroll", href: "/payroll", icon: DollarSign },
  { label: "Company Profile", href: "/company", icon: Building2 },
]

// 2. className prop එක මෙතනට ලබාගන්න
export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  return (
    // 3. h-screen වෙනුවට h-full පාවිච්චි කරන්න, පිටතින් එන className එක cn() එකට දාන්න
    <aside className={cn("flex h-full w-64 flex-col border-r border-sidebar-border bg-sidebar", className)}>
      {/* Logo Section */}
      <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6 flex-shrink-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
          <Settings className="h-4 w-4 text-sidebar-primary-foreground" />
        </div>
        <span className="font-semibold text-sidebar-foreground">HR System</span>
      </div>

      {/* Company Badge */}
      {user && (
        <div className="border-b border-sidebar-border px-4 py-3 flex-shrink-0">
          <div className="flex items-center gap-2 rounded-md bg-sidebar-accent px-3 py-2">
            <Building2 className="h-4 w-4 text-sidebar-accent-foreground" />
            <span className="truncate text-sm font-medium text-sidebar-accent-foreground">{user.companyName}</span>
          </div>
        </div>
      )}

      {/* Navigation - overflow-y-auto දාන්න මෙනු එක ගොඩක් වැඩි වුනොත් scroll වෙන්න */}
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User Section */}
      <div className="border-t border-sidebar-border p-4 flex-shrink-0">
        <div className="mb-3 flex items-center gap-3 px-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-accent text-sm font-medium text-sidebar-accent-foreground">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 truncate">
            <p className="truncate text-sm font-medium text-sidebar-foreground">{user?.name}</p>
            <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-muted-foreground hover:text-sidebar-foreground"
          onClick={logout}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </aside>
  )
}
