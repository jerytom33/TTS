'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Plus, Search, Video, Play, Download, MoreHorizontal, Edit, Trash2, Copy, Clock, CheckCircle, XCircle, Volume2 } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Project, GeneratedVideo } from '@/types'
import { useAuth } from '@/contexts/auth-context'
import { useTranslation } from '@/contexts/translation-context'
import VideoCreator from '@/features/video-creator/video-creator-i18n'
import AudioPlayer from '@/components/audio-player'

// Extended type that includes generatedVideos from API response
type ProjectWithVideos = Project & {
  generatedVideos: GeneratedVideo[]
}

export default function ProjectDashboard() {
  const { user } = useAuth()
  const { t, language } = useTranslation()
  const [projects, setProjects] = useState<ProjectWithVideos[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProject, setSelectedProject] = useState<ProjectWithVideos | null>(null)
  const [isCreatingNew, setIsCreatingNew] = useState(false)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch('/api/projects', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setProjects(data.projects)
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return <Badge variant="secondary">{t('status.draft', 'Draft')}</Badge>
      case 'PROCESSING':
        return <Badge variant="default">{t('status.processing', 'Processing')}</Badge>
      case 'COMPLETED':
        return <Badge className="bg-green-500">{t('status.completed', 'Completed')}</Badge>
      case 'FAILED':
        return <Badge variant="destructive">{t('status.failed', 'Failed')}</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getVideoStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />{t('status.pending', 'Pending')}</Badge>
      case 'PROCESSING':
        return <Badge variant="default"><Play className="w-3 h-3 mr-1" />{t('status.processing', 'Processing')}</Badge>
      case 'COMPLETED':
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />{t('status.completed', 'Completed')}</Badge>
      case 'FAILED':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />{t('status.failed', 'Failed')}</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDate = (date: Date | string) => {
    return new Intl.DateTimeFormat(language === 'ml' ? 'ml-IN' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date))
  }

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm(t('confirm.delete_project', 'Are you sure you want to delete this project?'))) {
      return
    }

    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`/api/projects/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ projectId })
      })

      if (response.ok) {
        setProjects(prev => prev.filter(p => p.id !== projectId))
      }
    } catch (error) {
      console.error('Error deleting project:', error)
    }
  }

  const handleDuplicateProject = async (project: Project) => {
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch('/api/projects/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: `${project.name} (Copy)`,
          description: project.description,
          textContent: project.textContent,
          voiceId: project.voiceId,
          voiceSpeed: project.voiceSpeed,
          voicePitch: project.voicePitch,
          backgroundType: project.backgroundType,
          backgroundColor: project.backgroundColor,
          backgroundImageUrl: project.backgroundImageUrl,
          backgroundVideoUrl: project.backgroundVideoUrl,
          watermarkUrl: project.watermarkUrl,
          bgmUrl: project.bgmUrl,
          bgmVolume: project.bgmVolume
        })
      })

      if (response.ok) {
        const data = await response.json()
        setProjects(prev => [data.project, ...prev])
      }
    } catch (error) {
      console.error('Error duplicating project:', error)
    }
  }

  if (selectedProject || isCreatingNew) {
    return (
      <VideoCreator
        project={selectedProject || undefined}
        onSave={(savedProject) => {
          if (isCreatingNew) {
            setProjects(prev => [{ ...savedProject, generatedVideos: [] }, ...prev])
          } else {
            setProjects(prev => prev.map(p => p.id === savedProject.id ? { ...savedProject, generatedVideos: p.generatedVideos } : p))
          }
          setSelectedProject(null)
          setIsCreatingNew(false)
        }}
        onCancel={() => {
          setSelectedProject(null)
          setIsCreatingNew(false)
        }}
      />
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('nav.dashboard', 'Project Dashboard')}</h1>
          <p className="text-muted-foreground">{t('dashboard.description', 'Manage your video projects')}</p>
        </div>
        <Button onClick={() => setIsCreatingNew(true)}>
          <Plus className="w-4 h-4 mr-2" />
          {t('button.create_project', 'New Project')}
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder={t('search.projects', 'Search projects...')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Video className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{projects.length}</p>
                <p className="text-sm text-muted-foreground">{t('stats.total_projects', 'Total Projects')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">
                  {projects.filter(p => p.status === 'COMPLETED').length}
                </p>
                <p className="text-sm text-muted-foreground">{t('stats.completed', 'Completed')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Play className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">
                  {projects.filter(p => p.status === 'PROCESSING').length}
                </p>
                <p className="text-sm text-muted-foreground">{t('stats.processing', 'Processing')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-2xl font-bold">
                  {projects.filter(p => p.status === 'DRAFT').length}
                </p>
                <p className="text-sm text-muted-foreground">{t('stats.drafts', 'Drafts')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <p>{t('loading.projects', 'Loading projects...')}</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          <Video className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">{t('no_projects.title', 'No projects found')}</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery ? t('no_projects.search', 'Try adjusting your search terms') : t('no_projects.create', 'Create your first project to get started')}
          </p>
          {!searchQuery && (
            <Button onClick={() => setIsCreatingNew(true)}>
              <Plus className="w-4 h-4 mr-2" />
              {t('button.create_project', 'Create Project')}
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-1">{project.name}</CardTitle>
                    <CardDescription className="line-clamp-2 mt-1">
                      {project.description || t('project.no_description', 'No description')}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setSelectedProject(project)}>
                        <Edit className="w-4 h-4 mr-2" />
                        {t('button.edit', 'Edit')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicateProject(project)}>
                        <Copy className="w-4 h-4 mr-2" />
                        {t('button.duplicate', 'Duplicate')}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleDeleteProject(project.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        {t('button.delete', 'Delete')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  {getStatusBadge(project.status)}
                  <span className="text-sm text-muted-foreground">
                    {formatDate(project.updatedAt)}
                  </span>
                </div>

                <div className="text-sm">
                  <p className="font-medium mb-1">{t('project.content_preview', 'Content Preview')}:</p>
                  <p className="text-muted-foreground line-clamp-3">
                    {project.textContent}
                  </p>
                </div>

                {/* Audio Player */}
                <div className="space-y-2">
                  <p className="text-sm font-medium flex items-center gap-2">
                    <Volume2 className="w-4 h-4" />
                    {t('project.voice_preview', 'Voice Preview')}
                  </p>
                  <AudioPlayer
                    audioUrl={`/api/tts/generate?text=${encodeURIComponent(project.textContent.substring(0, 200))}&voiceId=${project.voiceId}&preview=true`}
                    title={`${project.name} - Sample`}
                    showDownload={false}
                    className="bg-blue-50 dark:bg-blue-950/30"
                  />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {project.textContent.length} {t('project.characters', 'characters')}
                  </span>
                  <span className="text-muted-foreground">
                    {project.generatedVideos.length} {t('project.videos', 'video')}{project.generatedVideos.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {project.generatedVideos.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">{t('project.recent_videos', 'Recent Videos')}:</p>
                    {project.generatedVideos.slice(0, 2).map((video) => (
                      <div key={video.id} className="flex items-center justify-between p-2 bg-muted rounded">
                        <div className="flex items-center space-x-2">
                          {getVideoStatusBadge(video.status)}
                          <span className="text-sm">{video.quality}</span>
                        </div>
                        {video.status === 'COMPLETED' && video.videoUrl && (
                          <Button variant="outline" size="sm">
                            <Download className="w-3 h-3 mr-1" />
                            {t('button.download', 'Download')}
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => setSelectedProject(project)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    {t('button.edit', 'Edit')}
                  </Button>
                  {project.generatedVideos.some(v => v.status === 'COMPLETED') && (
                    <Button size="sm" className="flex-1">
                      <Play className="w-4 h-4 mr-2" />
                      {t('button.play', 'Play')}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}