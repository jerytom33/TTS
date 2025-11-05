'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Plus, Search, Edit, Trash2, Mic } from 'lucide-react'
import { Project } from '@/types'
import AudioPlayer from '@/components/audio-player'
import TTSCreator from '@/features/tts-creator/tts-creator-i18n'

export default function ProjectDashboard() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [isCreatingNew, setIsCreatingNew] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    fetch('/api/projects', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setProjects(d.projects))
      .catch(e => console.error(e))
      .finally(() => setIsLoading(false))
  }, [])

  if (selectedProject || isCreatingNew) {
    return (
      <TTSCreator
        project={selectedProject || undefined}
        onSave={(p) => {
          setProjects(prev => isCreatingNew ? [p, ...prev] : prev.map(x => x.id === p.id ? p : x))
          setSelectedProject(null)
          setIsCreatingNew(false)
        }}
        onCancel={() => { setSelectedProject(null); setIsCreatingNew(false) }}
      />
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">TTS Projects</h1>
        <Button onClick={() => setIsCreatingNew(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading projects...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-12 space-y-4">
          <Mic className="w-12 h-12 mx-auto text-muted-foreground" />
          <div>
            <h3 className="text-lg font-semibold mb-2">No Projects Yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first TTS project to get started
            </p>
            <Button onClick={() => setIsCreatingNew(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Project
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(p => (
            <Card key={p.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="line-clamp-1">{p.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {p.textContent}
                </p>
                <AudioPlayer
                  title="Voice Preview"
                  showDownload
                  puterConfig={{
                    text: p.textContent.slice(0, 200),
                    voiceId: p.voiceId,
                    language: 'en-US',
                    speed: p.voiceSpeed,
                    pitch: p.voicePitch
                  }}
                />
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setSelectedProject(p)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Project
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

