import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const language = searchParams.get('language')
    const gender = searchParams.get('gender')
    const provider = searchParams.get('provider')

    // Build filter conditions
    const where: any = {
      isActive: true
    }

    if (language) {
      where.languageCode = language
    }

    if (gender) {
      where.gender = gender.toUpperCase()
    }

    if (provider) {
      where.provider = provider
    }

    // Fetch voices from database
    const voices = await db.voice.findMany({
      where,
      orderBy: [
        { languageCode: 'asc' },
        { gender: 'asc' },
        { name: 'asc' }
      ]
    })

    // If no voices exist, return default voices
    if (voices.length === 0) {
      const defaultVoices = [
        {
          id: 'malayalam-female-1',
          name: 'malayalam-female-1',
          displayName: 'Priya',
          languageCode: 'ml',
          languageName: 'Malayalam',
          gender: 'FEMALE',
          provider: 'puter',
          providerVoiceId: 'ml-female-1',
          isPremium: false,
          isActive: true,
          sampleAudioUrl: null,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'malayalam-male-1',
          name: 'malayalam-male-1',
          displayName: 'Rahul',
          languageCode: 'ml',
          languageName: 'Malayalam',
          gender: 'MALE',
          provider: 'puter',
          providerVoiceId: 'ml-male-1',
          isPremium: false,
          isActive: true,
          sampleAudioUrl: null,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'english-female-1',
          name: 'english-female-1',
          displayName: 'Sarah',
          languageCode: 'en',
          languageName: 'English',
          gender: 'FEMALE',
          provider: 'puter',
          providerVoiceId: 'en-female-1',
          isPremium: false,
          isActive: true,
          sampleAudioUrl: null,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'english-male-1',
          name: 'english-male-1',
          displayName: 'John',
          languageCode: 'en',
          languageName: 'English',
          gender: 'MALE',
          provider: 'puter',
          providerVoiceId: 'en-male-1',
          isPremium: false,
          isActive: true,
          sampleAudioUrl: null,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]

      // Save default voices to database
      await db.voice.createMany({
        data: defaultVoices,
        skipDuplicates: true
      })

      return NextResponse.json({
        success: true,
        voices: defaultVoices
      })
    }

    return NextResponse.json({
      success: true,
      voices
    })

  } catch (error) {
    console.error('Error fetching voices:', error)
    return NextResponse.json(
      { error: 'Failed to fetch voices' },
      { status: 500 }
    )
  }
}