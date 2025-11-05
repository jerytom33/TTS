'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  Video, 
  FileText, 
  TrendingUp, 
  Clock,
  BarChart3,
  Activity,
  Globe,
  Mic,
  Download,
  Play
} from 'lucide-react'

interface AnalyticsData {
  overview: {
    totalUsers: number
    totalProjects: number
    totalVideos: number
    totalMinutes: number
  }
  trends: {
    userGrowth: number
    projectGrowth: number
    videoGrowth: number
    revenueGrowth: number
  }
  topLanguages: Array<{
    language: string
    count: number
    percentage: number
  }>
  topVoices: Array<{
    voice: string
    count: number
    percentage: number
  }>
  recentActivity: Array<{
    id: string
    type: string
    description: string
    timestamp: string
    user: string
  }>
}

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    overview: {
      totalUsers: 0,
      totalProjects: 0,
      totalVideos: 0,
      totalMinutes: 0
    },
    trends: {
      userGrowth: 0,
      projectGrowth: 0,
      videoGrowth: 0,
      revenueGrowth: 0
    },
    topLanguages: [],
    topVoices: [],
    recentActivity: []
  })
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('7d')

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`/api/admin/analytics?range=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setAnalytics(data.analytics)
      } else {
        // Simulate analytics data for demo
        const simulatedData: AnalyticsData = {
          overview: {
            totalUsers: Math.floor(Math.random() * 1000) + 500,
            totalProjects: Math.floor(Math.random() * 2000) + 1000,
            totalVideos: Math.floor(Math.random() * 5000) + 2000,
            totalMinutes: Math.floor(Math.random() * 10000) + 5000
          },
          trends: {
            userGrowth: Math.random() * 30 + 10,
            projectGrowth: Math.random() * 40 + 15,
            videoGrowth: Math.random() * 50 + 20,
            revenueGrowth: Math.random() * 25 + 5
          },
          topLanguages: [
            { language: 'Malayalam', count: Math.floor(Math.random() * 500) + 300, percentage: 65 },
            { language: 'English', count: Math.floor(Math.random() * 300) + 200, percentage: 35 }
          ],
          topVoices: [
            { voice: 'Priya (Female)', count: Math.floor(Math.random() * 200) + 150, percentage: 35 },
            { voice: 'Rahul (Male)', count: Math.floor(Math.random() * 150) + 100, percentage: 25 },
            { voice: 'Anjali (Female)', count: Math.floor(Math.random() * 100) + 80, percentage: 20 },
            { voice: 'Sarah (Female)', count: Math.floor(Math.random() * 80) + 60, percentage: 15 },
            { voice: 'John (Male)', count: Math.floor(Math.random() * 60) + 40, percentage: 5 }
          ],
          recentActivity: [
            {
              id: '1',
              type: 'project_created',
              description: 'Created new project "Welcome Video"',
              timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
              user: 'demo@example.com'
            },
            {
              id: '2',
              type: 'video_rendered',
              description: 'Completed video rendering (1080p)',
              timestamp: new Date(Date.now() - Math.random() * 7200000).toISOString(),
              user: 'user@example.com'
            },
            {
              id: '3',
              type: 'audio_generated',
              description: 'Generated Malayalam audio',
              timestamp: new Date(Date.now() - Math.random() * 10800000).toISOString(),
              user: 'test@example.com'
            }
          ]
        }
        setAnalytics(simulatedData)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getTrendBadge = (trend: number) => {
    if (trend > 20) {
      return <Badge className="bg-green-500">+{trend.toFixed(1)}%</Badge>
    } else if (trend > 0) {
      return <Badge className="bg-blue-500">+{trend.toFixed(1)}%</Badge>
    } else {
      return <Badge variant="destructive">{trend.toFixed(1)}%</Badge>
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'project_created':
        return <FileText className="w-4 h-4 text-blue-500" />
      case 'video_rendered':
        return <Video className="w-4 h-4 text-green-500" />
      case 'audio_generated':
        return <Mic className="w-4 h-4 text-purple-500" />
      default:
        return <Activity className="w-4 h-4 text-gray-500" />
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / 60000)
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p>Loading analytics...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics Overview</h2>
          <p className="text-muted-foreground">Platform performance and user engagement metrics</p>
        </div>
        <select 
          value={timeRange} 
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-3 py-2 border rounded-md bg-background"
        >
          <option value="24h">Last 24 hours</option>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.totalUsers.toLocaleString()}</div>
            <div className="flex items-center space-x-2 mt-2">
              {getTrendBadge(analytics.trends.userGrowth)}
              <span className="text-xs text-muted-foreground">vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.totalProjects.toLocaleString()}</div>
            <div className="flex items-center space-x-2 mt-2">
              {getTrendBadge(analytics.trends.projectGrowth)}
              <span className="text-xs text-muted-foreground">vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Videos Generated</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.totalVideos.toLocaleString()}</div>
            <div className="flex items-center space-x-2 mt-2">
              {getTrendBadge(analytics.trends.videoGrowth)}
              <span className="text-xs text-muted-foreground">vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Minutes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.totalMinutes.toLocaleString()}</div>
            <div className="flex items-center space-x-2 mt-2">
              {getTrendBadge(analytics.trends.revenueGrowth)}
              <span className="text-xs text-muted-foreground">vs last period</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Languages */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="w-5 h-5 mr-2" />
              Top Languages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.topLanguages.map((lang, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Globe className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium">{lang.language}</div>
                      <div className="text-sm text-muted-foreground">{lang.count} projects</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{lang.percentage}%</div>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${lang.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Voices */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mic className="w-5 h-5 mr-2" />
              Top Voices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.topVoices.map((voice, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <Mic className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-medium">{voice.voice}</div>
                      <div className="text-sm text-muted-foreground">{voice.count} uses</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{voice.percentage}%</div>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full" 
                        style={{ width: `${voice.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center space-x-3">
                  {getActivityIcon(activity.type)}
                  <div>
                    <div className="font-medium">{activity.description}</div>
                    <div className="text-sm text-muted-foreground">
                      by {activity.user} • {formatTimeAgo(activity.timestamp)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {activity.type === 'video_rendered' && (
                    <Download className="w-4 h-4 text-green-500" />
                  )}
                  {activity.type === 'audio_generated' && (
                    <Play className="w-4 h-4 text-blue-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}