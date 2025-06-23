"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Book, Brain, Clock, Mic, Send, Loader2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { api } from "@/lib/api-config"
import { useToast } from "@/components/ui/use-toast"
import { authManager } from "@/lib/auth"


export default function Home() {
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!inputValue.trim()) return

    if (!isLoggedIn) {
      router.push(`/auth/login?redirect=/memory-aids`)
      return
    }

    try {
      setIsLoading(true)

      // Call the API to generate memory aids
      try {
        const response = await api.generateMemoryAids(inputValue)
        console.log("API response:", response)

        // Store the response in localStorage or state management
        // so it can be accessed on the memory-aids page
        localStorage.setItem("memoryContent", inputValue)
        localStorage.setItem("memoryAidsData", JSON.stringify(response));
        // Navigate to the memory aids page
        router.push("/memory-aids")
      } catch (error) {
        console.error("API error:", error)

        // For demo purposes, still navigate even if API fails
        localStorage.setItem("memoryContent", inputValue)

        toast({
          title: "无法连接到服务器",
          description: "使用离线模式继续",
          open: true
        })

        // Navigate after a short delay
        setTimeout(() => {
          router.push("/memory-aids")
        }, 1000)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">

      {/* Hero Section */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden pt-16">
        {/* Animated Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Curved Lines */}
          <svg className="absolute h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="grad1" x1="1" y1="0" x2="0" y2="0">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity="0" />
                <stop offset="50%" stopColor="#22d3ee" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="grad2" x1="1" y1="0" x2="0" y2="0">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0" />
                <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* Top Curves */}
            <motion.path
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{
                duration: 2,
                ease: "easeInOut",
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "loop",
                repeatDelay: 1,
              }}
              d="M 100 100 Q 300 0 500 100 T 900 100"
              fill="none"
              stroke="url(#grad1)"
              strokeWidth="1"
            />
            <motion.path
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{
                duration: 2,
                ease: "easeInOut",
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "loop",
                repeatDelay: 1,
                delay: 0.5,
              }}
              d="M 0 200 Q 200 100 400 200 T 800 200"
              fill="none"
              stroke="url(#grad2)"
              strokeWidth="1"
            />
            {/* Bottom Curves */}
            <motion.path
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{
                duration: 2,
                ease: "easeInOut",
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "loop",
                repeatDelay: 1,
                delay: 1,
              }}
              d="M 100 600 Q 300 500 500 600 T 900 600"
              fill="none"
              stroke="url(#grad1)"
              strokeWidth="1"
            />
          </svg>

          {/* Straight Lines */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="absolute inset-0"
          >
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ x: "100%", opacity: 0 }}
                animate={{
                  x: "-100%",
                  opacity: [0, 0.7, 0.7, 0],
                }}
                transition={{
                  duration: 2.5,
                  delay: i * 0.2,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "loop",
                  ease: "linear",
                }}
                className="absolute right-0"
                style={{
                  top: `${15 + i * 10}%`,
                  height: "1px",
                  width: "100%",
                  background: `linear-gradient(90deg, transparent, ${i % 2 === 0 ? "#22d3ee" : "#8b5cf6"}60, transparent)`,
                }}
              />
            ))}
          </motion.div>
        </div>

        {/* Animated Background */}
        <div className="absolute inset-0 z-[1]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2 }}
            className="absolute -left-1/4 top-1/4 h-96 w-96 rounded-full bg-cyan-500/30 blur-3xl"
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2, delay: 0.5 }}
            className="absolute -right-1/4 top-1/2 h-96 w-96 rounded-full bg-violet-500/30 blur-3xl"
          />
        </div>

        {/* Content */}
        <div className="container relative z-[3] px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="mx-auto max-w-3xl space-y-8"
          >
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">随时记下</h1>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">稍后提醒你复习</h2>
            <p className="mx-auto max-w-2xl text-white/80 sm:text-xl">输入你想记忆的内容，AI将帮你生成记忆技巧</p>
            <form
              onSubmit={handleSubmit}
              className="mx-auto flex max-w-xl items-center justify-center rounded-full bg-white/10 p-2 backdrop-blur-sm"
            >
              <Input
                type="text"
                placeholder="记一下..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-1 border-none bg-transparent text-white placeholder-white/50 focus-visible:ring-0 focus-visible:ring-offset-0"
                disabled={isLoading}
              />
              <Button variant="ghost" size="icon" className="mr-1 text-white hover:bg-white/10" type="button">
                <Mic className="h-5 w-5" />
                <span className="sr-only">使用语音输入</span>
              </Button>
              <Button
                size="icon"
                className="bg-cyan-400 text-black hover:bg-cyan-500"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                <span className="sr-only">发送</span>
              </Button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Welcome Section */}
      <section className="relative z-10 border-t border-white/10 py-24">
        <div className="container px-4 text-center">
          <div className="mx-auto mb-12 flex justify-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-cyan-400/20 p-4">
              <Brain className="h-12 w-12 text-cyan-400" />
            </div>
          </div>
          <h2 className="mb-6 text-3xl font-bold tracking-tighter sm:text-4xl">欢迎使用小杏仁记忆搭子</h2>
          <p className="mx-auto max-w-2xl text-white/80">
            输入你想要记忆的内容，AI会为你生成记忆辅助工具，并在合适的时间提醒你复习。
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-24">
        <div className="container px-4">
          <div className="grid gap-8 md:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="group flex flex-col items-center rounded-2xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur-sm transition-colors hover:border-cyan-400/50"
            >
              <Book className="mb-4 h-12 w-12 text-cyan-400" />
              <h3 className="mb-2 text-xl font-bold">记忆辅助工具</h3>
              <p className="text-white/70">思维导图与记忆口诀</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="group flex flex-col items-center rounded-2xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur-sm transition-colors hover:border-violet-400/50"
            >
              <Brain className="mb-4 h-12 w-12 text-violet-400" />
              <h3 className="mb-2 text-xl font-bold">多感官记忆</h3>
              <p className="text-white/70">视觉、听觉、嗅觉联想</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="group flex flex-col items-center rounded-2xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur-sm transition-colors hover:border-cyan-400/50"
            >
              <Clock className="mb-4 h-12 w-12 text-cyan-400" />
              <h3 className="mb-2 text-xl font-bold">智能复习提醒</h3>
              <p className="text-white/70">基于记忆曲线的提醒</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8">
        <div className="container flex flex-col items-center justify-between space-y-4 px-4 md:flex-row md:space-y-0">
          <div className="flex items-center space-x-2">
            <Brain className="h-6 w-6 text-cyan-400" />
            <span className="font-bold">小杏仁记忆搭子</span>
          </div>
          <p className="text-sm text-white/70">© {new Date().getFullYear()} 小杏仁. 保留所有权利.</p>
          <div className="flex space-x-6">
            <Link className="text-sm text-white/70 hover:text-cyan-400" href="#">
              隐私政策
            </Link>
            <Link className="text-sm text-white/70 hover:text-cyan-400" href="#">
              使用条款
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
