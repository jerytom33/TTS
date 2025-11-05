'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Server, 
  Database, 
  HardDrive, 
  Activity, 
  Cpu, 
  MemoryStick,
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown
} from 'lucide-react'

interface SystemMetrics {
  cpu: {
    usage: number
    cores: number
    temperature: number
  }
  memory: {
    used: number
    total: number
    percentage: number
  }
  disk: {
    used: number
    total: number
    percentage: number
  }
  database: {
    connections: number
    queryTime: number
    size: number
  }
  api: {
    requestsPerMinute: number
    averageResponseTime: number
    errorRate: number
  }
  uptime: number
  lastRestart: string
}

export default function SystemMonitoring() {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpu: { usage: 0, cores: 4, temperature: 45 },
    memory: { used: 0, total: 16384, percentage: 0 },
    disk: { used: 0, total: 512000, percentage: 0 },
    database: { connections: 0, queryTime: 0, size: 0 },
    api: { requestsPerMinute: 0, averageResponseTime: 0, errorRate: 0 },
    uptime: 0,
    lastRestart: new Date().toISOString()
  })
  const [isLoading, setIsLoading] = useState(true)
  const [systemHealth, setSystemHealth] = useState<'healthy' | 'warning' | 'critical'>('healthy')

  useEffect(() => {
    fetchMetrics()
    const interval = setInterval(fetchMetrics, 10000) // Update every 10 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchMetrics = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch('/api/admin/system-metrics', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setMetrics(data.metrics)
        
        // Determine system health
        if (data.metrics.cpu.usage > 90 || data.metrics.memory.percentage > 90 || data.metrics.api.errorRate > 5) {
          setSystemHealth('critical')
        } else if (data.metrics.cpu.usage > 70 || data.metrics.memory.percentage > 70 || data.metrics.api.errorRate > 2) {
          setSystemHealth('warning')
        } else {
          setSystemHealth('healthy')
        }
      } else {
        // Simulate metrics for demo
        const simulatedMetrics: SystemMetrics = {
          cpu: { 
            usage: Math.random() * 30 + 20, 
            cores: 4, 
            temperature: Math.random() * 20 + 40 
          },
          memory: { 
            used: Math.random() * 4000 + 2000, 
            total: 16384, 
            percentage: 0 
          },
          disk: { 
            used: Math.random() * 100000 + 50000, 
            total: 512000, 
            percentage: 0 
          },
          database: { 
            connections: Math.floor(Math.random() * 10) + 5, 
            queryTime: Math.random() * 50 + 10, 
            size: Math.random() * 500 + 100 
          },
          api: { 
            requestsPerMinute: Math.floor(Math.random() * 100) + 20, 
            averageResponseTime: Math.random() * 200 + 100, 
            errorRate: Math.random() * 2 
          },
          uptime: Math.random() * 86400 * 7,
          lastRestart: new Date(Date.now() - Math.random() * 86400 * 7).toISOString()
        }
        
        simulatedMetrics.memory.percentage = (simulatedMetrics.memory.used / simulatedMetrics.memory.total) * 100
        simulatedMetrics.disk.percentage = (simulatedMetrics.disk.used / simulatedMetrics.disk.total) * 100
        
        setMetrics(simulatedMetrics)
      }
    } catch (error) {
      console.error('Error fetching metrics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getHealthBadge = (health: string) => {
    switch (health) {
      case 'healthy':
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Healthy</Badge>
      case 'warning':
        return <Badge className="bg-yellow-500"><AlertTriangle className="w-3 h-3 mr-1" />Warning</Badge>
      case 'critical':
        return <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1" />Critical</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  const getTrendIcon = (value: number, threshold: number) => {
    if (value > threshold) return <TrendingUp className="w-4 h-4 text-red-500" />
    return <TrendingDown className="w-4 h-4 text-green-500" />
  }

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p>Loading system metrics...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">System Monitoring</h2>
          <p className="text-muted-foreground">Real-time system performance and health metrics</p>
        </div>
        <div className="flex items-center space-x-4">
          {getHealthBadge(systemHealth)}
          <Badge variant="outline">
            <Clock className="w-3 h-3 mr-1" />
            Uptime: {formatUptime(metrics.uptime)}
          </Badge>
        </div>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.cpu.usage.toFixed(1)}%</div>
            <Progress value={metrics.cpu.usage} className="mt-2" />
            <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
              <span>{metrics.cpu.cores} cores</span>
              <span>{metrics.cpu.temperature.toFixed(1)}°C</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <MemoryStick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.memory.percentage.toFixed(1)}%</div>
            <Progress value={metrics.memory.percentage} className="mt-2" />
            <div className="text-xs text-muted-foreground mt-2">
              {formatBytes(metrics.memory.used)} / {formatBytes(metrics.memory.total)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disk Usage</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.disk.percentage.toFixed(1)}%</div>
            <Progress value={metrics.disk.percentage} className="mt-2" />
            <div className="text-xs text-muted-foreground mt-2">
              {formatBytes(metrics.disk.used)} / {formatBytes(metrics.disk.total)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Performance</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.api.requestsPerMinute}</div>
            <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
              <span>{metrics.api.averageResponseTime.toFixed(0)}ms avg</span>
              <span>{metrics.api.errorRate.toFixed(1)}% errors</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Server className="w-5 h-5 mr-2" />
              System Resources
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">CPU Usage</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm">{metrics.cpu.usage.toFixed(1)}%</span>
                {getTrendIcon(metrics.cpu.usage, 80)}
              </div>
            </div>
            <Progress value={metrics.cpu.usage} />
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Memory Usage</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm">{metrics.memory.percentage.toFixed(1)}%</span>
                {getTrendIcon(metrics.memory.percentage, 80)}
              </div>
            </div>
            <Progress value={metrics.memory.percentage} />
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Disk Usage</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm">{metrics.disk.percentage.toFixed(1)}%</span>
                {getTrendIcon(metrics.disk.percentage, 80)}
              </div>
            </div>
            <Progress value={metrics.disk.percentage} />
            
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">System Uptime</span>
                <span className="text-sm">{formatUptime(metrics.uptime)}</span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm font-medium">Last Restart</span>
                <span className="text-sm">
                  {new Date(metrics.lastRestart).toLocaleDateString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="w-5 h-5 mr-2" />
              Database Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Active Connections</span>
              <span className="text-sm">{metrics.database.connections}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Average Query Time</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm">{metrics.database.queryTime.toFixed(1)}ms</span>
                {getTrendIcon(metrics.database.queryTime, 100)}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Database Size</span>
              <span className="text-sm">{formatBytes(metrics.database.size)}</span>
            </div>
            
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">API Requests/min</span>
                <span className="text-sm">{metrics.api.requestsPerMinute}</span>
              </div>
              
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm font-medium">Avg Response Time</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm">{metrics.api.averageResponseTime.toFixed(0)}ms</span>
                  {getTrendIcon(metrics.api.averageResponseTime, 500)}
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm font-medium">Error Rate</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm">{metrics.api.errorRate.toFixed(1)}%</span>
                  {getTrendIcon(metrics.api.errorRate, 1)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Health Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            System Health Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${
                systemHealth === 'healthy' ? 'bg-green-500' : 
                systemHealth === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
              }`} />
              <div>
                <div className="font-medium">Overall Health</div>
                <div className="text-sm text-muted-foreground capitalize">{systemHealth}</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${
                metrics.cpu.usage < 70 ? 'bg-green-500' : 
                metrics.cpu.usage < 90 ? 'bg-yellow-500' : 'bg-red-500'
              }`} />
              <div>
                <div className="font-medium">CPU Status</div>
                <div className="text-sm text-muted-foreground">
                  {metrics.cpu.usage < 70 ? 'Normal' : 
                   metrics.cpu.usage < 90 ? 'High' : 'Critical'}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${
                metrics.memory.percentage < 70 ? 'bg-green-500' : 
                metrics.memory.percentage < 90 ? 'bg-yellow-500' : 'bg-red-500'
              }`} />
              <div>
                <div className="font-medium">Memory Status</div>
                <div className="text-sm text-muted-foreground">
                  {metrics.memory.percentage < 70 ? 'Normal' : 
                   metrics.memory.percentage < 90 ? 'High' : 'Critical'}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}