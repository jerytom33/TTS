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
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Play, Pause, Download, Upload, Mic, Settings, Video, FileAudio, Palette, Music, Image as ImageIcon, Cloud, CloudOff, Zap } from 'lucide-react'
import { Voice, VideoCreatorState, Project } from '@/types'
import { useAuth } from '@/contexts/auth-context'
import { usePuter, usePuterStatus, usePuterFallback } from '@/contexts/puter-context'

interface VideoCreatorProps {
  project?: Project
  onSave?: (project: Project) => void
  onCancel?: () => void
}

export default function VideoCreator({ project, onSave, onCancel }: VideoCreatorProps) {
  const { user } = useAuth()
  const { 
    generateAIChat, 
    generateTextToSpeech, 
    generateImage, 
    saveFile,
    isConnected: puterConnected 
  } = usePuter()
  const { isReady: puterReady, status: puterStatus } = usePuterStatus()
  const { getVoiceProfiles, getVideoStyles, getMalayalamPhrases, getEnglishPhrases } = usePuterFallback()
  
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

  const [voices, setVoices] = useState<Voice[]>([])
  const [isLoadingVoices, setIsLoadingVoices] = useState(true)
  const [projectName, setProjectName] = useState(project?.name || '')
  const [projectDescription, setProjectDescription] = useState(project?.description || '')
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([])
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)
  const [usePuterAI, setUsePuterAI] = useState(true)

  useEffect(() => {
    fetchVoices()
    loadFallbackVoices()
  }, [])

  useEffect(() => {
    // Auto-generate content suggestions when text changes
    if (state.textContent.length > 50 && puterReady && usePuterAI) {
      generateContentSuggestions()
    }
  }, [state.textContent, puterReady, usePuterAI])

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
      // Fallback to Puter voices if API fails
      loadFallbackVoices()
    } finally {
      setIsLoadingVoices(false)
    }
  }

  const loadFallbackVoices = () => {
    try {
      const puterVoices = getVoiceProfiles()
      if (puterVoices && puterVoices.length > 0) {
        const convertedVoices: Voice[] = puterVoices.map((pv: any) => ({
          id: pv.id,
          displayName: pv.name,
          languageCode: pv.language.toLowerCase() === 'malayalam' ? 'ml' : 'en',
          languageName: pv.language,
          gender: pv.gender,
          isActive: true
        }))
        
        setVoices(prev => {
          // Merge with existing voices, avoiding duplicates
          const existingIds = prev.map(v => v.id)
          const newVoices = convertedVoices.filter(v => !existingIds.includes(v.id))
          return [...prev, ...newVoices]
        })
      }
    } catch (error) {
      console.error('Error loading fallback voices:', error)
    }
  }

  const generateContentSuggestions = async () => {
    if (isLoadingSuggestions) return
    
    setIsLoadingSuggestions(true)
    try {
      const prompt = `Based on this text content: "${state.textContent.substring(0, 200)}...", suggest 3 short improvements or variations for better video content. Keep suggestions concise and actionable.`
      
      const suggestions = await generateAIChat(prompt, {
        model: 'gpt-5-nano',
        max_tokens: 200
      })
      
      // Parse suggestions from AI response
      const suggestionsList = suggestions.split('\n')
        .filter(line => line.trim().length > 0)
        .slice(0, 3)
        .map(line => line.replace(/^\d+\.?\s*/, '').trim())
      
      setAiSuggestions(suggestionsList)
    } catch (error) {
      console.warn('Failed to generate AI suggestions:', error)
      // Use fallback suggestions
      const fallbackSuggestions = [
        "Consider adding more descriptive language for better engagement",
        "Break longer sentences into shorter, more impactful phrases",
        "Add a clear call-to-action at the end of your content"
      ]
      setAiSuggestions(fallbackSuggestions)
    } finally {
      setIsLoadingSuggestions(false)
    }
  }

  const handleGenerateAudio = async () => {
    if (!state.selectedVoice || !state.textContent.trim()) {
      return
    }

    setState(prev => ({ ...prev, isGeneratingAudio: true }))

    try {
      let audioUrl: string | null = null

      // Try Puter.js TTS first if available and enabled
      if (puterReady && usePuterAI) {
        console.log('🎤 Generating TTS with Puter.js...')
        try {
          const puterAudio = await generateTextToSpeech(state.textContent, {
            language: state.selectedVoice.languageCode === 'ml' ? 'ml-IN' : 'en-US',
            voice: state.selectedVoice.displayName,
            provider: 'aws-polly',
            engine: 'neural'
          })
          
          if (puterAudio instanceof HTMLAudioElement) {
            audioUrl = puterAudio.src
            console.log('✅ Puter.js TTS successful')
            
            // Save to Puter filesystem for later access
            const filename = `tts_${Date.now()}.mp3`
            await saveFile(filename, puterAudio.src)
          }
        } catch (puterError) {
          console.warn('⚠️ Puter TTS failed, falling back to API:', puterError)
        }
      }

      // Fallback to original API if Puter failed or not available
      if (!audioUrl) {
        console.log('🔄 Using fallback TTS API...')
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
          audioUrl = data.audioUrl
          console.log('✅ Fallback TTS successful')
        } else {
          const error = await response.json()
          console.error('❌ Audio generation failed:', error.error)
          throw new Error(error.error)
        }
      }

      setState(prev => ({
        ...prev,
        audioPreviewUrl: audioUrl,
        isGeneratingAudio: false
      }))

    } catch (error) {
      console.error('Error generating audio:', error)
      setState(prev => ({ ...prev, isGeneratingAudio: false }))
      
      // Show fallback message
      const fallbackMessage = state.selectedVoice.languageCode === 'ml' ? 
        getMalayalamPhrases()?.common_phrases?.[0] || "ക്ഷമിക്കണം, ഓഡിയോ ജനറേറ്റ് ചെയ്യാൻ കഴിയുന്നില്ല" :
        getEnglishPhrases()?.common_phrases?.[0] || "Sorry, unable to generate audio at this time"
      
      // You could show this message to the user via a toast or alert
      console.log('Fallback message:', fallbackMessage)
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

  const handleRenderVideo = async () => {
    if (!state.audioPreviewUrl) {
      return
    }

    setState(prev => ({ ...prev, isRenderingVideo: true, renderProgress: 0 }))

    // Simulate video rendering progress
    const progressInterval = setInterval(() => {
      setState(prev => {
        const newProgress = Math.min(prev.renderProgress + 10, 90)
        return { ...prev, renderProgress: newProgress }
      })
    }, 500)

    // Simulate video completion
    setTimeout(() => {
      clearInterval(progressInterval)
      setState(prev => ({ ...prev, isRenderingVideo: false, renderProgress: 100 }))
    }, 5000)
  }

  const filteredVoices = voices.filter(voice => 
    voice.languageCode === 'ml' || voice.languageCode === 'en'
  )

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Video Creator</h1>
          <p className="text-muted-foreground">Transform your text into professional videos</p>
          
          {/* Puter Status Indicator */}
          <div className="flex items-center space-x-2 mt-2">
            <Badge variant={puterReady ? "default" : "secondary"} className="text-xs">
              {puterReady ? (
                <>
                  <Cloud className="w-3 h-3 mr-1" />
                  Puter AI Connected
                </>
              ) : (
                <>
                  <CloudOff className="w-3 h-3 mr-1" />
                  Offline Mode
                </>
              )}
            </Badge>
            
            <Badge variant="outline" className="text-xs">
              Status: {puterStatus}
            </Badge>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setUsePuterAI(!usePuterAI)}
              className="h-6 px-2 text-xs"
            >
              <Zap className="w-3 h-3 mr-1" />
              AI {usePuterAI ? 'ON' : 'OFF'}
            </Button>
          </div>
        </div>
        <div className="flex space-x-2">
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button onClick={handleSaveProject} disabled={!projectName.trim() || !state.selectedVoice}>
            Save Project
          </Button>
        </div>
      </div>

      {/* Project Details */}
      <Card>
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="project-name">Project Name *</Label>
            <Input
              id="project-name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Enter project name..."
            />
          </div>
          <div>
            <Label htmlFor="project-description">Description</Label>
            <Textarea
              id="project-description"
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              placeholder="Optional project description..."
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
              Text Content
            </CardTitle>
            <CardDescription>
              Enter the text you want to convert to speech
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={state.textContent}
              onChange={(e) => setState(prev => ({ ...prev, textContent: e.target.value }))}
              placeholder="Enter your text here..."
              rows={8}
              className="min-h-[200px]"
            />
            <div className="mt-2 text-sm text-muted-foreground">
              {state.textContent.length} / 10,000 characters
            </div>
            
            {/* AI Suggestions Panel */}
            {usePuterAI && aiSuggestions.length > 0 && (
              <Alert className="mt-4">
                <Zap className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-medium mb-2">AI Suggestions:</div>
                  <ul className="space-y-1 text-sm">
                    {aiSuggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-primary mr-2">•</span>
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="mt-2 h-7 px-2 text-xs"
                    onClick={generateContentSuggestions}
                    disabled={isLoadingSuggestions}
                  >
                    {isLoadingSuggestions ? 'Generating...' : 'Refresh Suggestions'}
                  </Button>
                </AlertDescription>
              </Alert>
            )}
            
            {/* Quick Text Templates */}
            {state.textContent.length === 0 && (
              <div className="mt-4">
                <Label className="text-sm font-medium">Quick Start Templates:</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setState(prev => ({ ...prev, textContent: getMalayalamPhrases()?.greetings?.[0] || 'നമസ്കാരം! ഞാൻ നിങ്ങളുടെ വോയ്‌സ് അസിസ്റ്റന്റ് ആണ്.' }))}
                  >
                    Malayalam Greeting
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setState(prev => ({ ...prev, textContent: getEnglishPhrases()?.greetings?.[0] || 'Hello! I\'m your voice assistant.' }))}
                  >
                    English Greeting
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Voice Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mic className="w-5 h-5 mr-2" />
              Voice Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Select Voice *</Label>
              <Select 
                value={state.selectedVoice?.id || ''} 
                onValueChange={(value) => {
                  const voice = voices.find(v => v.id === value)
                  setState(prev => ({ ...prev, selectedVoice: voice }))
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a voice..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="" disabled>Select a voice</SelectItem>
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
              <Label>Speed: {state.voiceSpeed.toFixed(1)}x</Label>
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
              <Label>Pitch: {state.voicePitch.toFixed(1)}x</Label>
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
                  Generating...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Generate Audio
                </>
              )}
            </Button>

            {state.audioPreviewUrl && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  ✓ Audio generated successfully
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Visual Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Palette className="w-5 h-5 mr-2" />
            Visual Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={state.backgroundType} onValueChange={(value) => setState(prev => ({ ...prev, backgroundType: value as any }))}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="COLOR">Color</TabsTrigger>
              <TabsTrigger value="IMAGE">Image</TabsTrigger>
              <TabsTrigger value="VIDEO">Video</TabsTrigger>
              <TabsTrigger value="SLIDESHOW">Slideshow</TabsTrigger>
            </TabsList>
            
            <TabsContent value="COLOR" className="space-y-4">
              <div>
                <Label>Background Color</Label>
                <div className="flex space-x-2 mt-2">
                  <Input
                    type="color"
                    value={state.backgroundColor}
                    onChange={(e) => setState(prev => ({ ...prev, backgroundColor: e.target.value }))}
                    className="w-20 h-10"
                  />
                  <Input
                    value={state.backgroundColor}
                    onChange={(e) => setState(prev => ({ ...prev, backgroundColor: e.target.value }))}
                    placeholder="#000000"
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="IMAGE" className="space-y-4">
              <div>
                <Label>Background Image URL</Label>
                <Input
                  value={state.backgroundImageUrl || ''}
                  onChange={(e) => setState(prev => ({ ...prev, backgroundImageUrl: e.target.value }))}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              
              {/* AI Image Generation */}
              {puterReady && usePuterAI && (
                <div className="p-4 border rounded-lg bg-muted/50">
                  <Label className="font-medium">Generate AI Background</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Create a custom background image using AI based on your content
                  </p>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={async () => {
                        try {
                          const prompt = `Professional background for ${state.selectedVoice?.languageCode === 'ml' ? 'Malayalam' : 'English'} video content, minimalist design, suitable for text overlay`
                          const image = await generateImage(prompt, { quality: 'low' })
                          if (typeof image === 'string') {
                            setState(prev => ({ ...prev, backgroundImageUrl: image }))
                          } else if (image instanceof HTMLImageElement) {
                            setState(prev => ({ ...prev, backgroundImageUrl: image.src }))
                          }
                        } catch (error) {
                          console.error('Image generation failed:', error)
                        }
                      }}
                    >
                      <ImageIcon className="w-4 h-4 mr-2" />
                      Generate Professional
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={async () => {
                        try {
                          const prompt = `Abstract colorful gradient background, modern design, ${state.backgroundColor} color theme`
                          const image = await generateImage(prompt, { quality: 'low' })
                          if (typeof image === 'string') {
                            setState(prev => ({ ...prev, backgroundImageUrl: image }))
                          } else if (image instanceof HTMLImageElement) {
                            setState(prev => ({ ...prev, backgroundImageUrl: image.src }))
                          }
                        } catch (error) {
                          console.error('Image generation failed:', error)
                        }
                      }}
                    >
                      <Palette className="w-4 h-4 mr-2" />
                      Generate Abstract
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="VIDEO" className="space-y-4">
              <div>
                <Label>Background Video URL</Label>
                <Input
                  value={state.backgroundVideoUrl || ''}
                  onChange={(e) => setState(prev => ({ ...prev, backgroundVideoUrl: e.target.value }))}
                  placeholder="https://example.com/video.mp4"
                />
              </div>
            </TabsContent>
            
            <TabsContent value="SLIDESHOW" className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Slideshow feature coming soon - upload multiple images for a dynamic background
              </p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Audio Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Music className="w-5 h-5 mr-2" />
            Audio Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Background Music URL</Label>
            <Input
              value={state.bgmUrl || ''}
              onChange={(e) => setState(prev => ({ ...prev, bgmUrl: e.target.value }))}
              placeholder="https://example.com/music.mp3"
            />
          </div>
          
          {state.bgmUrl && (
            <div>
              <Label>Music Volume: {Math.round(state.bgmVolume * 100)}%</Label>
              <Slider
                value={[state.bgmVolume]}
                onValueChange={([value]) => setState(prev => ({ ...prev, bgmVolume: value }))}
                min={0}
                max={1}
                step={0.1}
                className="mt-2"
              />
            </div>
          )}

          <div>
            <Label>Watermark URL</Label>
            <Input
              value={state.watermarkUrl || ''}
              onChange={(e) => setState(prev => ({ ...prev, watermarkUrl: e.target.value }))}
              placeholder="https://example.com/watermark.png"
            />
          </div>
        </CardContent>
      </Card>

      {/* Video Generation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Video className="w-5 h-5 mr-2" />
            Generate Video
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!state.audioPreviewUrl ? (
            <p className="text-sm text-muted-foreground">
              Generate audio first before creating a video
            </p>
          ) : (
            <>
              <Button 
                onClick={handleRenderVideo}
                disabled={state.isRenderingVideo}
                className="w-full"
                size="lg"
              >
                {state.isRenderingVideo ? (
                  <>Rendering Video...</>
                ) : (
                  <>
                    <Video className="w-4 h-4 mr-2" />
                    Render Video
                  </>
                )}
              </Button>

              {state.isRenderingVideo && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Rendering progress</span>
                    <span>{state.renderProgress}%</span>
                  </div>
                  <Progress value={state.renderProgress} />
                </div>
              )}

              {state.renderProgress === 100 && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">
                    ✓ Video rendered successfully!
                  </p>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Download Video
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}