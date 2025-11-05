import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create demo user
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      name: 'Demo User',
      role: 'USER',
      language: 'en',
      theme: 'light'
    }
  })

  // Create user settings for demo user
  await prisma.userSettings.upsert({
    where: { userId: demoUser.id },
    update: {},
    create: {
      userId: demoUser.id,
      defaultVoiceId: 'malayalam-female-1',
      exportQuality: '1080p',
      autoSave: true,
      watermarkEnabled: false,
      bgmVolume: 0.3
    }
  })

  // Create session for demo user
  await prisma.userSession.upsert({
    where: { token: 'ZGVtb0BleGFtcGxlLmNvbToxNzA0MDY0MDAwMDAw' }, // base64 encoded demo token
    update: {
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    },
    create: {
      userId: demoUser.id,
      token: 'ZGVtb0BleGFtcGxlLmNvbToxNzA0MDY0MDAwMDAw',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }
  })

  // Create voices
  const voices = [
    {
      id: 'malayalam-female-1',
      name: 'malayalam-female-1',
      displayName: 'Priya',
      languageCode: 'ml',
      languageName: 'Malayalam',
      gender: 'FEMALE' as const,
      provider: 'puter',
      providerVoiceId: 'ml-female-1',
      isPremium: false,
      isActive: true
    },
    {
      id: 'malayalam-male-1',
      name: 'malayalam-male-1',
      displayName: 'Rahul',
      languageCode: 'ml',
      languageName: 'Malayalam',
      gender: 'MALE' as const,
      provider: 'puter',
      providerVoiceId: 'ml-male-1',
      isPremium: false,
      isActive: true
    },
    {
      id: 'malayalam-female-2',
      name: 'malayalam-female-2',
      displayName: 'Anjali',
      languageCode: 'ml',
      languageName: 'Malayalam',
      gender: 'FEMALE' as const,
      provider: 'puter',
      providerVoiceId: 'ml-female-2',
      isPremium: true,
      isActive: true
    },
    {
      id: 'english-female-1',
      name: 'english-female-1',
      displayName: 'Sarah',
      languageCode: 'en',
      languageName: 'English',
      gender: 'FEMALE' as const,
      provider: 'puter',
      providerVoiceId: 'en-female-1',
      isPremium: false,
      isActive: true
    },
    {
      id: 'english-male-1',
      name: 'english-male-1',
      displayName: 'John',
      languageCode: 'en',
      languageName: 'English',
      gender: 'MALE' as const,
      provider: 'puter',
      providerVoiceId: 'en-male-1',
      isPremium: false,
      isActive: true
    }
  ]

  for (const voice of voices) {
    await prisma.voice.upsert({
      where: { id: voice.id },
      update: voice,
      create: voice
    })
  }

  // Create sample translations
  const translations = [
    {
      key: 'nav.home',
      en: 'Home',
      ml: 'ഹോം',
      category: 'ui'
    },
    {
      key: 'nav.dashboard',
      en: 'Dashboard',
      ml: 'ഡാഷ്ബോർഡ്',
      category: 'ui'
    },
    {
      key: 'nav.projects',
      en: 'Projects',
      ml: 'പ്രോജക്റ്റുകൾ',
      category: 'ui'
    },
    {
      key: 'button.create_project',
      en: 'Create Project',
      ml: 'പ്രോജക്റ്റ് നിർമ്മിക്കുക',
      category: 'ui'
    },
    {
      key: 'button.generate_audio',
      en: 'Generate Audio',
      ml: 'ഓഡിയോ ജനറേറ്റ് ചെയ്യുക',
      category: 'ui'
    },
    {
      key: 'button.render_video',
      en: 'Render Video',
      ml: 'വീഡിയോ റെൻഡർ ചെയ്യുക',
      category: 'ui'
    },
    {
      key: 'error.auth_required',
      en: 'Authentication required',
      ml: 'പ്രാമാണീകരണം ആവശ്യമാണ്',
      category: 'error'
    },
    {
      key: 'error.invalid_credentials',
      en: 'Invalid credentials',
      ml: 'അസാധുവായ തിരിച്ചറിയൽ വിവരങ്ങൾ',
      category: 'error'
    },
    {
      key: 'success.project_created',
      en: 'Project created successfully',
      ml: 'പ്രോജക്റ്റ് വിജയകരമായി നിർമ്മിച്ചു',
      category: 'success'
    },
    {
      key: 'success.audio_generated',
      en: 'Audio generated successfully',
      ml: 'ഓഡിയോ വിജയകരമായി ജനറേറ്റ് ചെയ്തു',
      category: 'success'
    }
  ]

  for (const translation of translations) {
    await prisma.translation.upsert({
      where: { key: translation.key },
      update: translation,
      create: translation
    })
  }

  // Create system configurations
  const configs = [
    {
      key: 'max_text_length',
      value: '10000',
      type: 'number',
      description: 'Maximum text length for TTS',
      category: 'tts',
      isPublic: true
    },
    {
      key: 'supported_languages',
      value: '["en", "ml"]',
      type: 'json',
      description: 'Supported language codes',
      category: 'ui',
      isPublic: true
    },
    {
      key: 'default_voice_speed',
      value: '1.0',
      type: 'number',
      description: 'Default voice speed',
      category: 'tts',
      isPublic: true
    },
    {
      key: 'max_file_size',
      value: '104857600', // 100MB
      type: 'number',
      description: 'Maximum file size in bytes',
      category: 'video',
      isPublic: true
    },
    {
      key: 'rate_limit_per_minute',
      value: '10',
      type: 'number',
      description: 'TTS requests per minute per user',
      category: 'tts',
      isPublic: false
    }
  ]

  for (const config of configs) {
    await prisma.systemConfig.upsert({
      where: { key: config.key },
      update: config,
      create: config
    })
  }

  // Create sample project for demo user
  const sampleProject = await prisma.project.create({
    data: {
      userId: demoUser.id,
      name: 'Welcome to VoiceVideo AI',
      description: 'Sample project demonstrating Malayalam TTS capabilities',
      textContent: 'സ്വാഗതം! ഇത് VoiceVideo AI യുടെ ഒരു സാമ്പിൾ പ്രോജക്റ്റാണ്. മലയാളം ടെക്സ്റ്റ് ടു സ്പീച്ച് സാങ്കേതികവിദ്യ ഉപയോഗിച്ച് നിങ്ങൾക്ക് ഉന്നത നിലവാരമുള്ള വീഡിയോകൾ നിർമ്മിക്കാൻ കഴിയും. നിങ്ങളുടെ ടെക്സ്റ്റ് ഇവിടെ ചേർക്കുക, ഒരു ശബ്ദം തിരഞ്ഞെടുക്കുക, തുടർന്ന് വീഡിയോ ജനറേറ്റ് ചെയ്യുക!',
      voiceId: 'malayalam-female-1',
      voiceSpeed: 1.0,
      voicePitch: 1.0,
      status: 'DRAFT',
      backgroundType: 'COLOR',
      backgroundColor: '#1a1a2e',
      bgmVolume: 0.3
    }
  })

  // Create sample generated video
  await prisma.generatedVideo.create({
    data: {
      projectId: sampleProject.id,
      status: 'COMPLETED',
      quality: '1080p',
      videoUrl: '/api/videos/sample/welcome-video.mp4',
      thumbnailUrl: '/api/videos/sample/welcome-thumbnail.jpg',
      duration: 45.5,
      fileSize: 15728640, // 15MB
      progress: 100,
      startedAt: new Date(Date.now() - 60000),
      completedAt: new Date()
    }
  })

  console.log('Database seeded successfully!')
  console.log('Demo user credentials: demo@example.com / demo123')
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })