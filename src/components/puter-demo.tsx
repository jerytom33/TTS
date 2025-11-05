'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  Cloud, 
  CloudOff, 
  Zap, 
  Mic, 
  MessageSquare, 
  Image as ImageIcon, 
  FileAudio,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react'
import { usePuter, usePuterStatus, usePuterFallback } from '@/contexts/puter-context'

export default function PuterIntegrationDemo() {
  const { 
    generateAIChat, 
    generateTextToSpeech, 
    generateImage,
    saveFile,
    refreshConnection
  } = usePuter()
  
  const { isReady, status, details } = usePuterStatus()
  const { getMalayalamPhrases, getEnglishPhrases, getVoiceProfiles } = usePuterFallback()

  const [activeDemo, setActiveDemo] = useState<'chat' | 'tts' | 'image'>('chat')
  const [inputText, setInputText] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleAIChat = async () => {
    if (!inputText.trim()) return
    
    setIsProcessing(true)
    setError(null)
    setResult(null)

    try {
      const response = await generateAIChat(inputText, {
        model: 'gpt-5-nano',
        max_tokens: 150
      })
      setResult(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI Chat failed')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleTTS = async () => {
    if (!inputText.trim()) return
    
    setIsProcessing(true)
    setError(null)
    setResult(null)

    try {
      const audio = await generateTextToSpeech(inputText, {
        language: 'en-US',
        voice: 'Joanna',
        provider: 'aws-polly'
      })
      
      if (audio instanceof HTMLAudioElement) {
        setResult({ audioElement: audio, type: 'audio' })
      } else {
        setResult({ message: audio, type: 'text' })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'TTS generation failed')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleImageGeneration = async () => {
    if (!inputText.trim()) return
    
    setIsProcessing(true)
    setError(null)
    setResult(null)

    try {
      const image = await generateImage(inputText, {
        model: 'gpt-image-1-mini',
        quality: 'low'
      })
      
      if (image instanceof HTMLImageElement) {
        setResult({ imageElement: image, type: 'image' })
      } else {
        setResult({ message: image, type: 'text' })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Image generation failed')
    } finally {
      setIsProcessing(false)
    }
  }

  const StatusIndicator = ({ label, value, isGood }: { label: string, value: string, isGood: boolean }) => (
    <div className="flex items-center justify-between p-2 rounded bg-muted/50">
      <span className="text-sm font-medium">{label}:</span>
      <div className="flex items-center space-x-2">
        <Badge variant={isGood ? "default" : "secondary"} className="text-xs">
          {value}
        </Badge>
        {isGood ? (
          <CheckCircle className="w-4 h-4 text-green-500" />
        ) : (
          <AlertCircle className="w-4 h-4 text-yellow-500" />
        )}
      </div>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Puter.js Integration Demo</h1>
        <p className="text-muted-foreground">
          Experience the power of Puter.js AI services with intelligent fallbacks
        </p>
      </div>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            {isReady ? (
              <Cloud className="w-5 h-5 mr-2 text-green-500" />
            ) : (
              <CloudOff className="w-5 h-5 mr-2 text-yellow-500" />
            )}
            Puter.js Connection Status
          </CardTitle>
          <CardDescription>
            Real-time status of Puter.js services and fallback systems
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <StatusIndicator 
            label="Connection" 
            value={details.puter ? 'Connected' : 'Disconnected'} 
            isGood={details.puter} 
          />
          <StatusIndicator 
            label="Authentication" 
            value={details.auth ? 'Authenticated' : 'Not Authenticated'} 
            isGood={details.auth} 
          />
          <StatusIndicator 
            label="Initialization" 
            value={details.initialized ? 'Ready' : 'Initializing'} 
            isGood={details.initialized} 
          />
          <StatusIndicator 
            label="Overall Status" 
            value={status} 
            isGood={isReady} 
          />
          
          <div className="flex justify-between items-center pt-2">
            <Badge variant={isReady ? "default" : "outline"} className="text-xs">
              {isReady ? 'AI Services Available' : 'Fallback Mode Active'}
            </Badge>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={refreshConnection}
              className="text-xs"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Demo Interface */}
      <Card>
        <CardHeader>
          <CardTitle>AI Service Demo</CardTitle>
          <CardDescription>
            Test Puter.js AI capabilities with automatic fallback support
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeDemo} onValueChange={(value) => setActiveDemo(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="chat" className="flex items-center">
                <MessageSquare className="w-4 h-4 mr-2" />
                AI Chat
              </TabsTrigger>
              <TabsTrigger value="tts" className="flex items-center">
                <Mic className="w-4 h-4 mr-2" />
                Text-to-Speech
              </TabsTrigger>
              <TabsTrigger value="image" className="flex items-center">
                <ImageIcon className="w-4 h-4 mr-2" />
                Image Generation
              </TabsTrigger>
            </TabsList>

            <div className="mt-6 space-y-4">
              <Textarea
                placeholder={
                  activeDemo === 'chat' ? 'Ask a question or start a conversation...' :
                  activeDemo === 'tts' ? 'Enter text to convert to speech...' :
                  'Describe an image you want to generate...'
                }
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                rows={3}
              />

              <TabsContent value="chat" className="space-y-4">
                <Button 
                  onClick={handleAIChat} 
                  disabled={isProcessing || !inputText.trim()}
                  className="w-full"
                >
                  {isProcessing ? (
                    <>Processing...</>
                  ) : (
                    <>
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Generate AI Response
                    </>
                  )}
                </Button>

                {/* Quick prompts for AI Chat */}
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setInputText('What are the benefits of using Malayalam TTS technology?')}
                  >
                    TTS Benefits
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setInputText('How can AI help in video content creation?')}
                  >
                    AI in Video
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setInputText('Explain the advantages of cloud-based voice synthesis.')}
                  >
                    Cloud Voice
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="tts" className="space-y-4">
                <Button 
                  onClick={handleTTS} 
                  disabled={isProcessing || !inputText.trim()}
                  className="w-full"
                >
                  {isProcessing ? (
                    <>Generating Audio...</>
                  ) : (
                    <>
                      <Mic className="w-4 h-4 mr-2" />
                      Convert to Speech
                    </>
                  )}
                </Button>

                {/* Quick text samples */}
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setInputText(getMalayalamPhrases()?.greetings?.[0] || 'നമസ്കാരം!')}
                  >
                    Malayalam Sample
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setInputText(getEnglishPhrases()?.greetings?.[0] || 'Hello! Welcome to our service.')}
                  >
                    English Sample
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setInputText('This is a test of the text-to-speech functionality with Puter.js integration.')}
                  >
                    Technical Demo
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="image" className="space-y-4">
                <Button 
                  onClick={handleImageGeneration} 
                  disabled={isProcessing || !inputText.trim()}
                  className="w-full"
                >
                  {isProcessing ? (
                    <>Generating Image...</>
                  ) : (
                    <>
                      <ImageIcon className="w-4 h-4 mr-2" />
                      Generate Image
                    </>
                  )}
                </Button>

                {/* Quick image prompts */}
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setInputText('Professional video background with modern gradient design')}
                  >
                    Video Background
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setInputText('Abstract Malayalam cultural pattern in vibrant colors')}
                  >
                    Cultural Pattern
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setInputText('Minimalist technology-themed illustration for presentations')}
                  >
                    Tech Illustration
                  </Button>
                </div>
              </TabsContent>
            </div>

            {/* Processing Indicator */}
            {isProcessing && (
              <div className="space-y-2">
                <Progress value={33} className="animate-pulse" />
                <p className="text-sm text-center text-muted-foreground">
                  {!isReady ? 'Using fallback system...' : 'Processing with Puter.js AI...'}
                </p>
              </div>
            )}

            {/* Results */}
            {result && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  {result.type === 'audio' && result.audioElement ? (
                    <div>
                      <p className="font-medium mb-2">Audio generated successfully!</p>
                      <audio controls className="w-full">
                        <source src={result.audioElement.src} type="audio/mpeg" />
                        Your browser does not support the audio element.
                      </audio>
                    </div>
                  ) : result.type === 'image' && result.imageElement ? (
                    <div>
                      <p className="font-medium mb-2">Image generated successfully!</p>
                      <img 
                        src={result.imageElement.src} 
                        alt="Generated" 
                        className="max-w-full h-auto rounded border"
                      />
                    </div>
                  ) : (
                    <div>
                      <p className="font-medium mb-2">Response:</p>
                      <p className="text-sm">{typeof result === 'string' ? result : result.message}</p>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {/* Errors */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <p className="font-medium mb-1">Service temporarily unavailable</p>
                  <p className="text-sm">{error}</p>
                  <p className="text-sm mt-2 opacity-80">
                    Don't worry! The system is using predetermined fallback responses to ensure continuity.
                  </p>
                </AlertDescription>
              </Alert>
            )}
          </Tabs>
        </CardContent>
      </Card>

      {/* Fallback Data Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="w-5 h-5 mr-2" />
            Available Fallback Resources
          </CardTitle>
          <CardDescription>
            Predetermined responses and data available when Puter.js is offline
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="voices" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="voices">Voice Profiles</TabsTrigger>
              <TabsTrigger value="phrases">Sample Phrases</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
            </TabsList>
            
            <TabsContent value="voices" className="space-y-2">
              {getVoiceProfiles().map((voice: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-2 rounded bg-muted/50">
                  <div>
                    <span className="font-medium">{voice.name}</span>
                    <span className="text-sm text-muted-foreground ml-2">({voice.language})</span>
                  </div>
                  <Badge variant="outline">{voice.gender}</Badge>
                </div>
              ))}
            </TabsContent>
            
            <TabsContent value="phrases" className="space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Malayalam Phrases</h4>
                  {getMalayalamPhrases()?.greetings?.slice(0, 3).map((phrase: string, index: number) => (
                    <p key={index} className="text-sm p-2 rounded bg-muted/50 mb-1">{phrase}</p>
                  ))}
                </div>
                <div>
                  <h4 className="font-medium mb-2">English Phrases</h4>
                  {getEnglishPhrases()?.greetings?.slice(0, 3).map((phrase: string, index: number) => (
                    <p key={index} className="text-sm p-2 rounded bg-muted/50 mb-1">{phrase}</p>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="templates" className="space-y-2">
              <p className="text-sm text-muted-foreground mb-3">
                Pre-configured templates for quick content creation when AI services are unavailable.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <Button variant="outline" size="sm">Professional Presentation</Button>
                <Button variant="outline" size="sm">Educational Content</Button>
                <Button variant="outline" size="sm">Marketing Video</Button>
                <Button variant="outline" size="sm">Cultural Greeting</Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}