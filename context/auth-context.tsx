"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { authService } from "@/services/auth"
import { companyService, type Company } from "@/services/company"

interface User {
  id: number
  email: string
  name: string
  companyId: number
  companyName: string
}

interface AuthContextType {
  user: User | null
  company: Company | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  refreshCompany: () => Promise<void>
}

interface RegisterData {
  email: string
  password: string
  name: string
  phone: string
  taxId: string
  address?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [company, setCompany] = useState<Company | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const logout = useCallback(() => {
    localStorage.removeItem("token")
    localStorage.removeItem("company")
    setUser(null)
    setCompany(null)
    router.push("/login")
  }, [router])

  const refreshCompany = useCallback(async () => {
    const storedCompany = localStorage.getItem("company")
    if (storedCompany) {
      const companyData = JSON.parse(storedCompany) as Company
      try {
        const updatedCompany = await companyService.getCompany(companyData.id)
        setCompany(updatedCompany)
        localStorage.setItem("company", JSON.stringify(updatedCompany))
      } catch {
        setCompany(companyData)
      }
    }
  }, [])

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token")
      const storedCompany = localStorage.getItem("company")

      if (token && storedCompany) {
        try {
          const companyData = JSON.parse(storedCompany) as Company
          setCompany(companyData)
          setUser({
            id: companyData.id,
            email: companyData.email || "",
            name: companyData.name,
            companyId: companyData.id,
            companyName: companyData.name,
          })
        } catch {
          localStorage.removeItem("token")
          localStorage.removeItem("company")
        }
      }
      setIsLoading(false)
    }
    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    // Backend AuthController එකට අනුව response එක ගන්නේ මෙහෙමයි
    const response: any = await authService.login({ email, password })

    // Backend එකෙන් එන companyId සහ name අරන් Company object එකක් හදනවා
    const companyObj: Company = {
      id: response.companyId, // මෙතනයි වැරදිලා තිබ්බේ
      name: response.name,
      email: email, // Login කරන email එකම මෙතනට දානවා
    }

    localStorage.setItem("token", response.token)
    localStorage.setItem("company", JSON.stringify(companyObj))
    
    setCompany(companyObj)
    setUser({
      id: companyObj.id,
      email: email,
      name: companyObj.name,
      companyId: companyObj.id,
      companyName: companyObj.name,
    })
    
    router.push("/dashboard")
  }

  const register = async (data: RegisterData) => {
    const response: any = await authService.register({
      name: data.name,
      email: data.email,
      password: data.password,
      phone: data.phone,
      taxId: data.taxId,
      address: data.address,
    })

    const companyObj: Company = {
      id: response.companyId,
      name: response.name,
      email: data.email,
    }

    localStorage.setItem("token", response.token)
    localStorage.setItem("company", JSON.stringify(companyObj))
    
    setCompany(companyObj)
    setUser({
      id: companyObj.id,
      email: data.email,
      name: companyObj.name,
      companyId: companyObj.id,
      companyName: companyObj.name,
    })
    
    router.push("/dashboard")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        company,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshCompany,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}