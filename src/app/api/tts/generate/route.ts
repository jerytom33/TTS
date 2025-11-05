import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const ttsSchema = z.object({
  text: z.string().min(1).max(5000),
  voiceId: z.string(),
  projectId: z.string(),
  speed: z.number().min(0.5).max(2.0).default(1.0),
  pitch: z.number().min(0.5).max(2.0).default(1.0),
  language: z.string().default('en')
})

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const session = await db.userSession.findUnique({
      where: { token },
      include: { user: true }
    })

    if (!session || session.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    const body = await request.json()
    const { text, voiceId, projectId, speed, pitch, language } = ttsSchema.parse(body)

    const project = await db.project.findUnique({
      where: { id: projectId }
    })

    if (!project || project.userId !== session.userId) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Rate limiting: 10 TTS requests per minute
    const oneMinuteAgo = new Date(Date.now() - 60000)
    const recentCount = await db.usageAnalytics.count({
      where: {
        userId: session.userId,
        eventType: 'audio_generated',
        createdAt: { gte: oneMinuteAgo }
      }
    })

    if (recentCount >= 10) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      )
    }

    // Generate temporary audio URL (client will call puter.ai.txt2speech)
    const audioId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const audioUrl = `/api/audio/${audioId}.mp3`

    // Log analytics
    await db.usageAnalytics.create({
      data: {
        userId: session.userId,
        eventType: 'audio_generated',
        eventData: JSON.stringify({
          projectId,
          textLength: text.length,
          voiceId,
          speed,
          pitch,
          language
        }),
        userAgent: request.headers.get('user-agent'),
        ipAddress: request.headers.get('x-forwarded-for')
      }
    })

    return NextResponse.json({
      success: true,
      audioUrl,
      duration: Math.ceil(text.length / 150),
      voiceId,
      textLength: text.length,
      puter: {
        enabled: true,
        voiceId: voiceId,
        language: language,
        text: text
      }
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', issues: error.issues },
        { status: 400 }
      )
    }
    console.error('TTS error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
