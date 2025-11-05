'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  Video, 
  Download, 
  Play, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Loader2,
  RefreshCw
} from 'lucide-react'
import { GeneratedVideo, RenderQueue } from '@/types'

interface VideoRendererProps {
  projectId: string
  onVideoGenerated?: (video: GeneratedVideo) => void
}

export default function VideoRenderer({ projectId, onVideoGenerated }: VideoRendererProps) {
  const [renderJob, setRenderJob] = useState<RenderQueue | null>(null)
  const [generatedVideo, setGeneratedVideo] = useState<GeneratedVideo | null>(null)
  const [isRendering, setIsRendering] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkRenderStatus()
    const interval = setInterval(checkRenderStatus, 3000) // Check every 3 seconds
    return () => clearInterval(interval)
  }, [projectId])

  const checkRenderStatus = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`/api/video/status?projectId=${projectId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setRenderJob(data.renderJob)
        setGeneratedVideo(data.generatedVideo)
        
        if (data.generatedVideo?.status === 'COMPLETED') {
          setIsRendering(false)
          onVideoGenerated?.(data.generatedVideo)
        }
      }
    } catch (error) {
      console.error('Error checking render status:', error)
    }
  }

  const startRendering = async () => {
    try {
      setIsRendering(true)
      setError(null)

      const token = localStorage.getItem('auth_token')
      const response = await fetch('/api/video/render', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          projectId,
          quality: '1080p',
          backgroundType: 'COLOR',
          backgroundColor: '#000000'
        })
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Render job started:', data.queueId)
        
        // Start processing the job
        setTimeout(() => {
          triggerWorker()
        }, 1000)
      } else {
        const errorData = await response.json()
        setError(errorData.error)
        setIsRendering(false)
      }
    } catch (error) {
      console.error('Error starting render:', error)
      setError('Failed to start video rendering')
      setIsRendering(false)
    }
  }

  const triggerWorker = async () => {
    try {
      await fetch('/api/worker/process', {
        method: 'POST'
      })
    } catch (error) {
      console.error('Error triggering worker:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>
      case 'PROCESSING':
        return <Badge className="bg-blue-500"><Loader2 className="w-3 h-3 mr-1 animate-spin" />Processing</Badge>
      case 'COMPLETED':
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>
      case 'FAILED':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getProgressPercentage = () => {
    if (!renderJob) return 0
    if (renderJob.status === 'COMPLETED') return 100
    if (renderJob.status === 'PROCESSING') return 50
    if (renderJob.status === 'FAILED') return 0
    return 0
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Video className="w-5 h-5 mr-2" />
          Video Rendering
        </CardTitle>
        <CardDescription>
          Generate your video from the audio and settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!renderJob && !isRendering && (
          <div className="text-center py-8">
            <Video className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              Ready to generate your video
            </p>
            <Button onClick={startRendering} size="lg">
              <Video className="w-4 h-4 mr-2" />
              Generate Video
            </Button>
          </div>
        )}

        {isRendering && !renderJob && (
          <div className="text-center py-8">
            <Loader2 className="w-12 h-12 mx-auto animate-spin text-blue-500 mb-4" />
            <p className="text-muted-foreground">Starting video generation...</p>
          </div>
        )}

        {renderJob && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status</span>
              {getStatusBadge(renderJob.status)}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Progress</span>
                <span className="text-sm">{getProgressPercentage()}%</span>
              </div>
              <Progress value={getProgressPercentage()} />
            </div>

            {renderJob.status === 'PROCESSING' && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Video is being rendered...</span>
              </div>
            )}

            {renderJob.status === 'FAILED' && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <p className="text-sm text-red-800 dark:text-red-200">
                  {renderJob.errorMessage || 'Video rendering failed'}
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={startRendering}
                  className="mt-2"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry
                </Button>
              </div>
            )}

            {generatedVideo && generatedVideo.status === 'COMPLETED' && (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-800 dark:text-green-200">
                      Video Generated Successfully!
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Duration:</span>
                      <div className="font-medium">
                        {generatedVideo.duration ? formatDuration(generatedVideo.duration) : 'N/A'}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">File Size:</span>
                      <div className="font-medium">
                        {generatedVideo.fileSize ? formatFileSize(generatedVideo.fileSize) : 'N/A'}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Quality:</span>
                      <div className="font-medium">{generatedVideo.quality}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Completed:</span>
                      <div className="font-medium">
                        {generatedVideo.completedAt ? 
                          new Intl.DateTimeFormat('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }).format(new Date(generatedVideo.completedAt)) : 
                          'N/A'
                        }
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button className="flex-1">
                    <Play className="w-4 h-4 mr-2" />
                    Play Video
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}