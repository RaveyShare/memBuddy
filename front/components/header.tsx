import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { authManager } from "@/lib/auth"
import { api } from "@/lib/api-config"

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(authManager.isAuthenticated())
  const [user, setUser] = useState(authManager.getCurrentUser())

  useEffect(() => {
    const handleStorage = () => {
      setIsLoggedIn(authManager.isAuthenticated())
      setUser(authManager.getCurrentUser())
    }
    window.addEventListener("storage", handleStorage)
    handleStorage()
    return () => window.removeEventListener("storage", handleStorage)
  }, [])

  return (
    <header className="fixed top-0 z-50 w-full border-b border-white/10 bg-black/50 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link className="flex items-center space-x-2 font-bold" href="/">
          <span>小杏仁记忆搭子</span>
        </Link>
        <div className="flex items-center space-x-4">
          {isLoggedIn ? (
            <>
              <span className="text-sm text-white/70">欢迎, {user?.name}</span>
              <Link className="text-sm hover:text-cyan-400" href="/memory-library">
                记忆库
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  api.auth.logout()
                  window.location.reload()
                }}
                className="text-sm text-white/70 hover:text-cyan-400"
              >
                退出
              </Button>
            </>
          ) : (
            <>
              <Link className="text-sm hover:text-cyan-400" href="/auth/login">
                登录
              </Link>
              <Link className="text-sm hover:text-cyan-400" href="/auth/register">
                注册
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
