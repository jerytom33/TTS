import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name } = registerSchema.parse(body)

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      )
    }

    // Create new user
    const user = await db.user.create({
      data: {
        email,
        name: name || email.split('@')[0],
        // In production, hash the password
        // password: await bcrypt.hash(password, 10)
      },
      include: {
        userSettings: true
      }
    })

    // Create default user settings
    await db.userSettings.create({
      data: {
        userId: user.id,
        defaultVoiceId: '', // Will be set when voices are loaded
        exportQuality: '1080p',
        autoSave: true,
        watermarkEnabled: false,
        bgmVolume: 0.3
      }
    })

    // Create session token
    const token = generateToken(user)

    // Create session record
    await db.userSession.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      }
    })

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        language: user.language,
        theme: user.theme,
        avatar: user.avatar
      },
      token
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function generateToken(user: any): string {
  // Simple token generation for demo
  // In production, use JWT or similar
  return Buffer.from(`${user.id}:${Date.now()}`).toString('base64')
}