'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { puterService, PUTER_CONFIG } from '@/lib/puter-config'
import fallbackData from '@/data/fallback-answers.json'

interface PuterContextType {
  // Connection status
  isConnected: boolean
  isAuthenticated: boolean
  isInitialized: boolean
  connectionStatus: {
    puter: boolean
    auth: boolean
    initialized: boolean
  }

  // User information
  user: any
  
  // Service methods
  generateAIChat: (prompt: string, options?: any) => Promise<string>
  generateTextToSpeech: (text: string, options?: any) => Promise<HTMLAudioElement | string>
  generateImage: (prompt: string, options?: any) => Promise<HTMLImageElement | string>
  saveFile: (filename: string, content: any) => Promise<boolean>
  readFile: (filename: string) => Promise<any>
  
  // Fallback data access
  getFallbackData: (category: string, subcategory?: string) => any
  
  // Utility methods
  refreshConnection: () => Promise<void>
  getServiceStatus: () => string
}

const PuterContext = createContext<PuterContextType | undefined>(undefined)

export function PuterProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [connectionStatus, setConnectionStatus] = useState({
    puter: false,
    auth: false,
    initialized: false
  })

  // Initialize Puter service on component mount
  useEffect(() => {
    // Load Puter.js SDK
    const script = document.createElement('script')
    script.src = 'https://js.puter.com/v2/'
    script.async = true
    script.onload = () => {
      console.log('✅ Puter.js SDK loaded successfully')
      initializePuter()
    }
    script.onerror = () => {
      console.error('❌ Failed to load Puter.js SDK')
      // Still initialize with fallback
      initializePuter()
    }
    document.head.appendChild(script)
    
    // Set up periodic connection checks
    const intervalId = setInterval(checkConnectionStatus, 10000) // Check every 10 seconds
    
    return () => clearInterval(intervalId)
  }, [])

  const initializePuter = async () => {
    try {
      console.log('🚀 Initializing Puter service...')
      
      // Check if Puter.js is loaded
      if (typeof window !== 'undefined' && (window as any).puter) {
        console.log('✅ Puter.js is available')
        setIsConnected(true)
        
        // Attempt automatic authentication with default credentials
        try {
          const puterAuth = (window as any).puter?.auth
          if (puterAuth && puterAuth.signIn) {
            await puterAuth.signIn({
              email: 'kailaspnair@yahoo.com',
              password: '@#Cargo123#@',
              stay_signed_in: true
            })
            console.log('✅ Puter authenticated successfully')
            setIsAuthenticated(true)
            setIsInitialized(true)
            
            // Get user info
            if (puterAuth.getUser) {
              const userInfo = await puterAuth.getUser()
              setUser(userInfo)
              console.log('👤 Puter user info:', userInfo)
            }
          }
        } catch (authError) {
          console.warn('⚠️ Puter auth failed (may be expected):', authError)
          // Continue with fallback mode
          setIsAuthenticated(false)
          setIsInitialized(true)
        }
      } else {
        console.warn('⚠️ Puter.js not yet available, using fallback mode')
        setIsAuthenticated(false)
        setIsInitialized(true)
      }
      
      const success = await puterService.initialize()
      if (success) {
        console.log('✅ PuterService initialized')
      }
      
      updateConnectionStatus()
    } catch (error) {
      console.error('❌ Puter initialization error:', error)
      // Still allow fallback mode
      setIsInitialized(true)
    }
  }

  const checkConnectionStatus = async () => {
    try {
      const status = puterService.getConnectionStatus()
      setConnectionStatus(status)
      
      const authStatus = await puterService.isAuthenticated()
      setIsAuthenticated(authStatus)
      setIsConnected(status.puter && status.initialized)
      
      if (authStatus && !user) {
        const userInfo = await puterService.getUserInfo()
        setUser(userInfo)
      }
    } catch (error) {
      console.error('Connection check failed:', error)
    }
  }

  const updateConnectionStatus = () => {
    const status = puterService.getConnectionStatus()
    setConnectionStatus(status)
  }

  const generateAIChat = async (prompt: string, options: any = {}): Promise<string> => {
    try {
      console.log('🤖 Generating AI chat response for:', prompt.substring(0, 50) + '...')
      
      if (isConnected && isAuthenticated) {
        const response = await puterService.generateAIChat(prompt, options)
        console.log('✅ AI response generated successfully')
        return response
      } else {
        throw new Error('Puter service not available')
      }
    } catch (error) {
      console.warn('⚠️ AI Chat failed, using fallback:', error)
      return getFallbackResponse('aiChat', prompt)
    }
  }

  const generateTextToSpeech = async (text: string, options: any = {}): Promise<HTMLAudioElement | string> => {
    try {
      console.log('🎤 Generating TTS for:', text.substring(0, 50) + '...')
      
      // Try Puter.js first if available and authenticated
      if (isConnected && (window as any).puter?.ai?.txt2speech) {
        try {
          console.log('📡 Using Puter.js txt2speech API...')
          const audioElement = await (window as any).puter.ai.txt2speech(text, {
            language: options.language || 'en-US',
            voice: options.voice || 'Joanna',
            engine: options.engine || 'standard',
            provider: options.provider || 'aws-polly',
            response_format: options.response_format || 'mp3'
          })
          
          if (audioElement && audioElement.src) {
            console.log('✅ Puter.js TTS generated successfully')
            return audioElement
          }
        } catch (puterError) {
          console.warn('⚠️ Puter.js TTS failed, trying fallback:', puterError)
        }
      }
      
      // Fallback to PuterService
      if (isConnected && isAuthenticated) {
        const audio = await puterService.generateTextToSpeech(text, options)
        console.log('✅ TTS generated successfully via PuterService')
        return audio
      } else {
        throw new Error('Puter service not available')
      }
    } catch (error) {
      console.warn('⚠️ TTS failed, using fallback:', error)
      return getFallbackResponse('textToSpeech', text)
    }
  }

  const generateImage = async (prompt: string, options: any = {}): Promise<HTMLImageElement | string> => {
    try {
      console.log('🖼️ Generating image for:', prompt.substring(0, 50) + '...')
      
      if (isConnected && isAuthenticated) {
        const image = await puterService.generateImage(prompt, options)
        console.log('✅ Image generated successfully')
        return image
      } else {
        throw new Error('Puter service not available')
      }
    } catch (error) {
      console.warn('⚠️ Image generation failed, using fallback:', error)
      return getFallbackResponse('imageGeneration', prompt)
    }
  }

  const saveFile = async (filename: string, content: any): Promise<boolean> => {
    try {
      if (isConnected && isAuthenticated) {
        return await puterService.saveToFileSystem(filename, content)
      }
      throw new Error('Puter service not available')
    } catch (error) {
      console.warn('File save failed:', error)
      return false
    }
  }

  const readFile = async (filename: string): Promise<any> => {
    try {
      if (isConnected && isAuthenticated) {
        return await puterService.readFromFileSystem(filename)
      }
      throw new Error('Puter service not available')
    } catch (error) {
      console.warn('File read failed:', error)
      return null
    }
  }

  const getFallbackData = (category: string, subcategory?: string): any => {
    try {
      let data = (fallbackData as any)[category]
      
      if (subcategory && data) {
        data = data[subcategory]
      }
      
      return data || null
    } catch (error) {
      console.error('Error accessing fallback data:', error)
      return null
    }
  }

  const getFallbackResponse = (type: string, input: string): string => {
    try {
      // Get appropriate fallback response based on type
      switch (type) {
        case 'aiChat':
          const aiResponses = getFallbackData('aiResponses', 'aiChat')
          if (aiResponses && aiResponses.general_responses) {
            return aiResponses.general_responses[Math.floor(Math.random() * aiResponses.general_responses.length)]
          }
          return "I'm currently operating in offline mode. I can provide basic assistance based on my available knowledge."
          
        case 'textToSpeech':
          const ttsResponses = getFallbackData('aiResponses', 'textToSpeech')
          if (ttsResponses && input.length > 0) {
            // Determine language and provide appropriate response
            const hasmalayalam = /[\u0D00-\u0D7F]/.test(input)
            const language = hasmalayalam ? 'malayalam' : 'english'
            const phrases = ttsResponses[language]?.common_phrases
            
            if (phrases && phrases.length > 0) {
              return phrases[Math.floor(Math.random() * phrases.length)]
            }
          }
          return "Voice synthesis is currently unavailable. Please try again later."
          
        case 'imageGeneration':
          return "Image generation is temporarily unavailable. Please try again later or check your connection."
          
        default:
          return "Service is currently unavailable. Operating in fallback mode."
      }
    } catch (error) {
      console.error('Error generating fallback response:', error)
      return "An error occurred. Please try again."
    }
  }

  const refreshConnection = async (): Promise<void> => {
    console.log('🔄 Refreshing Puter connection...')
    await initializePuter()
  }

  const getServiceStatus = (): string => {
    if (!isInitialized) return 'initializing'
    if (!isConnected) return 'disconnected'
    if (!isAuthenticated) return 'unauthenticated'
    return 'connected'
  }

  const contextValue: PuterContextType = {
    isConnected,
    isAuthenticated,
    isInitialized,
    connectionStatus,
    user,
    generateAIChat,
    generateTextToSpeech,
    generateImage,
    saveFile,
    readFile,
    getFallbackData,
    refreshConnection,
    getServiceStatus
  }

  return (
    <PuterContext.Provider value={contextValue}>
      {children}
    </PuterContext.Provider>
  )
}

export function usePuter() {
  const context = useContext(PuterContext)
  if (context === undefined) {
    throw new Error('usePuter must be used within a PuterProvider')
  }
  return context
}

// Hook for checking Puter service status
export function usePuterStatus() {
  const { isConnected, isAuthenticated, isInitialized, connectionStatus, getServiceStatus } = usePuter()
  
  return {
    isConnected,
    isAuthenticated, 
    isInitialized,
    status: getServiceStatus(),
    details: connectionStatus,
    isReady: isConnected && isAuthenticated && isInitialized
  }
}

// Hook for fallback data access
export function usePuterFallback() {
  const { getFallbackData } = usePuter()
  
  return {
    getVoiceProfiles: () => getFallbackData('resourceTools', 'voiceProfiles') || [],
    getVideoStyles: () => getFallbackData('resourceTools', 'videoStyles') || [],
    getCommonPrompts: () => getFallbackData('resourceTools', 'commonPrompts') || {},
    getMalayalamPhrases: () => getFallbackData('aiResponses', 'textToSpeech')?.malayalam || {},
    getEnglishPhrases: () => getFallbackData('aiResponses', 'textToSpeech')?.english || {},
    getSystemConfig: () => getFallbackData('systemConfig') || {}
  }
}