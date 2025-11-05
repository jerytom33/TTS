import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Validate authentication and admin role
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    
    const session = await db.userSession.findUnique({
      where: { token },
      include: { user: true }
    })

    if (!session || session.expiresAt < new Date() || 
        (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const range = searchParams.get('range') || '7d'

    // Simulate analytics data (in production, this would query actual data)
    const analytics = {
      overview: {
        totalUsers: Math.floor(Math.random() * 1000) + 500,
        totalProjects: Math.floor(Math.random() * 2000) + 1000,
        totalVideos: Math.floor(Math.random() * 5000) + 2000,
        totalMinutes: Math.floor(Math.random() * 10000) + 5000
      },
      trends: {
        userGrowth: Math.random() * 30 + 10,
        projectGrowth: Math.random() * 40 + 15,
        videoGrowth: Math.random() * 50 + 20,
        revenueGrowth: Math.random() * 25 + 5
      },
      topLanguages: [
        { language: 'Malayalam', count: Math.floor(Math.random() * 500) + 300, percentage: 65 },
        { language: 'English', count: Math.floor(Math.random() * 300) + 200, percentage: 35 }
      ],
      topVoices: [
        { voice: 'Priya (Female)', count: Math.floor(Math.random() * 200) + 150, percentage: 35 },
        { voice: 'Rahul (Male)', count: Math.floor(Math.random() * 150) + 100, percentage: 25 },
        { voice: 'Anjali (Female)', count: Math.floor(Math.random() * 100) + 80, percentage: 20 },
        { voice: 'Sarah (Female)', count: Math.floor(Math.random() * 80) + 60, percentage: 15 },
        { voice: 'John (Male)', count: Math.floor(Math.random() * 60) + 40, percentage: 5 }
      ],
      recentActivity: [
        {
          id: '1',
          type: 'project_created',
          description: 'Created new project "Welcome Video"',
          timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
          user: 'demo@example.com'
        },
        {
          id: '2',
          type: 'video_rendered',
          description: 'Completed video rendering (1080p)',
          timestamp: new Date(Date.now() - Math.random() * 7200000).toISOString(),
          user: 'user@example.com'
        },
        {
          id: '3',
          type: 'audio_generated',
          description: 'Generated Malayalam audio',
          timestamp: new Date(Date.now() - Math.random() * 10800000).toISOString(),
          user: 'test@example.com'
        }
      ]
    }

    return NextResponse.json({
      success: true,
      analytics
    })

  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}