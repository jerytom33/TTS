'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Play, Pause, Volume2, VolumeX, Download, Loader2 } from 'lucide-react'

interface AudioPlayerProps {
  audioUrl?: string | null
  title?: string
  showDownload?: boolean
  onDownload?: () => void
  className?: string
  // For client-side generation
  puterConfig?: {
    text: string
    voiceId: string
    language: string
    speed?: number
    pitch?: number
  }
}

export default function AudioPlayer({
  audioUrl,
  title,
  showDownload = true,
  onDownload,
  className = '',
  puterConfig
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(audioUrl || null)

  // Generate audio using Puter.js if no URL provided but config is given
  useEffect(() => {
    const generateAudio = async () => {
      if (!puterConfig || generatedUrl) return
      
      setIsLoading(true)
      setError(null)
      
      try {
        console.log('🎤 Generating audio with Puter.js...', puterConfig)
        
        if (typeof window === 'undefined') {
          throw new Error('Puter.js not available')
        }
        
        const puterAi = (window as any).puter?.ai
        if (!puterAi || !puterAi.txt2speech) {
          throw new Error('Puter.js TTS not available')
        }
        
        // Generate audio using Puter.js
        const audioElement = await puterAi.txt2speech(puterConfig.text, {
          language: puterConfig.language || 'en-US',
          voice: puterConfig.voiceId,
          engine: 'neural',
          provider: 'aws-polly'
        })
        
        if (audioElement?.src) {
          console.log('✅ Audio generated successfully')
          setGeneratedUrl(audioElement.src)
        } else {
          throw new Error('No audio source generated')
        }
      } catch (err) {
        console.error('❌ Puter.js audio generation failed:', err)
        setError(`Failed to generate audio: ${err instanceof Error ? err.message : 'Unknown error'}`)
        setIsLoading(false)
      }
    }
    
    if (puterConfig) {
      generateAudio()
    }
  }, [puterConfig, generatedUrl])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleLoadedMetadata = () => {
      setDuration(audio.duration)
      setIsLoading(false)
    }

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
    }

    const handleEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
    }

    const handleError = () => {
      setError('Failed to load audio')
      setIsLoading(false)
    }

    const handleCanPlay = () => {
      setError(null)
    }

    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('error', handleError)
    audio.addEventListener('canplay', handleCanPlay)

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('error', handleError)
      audio.removeEventListener('canplay', handleCanPlay)
    }
  }, [])

  const handlePlayPause = async () => {
    const audio = audioRef.current
    if (!audio) return

    try {
      if (isPlaying) {
        audio.pause()
        setIsPlaying(false)
      } else {
        if (!audio.src) {
          setError('Audio source is not available')
          return
        }
        setIsLoading(true)
        await audio.play()
        setIsPlaying(true)
      }
    } catch (err) {
      setError('Failed to play audio')
      setIsPlaying(false)
      console.error('Playback error:', err)
    }
  }

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0]
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }
  }

  const handleProgressChange = (value: number[]) => {
    const newTime = value[0]
    setCurrentTime(newTime)
    if (audioRef.current) {
      audioRef.current.currentTime = newTime
    }
  }

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return '0:00'
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div className={`space-y-3 p-4 bg-muted rounded-lg ${className}`}>
      {/* Audio Element */}
      <audio ref={audioRef} src={generatedUrl || undefined} />

      {/* Title */}
      {title && (
        <div className="text-sm font-medium text-foreground line-clamp-1">
          {title}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="text-xs text-red-500 bg-red-50 dark:bg-red-950 p-2 rounded">
          {error}
        </div>
      )}

      {/* Player Controls */}
      <div className="flex items-center gap-3">
        {/* Play/Pause Button */}
        <Button
          size="sm"
          variant="ghost"
          onClick={handlePlayPause}
          disabled={(!generatedUrl && !audioUrl) || isLoading}
          className="h-8 w-8 p-0"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>

        {/* Progress Bar */}
        <div className="flex-1 flex items-center gap-2">
          <span className="text-xs text-muted-foreground w-8 text-right">
            {formatTime(currentTime)}
          </span>
          <Slider
            value={[currentTime]}
            max={duration || 0}
            step={0.1}
            onValueChange={handleProgressChange}
            className="flex-1"
            disabled={!generatedUrl || duration === 0}
          />
          <span className="text-xs text-muted-foreground w-8">
            {formatTime(duration)}
          </span>
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-2">
          {volume === 0 ? (
            <VolumeX className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Volume2 className="h-4 w-4 text-muted-foreground" />
          )}
          <Slider
            value={[volume]}
            max={1}
            step={0.01}
            onValueChange={handleVolumeChange}
            className="w-20"
          />
        </div>

        {/* Download Button */}
        {showDownload && onDownload && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onDownload}
            disabled={!generatedUrl}
            className="h-8 w-8 p-0"
            title="Download audio"
          >
            <Download className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Time Display Fallback */}
      {duration > 0 && (
        <div className="text-xs text-muted-foreground text-center">
          Total duration: {formatTime(duration)}
        </div>
      )}
    </div>
  )
}
