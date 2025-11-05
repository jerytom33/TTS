'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Play, Pause, Download, Upload, Mic, Settings, Video, FileAudio, Palette, Music, Image as ImageIcon, Volume2 } from 'lucide-react'
import { Voice, VideoCreatorState, Project } from '@/types'
import { useAuth } from '@/contexts/auth-context'
import { useTranslation } from '@/contexts/translation-context'
import VideoRenderer from '@/components/video-renderer'
import AudioPlayer from '@/components/audio-player'

interface VideoCreatorProps {
  project?: Project
  onSave?: (project: Project) => void
  onCancel?: () => void
}

export default function VideoCreator({ project, onSave, onCancel }: VideoCreatorProps) {
  const { user } = useAuth()
  const { t, language } = useTranslation()
  const [state, setState] = useState<VideoCreatorState>({
    textContent: project?.textContent || '',
    selectedVoice: null,
    voiceSpeed: project?.voiceSpeed || 1.0,
    voicePitch: project?.voicePitch || 1.0,
    backgroundType: project?.backgroundType || 'COLOR',
    backgroundColor: project?.backgroundColor || '#000000',
    backgroundImageUrl: project?.backgroundImageUrl || null,
    backgroundVideoUrl: project?.backgroundVideoUrl || null,
    watermarkUrl: project?.watermarkUrl || null,
    bgmUrl: project?.bgmUrl || null,
    bgmVolume: project?.bgmVolume || 0.3,
    isGeneratingAudio: false,
    audioPreviewUrl: null,
    isRenderingVideo: false,
    renderProgress: 0
  })
  
  const [generatedAudioConfig, setGeneratedAudioConfig] = useState<any>(null)

  const [voices, setVoices] = useState<Voice[]>([])
  const [isLoadingVoices, setIsLoadingVoices] = useState(true)
  const [projectName, setProjectName] = useState(project?.name || '')
  const [projectDescription, setProjectDescription] = useState(project?.description || '')

  useEffect(() => {
    fetchVoices()
  }, [])

  const fetchVoices = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch('/api/voices', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setVoices(data.voices)
        
        // Set default voice if project has one
        if (project?.voiceId) {
          const defaultVoice = data.voices.find((v: Voice) => v.id === project.voiceId)
          if (defaultVoice) {
            setState(prev => ({ ...prev, selectedVoice: defaultVoice }))
          }
        }
      }
    } catch (error) {
      console.error('Error fetching voices:', error)
    } finally {
      setIsLoadingVoices(false)
    }
  }

  const handleGenerateAudio = async () => {
    if (!state.selectedVoice || !state.textContent.trim()) {
      return
    }

    setState(prev => ({ ...prev, isGeneratingAudio: true }))

    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch('/api/tts/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          text: state.textContent,
          voiceId: state.selectedVoice.id,
          speed: state.voiceSpeed,
          pitch: state.voicePitch,
          language: state.selectedVoice.languageCode
        })
      })

      if (response.ok) {
        const data = await response.json()
        // Store the Puter config for client-side generation
        setGeneratedAudioConfig({
          text: state.textContent,
          voiceId: state.selectedVoice?.id || 'Joanna',
          language: state.selectedVoice?.languageCode === 'ml' ? 'ml-IN' : 'en-US',
          speed: state.voiceSpeed,
          pitch: state.voicePitch
        })
        setState(prev => ({
          ...prev,
          audioPreviewUrl: 'generating', // Placeholder to show component
          isGeneratingAudio: false
        }))
      } else {
        const error = await response.json()
        console.error('Audio generation failed:', error.error)
        setState(prev => ({ ...prev, isGeneratingAudio: false }))
      }
    } catch (error) {
      console.error('Error generating audio:', error)
      setState(prev => ({ ...prev, isGeneratingAudio: false }))
    }
  }

  const handleSaveProject = async () => {
    if (!projectName.trim() || !state.textContent.trim() || !state.selectedVoice) {
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
          textContent: state.textContent,
          voiceId: state.selectedVoice.id,
          voiceSpeed: state.voiceSpeed,
          voicePitch: state.voicePitch,
          backgroundType: state.backgroundType,
          backgroundColor: state.backgroundColor,
          backgroundImageUrl: state.backgroundImageUrl,
          backgroundVideoUrl: state.backgroundVideoUrl,
          watermarkUrl: state.watermarkUrl,
          bgmUrl: state.bgmUrl,
          bgmVolume: state.bgmVolume
        })
      })

      if (response.ok) {
        const data = await response.json()
        onSave?.(data.project)
      } else {
        const error = await response.json()
        console.error('Project save failed:', error.error)
      }
    } catch (error) {
      console.error('Error saving project:', error)
    }
  }

  const filteredVoices = voices.filter(voice => 
    voice.languageCode === 'ml' || voice.languageCode === 'en'
  )

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('nav.projects', 'Projects')}</h1>
          <p className="text-muted-foreground">{t('form.text_content', 'Transform your text into professional videos')}</p>
        </div>
        <div className="flex space-x-2">
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              {t('button.cancel', 'Cancel')}
            </Button>
          )}
          <Button onClick={handleSaveProject} disabled={!projectName.trim() || !state.selectedVoice}>
            {t('button.save', 'Save')} {t('nav.projects', 'Project')}
          </Button>
        </div>
      </div>

      {/* Project Details */}
      <Card>
        <CardHeader>
          <CardTitle>{t('form.project_name', 'Project Details')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="project-name">{t('form.project_name', 'Project Name')} *</Label>
            <Input
              id="project-name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder={t('form.project_name', 'Enter project name...')}
            />
          </div>
          <div>
            <Label htmlFor="project-description">{t('form.description', 'Description')}</Label>
            <Textarea
              id="project-description"
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              placeholder={t('form.description', 'Optional project description...')}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Text Input */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileAudio className="w-5 h-5 mr-2" />
              {t('form.text_content', 'Text Content')}
            </CardTitle>
            <CardDescription>
              {t('form.text_content', 'Enter the text you want to convert to speech')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={state.textContent}
              onChange={(e) => setState(prev => ({ ...prev, textContent: e.target.value }))}
              placeholder={t('form.text_content', 'Enter your text here...')}
              rows={8}
              className="min-h-[200px]"
            />
            <div className="mt-2 text-sm text-muted-foreground">
              {state.textContent.length} / 10,000 {t('form.text_content', 'characters')}
            </div>
          </CardContent>
        </Card>

        {/* Voice Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mic className="w-5 h-5 mr-2" />
              {t('form.voice_settings', 'Voice Settings')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>{t('form.select_voice', 'Select Voice')} *</Label>
              <Select 
                value={state.selectedVoice?.id || ''} 
                onValueChange={(value) => {
                  const voice = voices.find(v => v.id === value)
                  setState(prev => ({ ...prev, selectedVoice: voice }))
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('form.select_voice', 'Choose a voice...')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="" disabled>{t('form.select_voice', 'Select a voice')}</SelectItem>
                  {filteredVoices.map((voice) => (
                    <SelectItem key={voice.id} value={voice.id}>
                      <div className="flex items-center space-x-2">
                        <span>{voice.displayName}</span>
                        <Badge variant="outline" className="text-xs">
                          {voice.languageName}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {voice.gender}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>{t('form.voice_speed', 'Speed')}: {state.voiceSpeed.toFixed(1)}x</Label>
              <Slider
                value={[state.voiceSpeed]}
                onValueChange={([value]) => setState(prev => ({ ...prev, voiceSpeed: value }))}
                min={0.5}
                max={2.0}
                step={0.1}
                className="mt-2"
              />
            </div>

            <div>
              <Label>{t('form.voice_pitch', 'Pitch')}: {state.voicePitch.toFixed(1)}x</Label>
              <Slider
                value={[state.voicePitch]}
                onValueChange={([value]) => setState(prev => ({ ...prev, voicePitch: value }))}
                min={0.5}
                max={2.0}
                step={0.1}
                className="mt-2"
              />
            </div>

            <Button 
              onClick={handleGenerateAudio}
              disabled={!state.selectedVoice || !state.textContent.trim() || state.isGeneratingAudio}
              className="w-full"
            >
              {state.isGeneratingAudio ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  {t('status.processing', 'Generating...')}
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  {t('button.generate_audio', 'Generate Audio')}
                </>
              )}
            </Button>

            {state.audioPreviewUrl && (
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
                    // Download will be available once audio is generated
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
      </div>

      {/* Video Renderer */}
      <VideoRenderer 
        projectId={project?.id || ''}
        onVideoGenerated={(video) => {
          console.log('Video generated:', video)
        }}
      />
    </div>
  )
}