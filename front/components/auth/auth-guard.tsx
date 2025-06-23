"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { authManager } from "@/lib/auth"

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  redirectTo?: string
}

export default function AuthGuard({ children, requireAuth = true, redirectTo = "/auth/login" }: AuthGuardProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = authManager.isAuthenticated()
      setIsAuthenticated(authenticated)

      if (requireAuth && !authenticated) {
        // Store the current path for redirect after login
        const currentPath = window.location.pathname + window.location.search
        const redirectUrl = `${redirectTo}?redirect=${encodeURIComponent(currentPath)}`
        router.push(redirectUrl)
        return
      }

      if (!requireAuth && authenticated) {
        // If user is authenticated but this is a public-only page (like login/register)
        const redirect = new URLSearchParams(window.location.search).get("redirect") || "/"
        router.push(redirect)
        return
      }

      setIsLoading(false)
    }

    // 初始检查
    checkAuth()

    // 监听 localStorage 变化
    const handleStorageChange = () => {
      checkAuth()
    }

    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("authChange", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("authChange", handleStorageChange)
    }
  }, [requireAuth, redirectTo, router])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-cyan-400" />
          <p className="mt-4 text-white/70">验证身份中...</p>
        </div>
      </div>
    )
  }

  if (requireAuth && !isAuthenticated) {
    return null // Will redirect in useEffect
  }

  return <>{children}</>
}
