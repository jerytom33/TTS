/**
 * Puter.js Client Integration for Voice Generation
 * This module handles Puter.ai.txt2speech() calls on the client side
 */

export interface PuterVoiceOptions {
  text: string
  language?: string
  voice?: string
  engine?: 'standard' | 'neural' | 'long-form' | 'generative'
  provider?: 'aws-polly' | 'openai'
  model?: string
  response_format?: 'mp3' | 'wav' | 'opus' | 'aac' | 'flac' | 'pcm'
  speed?: number
  pitch?: number
  instructions?: string
}

export interface PuterVoiceResponse {
  audioUrl: string
  duration: number
  format: string
  success: boolean
}

/**
 * Generate speech from text using Puter.ai.txt2speech()
 * This function must be called from a client component with Puter.js loaded
 */
export async function generateSpeechWithPuter(
  options: PuterVoiceOptions
): Promise<PuterVoiceResponse> {
  // Check if puter is available globally
  if (typeof window === 'undefined') {
    throw new Error('generateSpeechWithPuter must be called on the client side')
  }

  const puterAi = (window as any).puter?.ai

  if (!puterAi || !puterAi.txt2speech) {
    throw new Error('Puter.js is not loaded or puter.ai.txt2speech is not available')
  }

  try {
    // Call Puter.js text-to-speech API
    const audioElement = await puterAi.txt2speech(options.text, {
      language: options.language || 'en-US',
      voice: options.voice || 'Joanna',
      engine: options.engine || 'standard',
      provider: options.provider || 'aws-polly',
      model: options.model,
      response_format: options.response_format || 'mp3',
      instructions: options.instructions
    })

    if (!audioElement || !audioElement.src) {
      throw new Error('Failed to generate speech: no audio source')
    }

    // Extract duration if available
    let duration = 0
    if (audioElement.duration) {
      duration = audioElement.duration
    } else {
      // Estimate duration based on text length (rough approximation: 150 chars per minute)
      duration = Math.ceil((options.text.length / 150) * 60)
    }

    return {
      audioUrl: audioElement.src,
      duration,
      format: options.response_format || 'mp3',
      success: true
    }
  } catch (error) {
    console.error('Puter.js speech generation error:', error)
    throw error
  }
}

/**
 * Authenticate with Puter using stored credentials
 * Called automatically on app load
 */
export async function authenticateWithPuter(
  email: string,
  password: string
): Promise<boolean> {
  if (typeof window === 'undefined') {
    return false
  }

  const puterAuth = (window as any).puter?.auth

  if (!puterAuth) {
    console.warn('Puter.js auth not available')
    return false
  }

  try {
    // Attempt background authentication
    await puterAuth.signIn({
      email,
      password,
      stay_signed_in: true
    })
    return true
  } catch (error) {
    console.error('Puter authentication failed:', error)
    return false
  }
}

/**
 * Check if user is signed into Puter
 */
export async function isPuterAuthenticated(): Promise<boolean> {
  if (typeof window === 'undefined') {
    return false
  }

  const puterAuth = (window as any).puter?.auth

  if (!puterAuth) {
    return false
  }

  try {
    const user = await puterAuth.getUser?.()
    return !!user
  } catch {
    return false
  }
}
