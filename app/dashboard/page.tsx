"use client"

import { useSession } from "next-auth/react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AuthGuard } from "@/components/auth/auth-guard"
import { UserNav } from "@/components/auth/user-nav"
import { FileText, Download, TrendingUp, Plus, Figma, Code, Zap, Star } from "lucide-react"
import Link from "next/link"

interface DashboardStats {
  totalProjects: number
  completedProjects: number
  exportsThisMonth: number
  exportsRemaining: number
}

interface RecentProject {
  id: string
  name: string
  status: "draft" | "processing" | "completed" | "failed"
  updatedAt: string
  figmaUrl: string
}

export default function DashboardPage() {
  const { data: session } = useSession()

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async (): Promise<DashboardStats> => {
      // Mock data - in real app, fetch from API
      return {
        totalProjects: 12,
        completedProjects: 8,
        exportsThisMonth: 15,
        exportsRemaining: session?.user?.subscription?.exportsLimit
          ? session.user.subscription.exportsLimit - (session.user.subscription.exportsUsed || 0)
          : 0,
      }
    },
  })

  const { data: recentProjects, isLoading: projectsLoading } = useQuery({
    queryKey: ["recent-projects"],
    queryFn: async (): Promise<RecentProject[]> => {
      // Mock data - in real app, fetch from API
      return [
        {
          id: "1",
          name: "Button Component",
          status: "completed",
          updatedAt: "2024-01-15T10:30:00Z",
          figmaUrl: "https://figma.com/file/example1",
        },
        {
          id: "2",
          name: "Card Layout",
          status: "processing",
          updatedAt: "2024-01-15T09:15:00Z",
          figmaUrl: "https://figma.com/file/example2",
        },
        {
          id: "3",
          name: "Navigation Menu",
          status: "draft",
          updatedAt: "2024-01-14T16:45:00Z",
          figmaUrl: "https://figma.com/file/example3",
        },
      ]
    },
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500"
      case "processing":
        return "bg-blue-500"
      case "failed":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <Figma className="h-8 w-8 text-purple-600 mr-3" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Figma Export Tool</h1>
                  <p className="text-sm text-gray-500">Welcome back, {session?.user?.name}</p>
                </div>
              </div>
              <UserNav />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Quick Actions */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild className="flex-1 sm:flex-none">
                <Link href="/enhanced-generator">
                  <Plus className="mr-2 h-4 w-4" />
                  New Project
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/code-enhancement">
                  <Code className="mr-2 h-4 w-4" />
                  Code Enhancement
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard/projects">
                  <FileText className="mr-2 h-4 w-4" />
                  All Projects
                </Link>
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalProjects || 0}</div>
                <p className="text-xs text-muted-foreground">{stats?.completedProjects || 0} completed</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Exports This Month</CardTitle>
                <Download className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.exportsThisMonth || 0}</div>
                <p className="text-xs text-muted-foreground">{stats?.exportsRemaining || 0} remaining</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Plan</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold capitalize">{session?.user?.subscription?.plan || "Free"}</div>
                <p className="text-xs text-muted-foreground">
                  {session?.user?.subscription?.exportsLimit || 10} exports/month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Usage</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round(
                    ((session?.user?.subscription?.exportsUsed || 0) /
                      (session?.user?.subscription?.exportsLimit || 10)) *
                      100,
                  )}
                  %
                </div>
                <Progress
                  value={
                    ((session?.user?.subscription?.exportsUsed || 0) /
                      (session?.user?.subscription?.exportsLimit || 10)) *
                    100
                  }
                  className="mt-2"
                />
              </CardContent>
            </Card>
          </div>

          {/* Recent Projects */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Projects</CardTitle>
                <CardDescription>Your latest Figma to React conversions</CardDescription>
              </CardHeader>
              <CardContent>
                {projectsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentProjects?.map((project) => (
                      <div key={project.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(project.status)}`} />
                          <div>
                            <p className="text-sm font-medium">{project.name}</p>
                            <p className="text-xs text-muted-foreground">Updated {formatDate(project.updatedAt)}</p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="capitalize">
                          {project.status}
                        </Badge>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full mt-4 bg-transparent" asChild>
                      <Link href="/dashboard/projects">View All Projects</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Start Guide */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Start</CardTitle>
                <CardDescription>Get started with your first conversion</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-blue-600">1</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Copy Figma URL</p>
                      <p className="text-xs text-muted-foreground">Get the share link from your Figma design</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-blue-600">2</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Generate Code</p>
                      <p className="text-xs text-muted-foreground">Our AI converts your design to React components</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-blue-600">3</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Download & Use</p>
                      <p className="text-xs text-muted-foreground">Get production-ready code for your project</p>
                    </div>
                  </div>
                  <Button className="w-full mt-4" asChild>
                    <Link href="/enhanced-generator">
                      <Zap className="mr-2 h-4 w-4" />
                      Start Converting
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}
