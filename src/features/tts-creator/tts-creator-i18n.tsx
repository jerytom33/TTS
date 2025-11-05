'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, ChevronLeft, Play, AlertTriangle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Project, Voice } from '@/types'
import { useAuth } from '@/contexts/auth-context'
import { useTranslation } from '@/contexts/translation-context'
import AudioPlayer from '@/components/audio-player'

interface TTSCreatorProps {
  project?: Project
  onSave?: (project: Project) => void
  onCancel?: () => void
}

export default function TTSCreator({ project, onSave, onCancel }: TTSCreatorProps) {
  const { user } = useAuth()
  const { t, language } = useTranslation()
  const [voices, setVoices] = useState<Voice[]>([])
  const [isLoadingVoices, setIsLoadingVoices] = useState(true)
  const [projectName, setProjectName] = useState(project?.name || '')
  const [projectDescription, setProjectDescription] = useState(project?.description || '')
  const [textContent, setTextContent] = useState(project?.textContent || '')
  const [selectedVoiceId, setSelectedVoiceId] = useState(project?.voiceId || '')
  const [voiceSpeed, setVoiceSpeed] = useState(project?.voiceSpeed || 1.0)
  const [voicePitch, setVoicePitch] = useState(project?.voicePitch || 1.0)
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false)
  const [generatedAudioConfig, setGeneratedAudioConfig] = useState(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchVoices()
  }, [])

  const fetchVoices = async () => {
    try {
      const response = await fetch('/api/voices')
      if (response.ok) {
        const data = await response.json()
        setVoices(data.voices)
      }
    } catch (err) {
      console.error('Failed to fetch voices:', err)
      setError('Failed to load available voices')
    } finally {
      setIsLoadingVoices(false)
    }
  }

  const handleGenerateAudio = async () => {
    if (!selectedVoiceId || !textContent.trim()) {
      return
    }

    setIsGeneratingAudio(true)
    setError(null)

    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch('/api/tts/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          text: textContent,
          voiceId: selectedVoiceId,
          speed: voiceSpeed,
          pitch: voicePitch,
          language: language === 'ml' ? 'ml-IN' : 'en-US'
        })
      })

      if (response.ok) {
        const data = await response.json()
        setGeneratedAudioConfig(data.puter || {
          text: textContent,
          voiceId: selectedVoiceId,
          language: language === 'ml' ? 'ml-IN' : 'en-US',
          speed: voiceSpeed,
          pitch: voicePitch
        })
      } else {
        setError('Failed to generate audio')
      }
    } catch (err) {
      console.error('Error generating audio:', err)
      setError('Failed to generate audio')
    } finally {
      setIsGeneratingAudio(false)
    }
  }

  const handleSaveProject = async () => {
    if (!projectName.trim() || !textContent.trim() || !selectedVoiceId) {
      setError(t('error.required_fields', 'Please fill in all required fields'))
      return
    }

    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch('/api/projects/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: projectName,
          description: projectDescription,
          textContent: textContent,
          voiceId: selectedVoiceId,
          voiceSpeed: voiceSpeed,
          voicePitch: voicePitch
        })
      })

      if (response.ok) {
        const data = await response.json()
        onSave?.(data.project)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to save project')
      }
    } catch (err) {
      console.error('Error saving project:', err)
      setError('Failed to save project')
    }
  }

  const selectedVoice = voices.find(v => v.id === selectedVoiceId)
  const filteredVoices = voices.filter(v => v.isActive)

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-3xl font-bold">{project ? t('button.edit', 'Edit Project') : t('button.create_project', 'New Project')}</h1>
          </div>
          <p className="text-muted-foreground ml-10">{t('tts_creator.description', 'Create high-quality audio from your text')}</p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Project Info */}
      <Card>
        <CardHeader>
          <CardTitle>{t('project.details', 'Project Details')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="project-name">{t('project.name', 'Project Name')} *</Label>
            <Input
              id="project-name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder={t('project.name_placeholder', 'Enter project name')}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="project-desc">{t('project.description', 'Description')}</Label>
            <Input
              id="project-desc"
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              placeholder={t('project.description_placeholder', 'Optional description')}
              className="mt-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Text Content */}
      <Card>
        <CardHeader>
          <CardTitle>{t('tts_creator.text_content', 'Text Content')}</CardTitle>
          <CardDescription>
            {t('tts_creator.text_description', 'Enter the text you want to convert to speech')} ({textContent.length}/5000)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={textContent}
            onChange={(e) => setTextContent(e.target.value.slice(0, 5000))}
            placeholder={t('tts_creator.text_placeholder', 'Enter your text here... (up to 5000 characters)')}
            rows={8}
            className="resize-none"
          />
        </CardContent>
      </Card>

      {/* Voice Settings */}
      <Card>
        <CardHeader>
          <CardTitle>{t('tts_creator.voice_settings', 'Voice Settings')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="voice-select">{t('tts_creator.select_voice', 'Select Voice')} *</Label>
            <Select value={selectedVoiceId} onValueChange={setSelectedVoiceId}>
              <SelectTrigger id="voice-select" className="mt-2">
                <SelectValue placeholder={t('tts_creator.choose_voice', 'Choose a voice')} />
              </SelectTrigger>
              <SelectContent>
                {isLoadingVoices ? (
                  <SelectItem value="">Loading voices...</SelectItem>
                ) : filteredVoices.length === 0 ? (
                  <SelectItem value="">No voices available</SelectItem>
                ) : (
                  filteredVoices.map(voice => (
                    <SelectItem key={voice.id} value={voice.id}>
                      <div className="flex items-center gap-2">
                        <span>{voice.displayName}</span>
                        <Badge variant="secondary" className="text-xs">
                          {voice.languageName}
                        </Badge>
                        {voice.isPremium && (
                          <Badge className="text-xs bg-amber-500">Premium</Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {selectedVoice && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>{selectedVoice.displayName}</strong> - {selectedVoice.languageName} ({selectedVoice.gender})
              </AlertDescription>
            </Alert>
          )}

          <div>
            <Label>Speed: {voiceSpeed.toFixed(1)}x</Label>
            <Slider
              value={[voiceSpeed]}
              onValueChange={([value]) => setVoiceSpeed(value)}
              min={0.5}
              max={2.0}
              step={0.1}
              className="mt-2"
            />
          </div>

          <div>
            <Label>Pitch: {voicePitch.toFixed(1)}x</Label>
            <Slider
              value={[voicePitch]}
              onValueChange={([value]) => setVoicePitch(value)}
              min={0.5}
              max={2.0}
              step={0.1}
              className="mt-2"
            />
          </div>

          <Button
            onClick={handleGenerateAudio}
            disabled={!selectedVoiceId || !textContent.trim() || isGeneratingAudio}
            className="w-full"
          >
            {isGeneratingAudio ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                {t('status.generating', 'Generating...')}
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                {t('button.generate_audio', 'Generate Audio')}
              </>
            )}
          </Button>

          {generatedAudioConfig && (
            <div className="space-y-3">
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  ✓ {t('success.audio_generated', 'Audio generated successfully')}
                </p>
              </div>

              <AudioPlayer
                title={`${projectName || 'Preview'} - Voice Preview`}
                showDownload={true}
                puterConfig={generatedAudioConfig}
                onDownload={() => {
                  const audio = document.querySelector('audio')
                  if (audio?.src) {
                    const link = document.createElement('a')
                    link.href = audio.src
                    link.download = `${projectName || 'audio'}.mp3`
                    link.click()
                  }
                }}
                className="bg-blue-50 dark:bg-blue-950/30"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <Button variant="outline" onClick={onCancel} className="flex-1">
          {t('button.cancel', 'Cancel')}
        </Button>
        <Button
          onClick={handleSaveProject}
          disabled={!projectName.trim() || !textContent.trim() || !selectedVoiceId}
          className="flex-1"
        >
          {t('button.save_project', 'Save Project')}
        </Button>
      </div>
    </div>
  )
}
