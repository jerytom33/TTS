import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  textContent: z.string().min(1).max(10000),
  voiceId: z.string(),
  voiceSpeed: z.number().min(0.5).max(2.0).default(1.0),
  voicePitch: z.number().min(0.5).max(2.0).default(1.0),
  backgroundType: z.enum(['COLOR', 'IMAGE', 'VIDEO', 'SLIDESHOW']).default('COLOR'),
  backgroundColor: z.string().default('#000000'),
  backgroundImageUrl: z.string().optional(),
  backgroundVideoUrl: z.string().optional(),
  watermarkUrl: z.string().optional(),
  bgmUrl: z.string().optional(),
  bgmVolume: z.number().min(0).max(1).default(0.3)
})

export async function POST(request: NextRequest) {
  try {
    // Validate authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    
    // Validate session
    const session = await db.userSession.findUnique({
      where: { token }
    })

    if (!session || session.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Invalid or expired session' },
        { status: 401 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const projectData = createProjectSchema.parse(body)

    // Verify voice exists
    const voice = await db.voice.findUnique({
      where: { id: projectData.voiceId, isActive: true }
    })

    if (!voice) {
      return NextResponse.json(
        { error: 'Selected voice not found or inactive' },
        { status: 400 }
      )
    }

    // Create project
    const project = await db.project.create({
      data: {
        ...projectData,
        userId: session.userId,
        status: 'DRAFT'
      },
      include: {
        generatedVideos: true
      }
    })

    // Log analytics
    await db.usageAnalytics.create({
      data: {
        userId: session.userId,
        eventType: 'project_created',
        eventData: JSON.stringify({
          projectId: project.id,
          voiceId: project.voiceId,
          textLength: project.textContent.length,
          language: voice.languageCode
        })
      }
    })

    return NextResponse.json({
      success: true,
      project
    })

  } catch (error) {
    console.error('Error creating project:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid project data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    )
  }
}