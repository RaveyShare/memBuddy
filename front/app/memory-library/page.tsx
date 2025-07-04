"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  Brain,
  Search,
  Filter,
  Star,
  Trash2,
  Edit,
  Eye,
  MoreVertical,
  BookOpen,
  Clock,
  Target,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { api } from "@/lib/api-config"
import { useToast } from "@/components/ui/use-toast"
import AuthGuard from "@/components/auth/auth-guard"

export default function MemoryLibraryPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [sortBy, setSortBy] = useState("recent")
  const [memoryItems, setMemoryItems] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchMemoryItems = async () => {
      try {
        const items = await api.getMemoryItems()
        setMemoryItems(items)
      } catch (error) {
        console.error("Failed to fetch memory items:", error)
        toast({
          title: "加载失败",
          description: "无法加载记忆库项目，使用示例数据",
          variant: "destructive",
          open: true,
        })

        // Use mock data if API fails
        setMemoryItems([
          {
            id: 1,
            title: "中国历史朝代顺序",
            content: "夏、商、周、秦、汉、三国、晋、南北朝、隋、唐、五代十国、宋、元、明、清",
            category: "历史",
            createdAt: "2024-01-15",
            nextReview: "2024-01-22",
            reviewCount: 12,
            mastery: 85,
            tags: ["历史", "朝代", "顺序"],
            type: "sequence",
            difficulty: "medium",
            starred: true,
          },
          {
            id: 2,
            title: "化学元素周期表前20个元素",
            content: "氢氦锂铍硼碳氮氧氟氖钠镁铝硅磷硫氯氩钾钙",
            category: "化学",
            createdAt: "2024-01-10",
            nextReview: "2024-01-21",
            reviewCount: 8,
            mastery: 72,
            tags: ["化学", "元素", "周期表"],
            type: "list",
            difficulty: "hard",
            starred: false,
          },
          {
            id: 3,
            title: "英语不规则动词变化",
            content: "go-went-gone, see-saw-seen, do-did-done, have-had-had",
            category: "语言",
            createdAt: "2024-01-08",
            nextReview: "2024-01-20",
            reviewCount: 15,
            mastery: 90,
            tags: ["英语", "动词", "语法"],
            type: "grammar",
            difficulty: "easy",
            starred: true,
          },
          {
            id: 4,
            title: "数学公式：二次方程求根公式",
            content: "x = (-b ± √(b²-4ac)) / 2a",
            category: "数学",
            createdAt: "2024-01-05",
            nextReview: "2024-01-23",
            reviewCount: 6,
            mastery: 65,
            tags: ["数学", "公式", "二次方程"],
            type: "formula",
            difficulty: "hard",
            starred: false,
          },
          {
            id: 5,
            title: "世界主要国家首都",
            content: "中国-北京, 美国-华盛顿, 英国-伦敦, 法国-巴黎, 德国-柏林",
            category: "地理",
            createdAt: "2024-01-03",
            nextReview: "2024-01-24",
            reviewCount: 10,
            mastery: 78,
            tags: ["地理", "首都", "国家"],
            type: "pairs",
            difficulty: "medium",
            starred: false,
          },
        ])
      } finally {
        setIsLoading(false)
      }
    }

    fetchMemoryItems()
  }, [toast])

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-500/20 text-green-400"
      case "medium":
        return "bg-yellow-500/20 text-yellow-400"
      case "hard":
        return "bg-red-500/20 text-red-400"
      default:
        return "bg-gray-500/20 text-gray-400"
    }
  }

  const getMasteryColor = (mastery: number) => {
    if (mastery >= 80) return "text-green-400"
    if (mastery >= 60) return "text-yellow-400"
    return "text-red-400"
  }

  const filteredItems = memoryItems.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategory = filterCategory === "all" || item.category === filterCategory
    return matchesSearch && matchesCategory
  })

  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case "recent":
        return new Date(b.nextReview).getTime() - new Date(a.nextReview).getTime()
      case "mastery":
        return b.mastery - a.mastery
      case "reviews":
        return b.reviewCount - a.reviewCount
      case "alphabetical":
        return a.title.localeCompare(b.title)
      default:
        return 0
    }
  })

  const stats = {
    totalItems: memoryItems.length,
    averageMastery: Math.round(memoryItems.reduce((sum, item) => sum + item.mastery, 0) / memoryItems.length) || 0,
    totalReviews: memoryItems.reduce((sum, item) => sum + item.reviewCount, 0),
    starredItems: memoryItems.filter((item) => item.starred).length,
  }

  const handleViewDetails = async (id: string | number) => {
    try {
      // In a real app, this would navigate to a details page
      // For now, we'll just show a toast
      toast({
        title: "查看详情",
        description: `查看记忆项目 #${id} 的详情`,
        open: true,
      })
    } catch (error) {
      console.error("Error viewing details:", error)
    }
  }

  const handleStartReview = async (id: string | number) => {
    try {
      // In a real app, this would navigate to a review page
      // For now, we'll just show a toast
      toast({
        title: "开始复习",
        description: `开始复习记忆项目 #${id}`,
        open: true,
      })
    } catch (error) {
      console.error("Error starting review:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-cyan-400" />
          <p className="mt-4 text-white/70">加载记忆库...</p>
        </div>
      </div>
    )
  }

  return (
    <AuthGuard requireAuth={true}>
      <div className="min-h-screen bg-black text-white">
        {/* Navigation */}
        <header className="fixed top-0 z-50 w-full border-b border-white/10 bg-black/50 backdrop-blur-xl">
          <div className="container flex h-16 items-center justify-between px-4">
            <Link className="flex items-center space-x-2 font-bold" href="/">
              <Brain className="h-6 w-6 text-cyan-400" />
              <span>小杏仁记忆搭子</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link className="text-sm text-cyan-400" href="/memory-library">
                记忆库
              </Link>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="container mx-auto px-4 pt-24 pb-12">
          <div className="mb-8 flex items-center">
            <Link href="/" className="mr-4 rounded-full p-2 hover:bg-white/10">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-bold">记忆库</h1>
          </div>

          {/* Stats Cards */}
          <div className="mb-8 grid gap-4 md:grid-cols-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <Card className="border border-white/10 bg-white/5 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <BookOpen className="mr-2 h-5 w-5 text-cyan-400" />
                    <div>
                      <p className="text-sm text-white/70">记忆项目</p>
                      <p className="text-2xl font-bold text-cyan-400">{stats.totalItems}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="border border-white/10 bg-white/5 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <Target className="mr-2 h-5 w-5 text-green-400" />
                    <div>
                      <p className="text-sm text-white/70">平均掌握度</p>
                      <p className="text-2xl font-bold text-green-400">{stats.averageMastery}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="border border-white/10 bg-white/5 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <Clock className="mr-2 h-5 w-5 text-violet-400" />
                    <div>
                      <p className="text-sm text-white/70">总复习次数</p>
                      <p className="text-2xl font-bold text-violet-400">{stats.totalReviews}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="border border-white/10 bg-white/5 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <Star className="mr-2 h-5 w-5 text-yellow-400" />
                    <div>
                      <p className="text-sm text-white/70">收藏项目</p>
                      <p className="text-2xl font-bold text-yellow-400">{stats.starredItems}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Search and Filter */}
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
              <Input
                placeholder="搜索记忆项目..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-white/10 bg-white/5 pl-10 text-white"
              />
            </div>
            <div className="flex gap-2">
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-32 border-white/10 bg-white/5 text-white">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-black text-white">
                  <SelectItem value="all">全部</SelectItem>
                  <SelectItem value="历史">历史</SelectItem>
                  <SelectItem value="化学">化学</SelectItem>
                  <SelectItem value="语言">语言</SelectItem>
                  <SelectItem value="数学">数学</SelectItem>
                  <SelectItem value="地理">地理</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-32 border-white/10 bg-white/5 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-black text-white">
                  <SelectItem value="recent">下次复习</SelectItem>
                  <SelectItem value="mastery">掌握度</SelectItem>
                  <SelectItem value="reviews">复习次数</SelectItem>
                  <SelectItem value="alphabetical">字母顺序</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Memory Items */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sortedItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="border border-white/10 bg-white/5 backdrop-blur-sm hover:border-cyan-400/50 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg text-white">{item.title}</CardTitle>
                        <div className="mt-2 flex items-center gap-2">
                          <Badge variant="secondary" className={getDifficultyColor(item.difficulty)}>
                            {item.difficulty === "easy" ? "简单" : item.difficulty === "medium" ? "中等" : "困难"}
                          </Badge>
                          <Badge variant="outline" className="border-white/20 text-white/70">
                            {item.category}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {item.starred && <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-white/70 hover:bg-white/10">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="border-white/10 bg-black text-white">
                            <DropdownMenuItem onClick={() => handleViewDetails(item.id)}>
                              <Eye className="mr-2 h-4 w-4" />
                              查看详情
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              编辑
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-400">
                              <Trash2 className="mr-2 h-4 w-4" />
                              删除
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="mb-4 text-sm text-white/80 line-clamp-2">{item.content}</p>

                    <div className="mb-4 flex flex-wrap gap-1">
                      {item.tags.map((tag: string) => (
                        <Badge key={tag} variant="outline" className="border-white/20 text-xs text-white/60">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/70">掌握度</span>
                        <span className={`font-medium ${getMasteryColor(item.mastery)}`}>{item.mastery}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-white/10">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-cyan-400 to-violet-500"
                          style={{ width: `${item.mastery}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between text-xs text-white/60">
                      <span>复习 {item.reviewCount} 次</span>
                      <span>下次提醒: {item.nextReview}</span>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 bg-cyan-400 text-black hover:bg-cyan-500"
                        onClick={() => handleStartReview(item.id)}
                      >
                        开始复习
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-cyan-400 text-cyan-400 hover:bg-cyan-400/10"
                        onClick={() => handleViewDetails(item.id)}
                      >
                        查看详情
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {sortedItems.length === 0 && (
            <div className="py-12 text-center">
              <Brain className="mx-auto mb-4 h-12 w-12 text-white/30" />
              <p className="text-white/70">没有找到匹配的记忆项目</p>
              <p className="text-sm text-white/50">尝试调整搜索条件或创建新的记忆项目</p>
            </div>
          )}
        </main>
      </div>
    </AuthGuard>
  )
}
