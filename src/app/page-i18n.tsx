'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Play, Mic, Video, Languages, Zap, Shield, Globe, HeadphonesIcon, FileVideo, Sparkles } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { useTranslation } from '@/contexts/translation-context'
import LanguageSelector from '@/components/language-selector'

export default function Home() {
  const { isAuthenticated, login, register } = useAuth()
  const { t, language } = useTranslation()
  const router = useRouter()
  const [isDemoMode, setIsDemoMode] = useState(false)

  const features = [
    {
      icon: <Mic className="w-6 h-6" />,
      title: t('features.malayalam_tts', 'Malayalam TTS Support'),
      description: t('features.malayalam_tts_desc', 'High-quality Text-to-Speech synthesis with native Malayalam voices')
    },
    {
      icon: <Video className="w-6 h-6" />,
      title: t('features.video_generation', 'Video Generation'),
      description: t('features.video_generation_desc', 'Convert text to professional videos with custom backgrounds and branding')
    },
    {
      icon: <Languages className="w-6 h-6" />,
      title: t('features.multilingual_ui', 'Multi-Language UI'),
      description: t('features.multilingual_ui_desc', 'Full interface support in English and Malayalam')
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: t('features.lightning_fast', 'Lightning Fast'),
      description: t('features.lightning_fast_desc', 'Powered by Puter.js AI for rapid audio generation')
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: t('features.enterprise_security', 'Enterprise Security'),
      description: t('features.enterprise_security_desc', 'Secure authentication and data protection')
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: t('features.cloud_based', 'Cloud-Based'),
      description: t('features.cloud_based_desc', 'Access your projects from anywhere, anytime')
    }
  ]

  const voiceSamples = [
    { name: 'Priya (Female)', language: t('language.malayalam', 'Malayalam'), gender: t('voice.female', 'Female') },
    { name: 'Rahul (Male)', language: t('language.malayalam', 'Malayalam'), gender: t('voice.male', 'Male') },
    { name: 'Sarah (Female)', language: t('language.english', 'English'), gender: t('voice.female', 'Female') },
    { name: 'John (Male)', language: t('language.english', 'English'), gender: t('voice.male', 'Male') }
  ]

  const handleDemoLogin = async () => {
    setIsDemoMode(true)
    const success = await login('demo@example.com', 'demo123')
    if (success) {
      router.push('/dashboard')
    }
    setIsDemoMode(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <HeadphonesIcon className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              VoiceVideo AI
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <LanguageSelector />
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button>{t('nav.dashboard', 'Go to Dashboard')}</Button>
              </Link>
            ) : (
              <>
                <Button variant="outline" onClick={handleDemoLogin} disabled={isDemoMode}>
                  {isDemoMode ? t('loading.loading', 'Loading...') : t('button.try_demo', 'Try Demo')}
                </Button>
                <Link href="/auth/login">
                  <Button>{t('button.sign_in', 'Sign In')}</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <Badge className="mb-4 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            🎉 {t('hero.malayalam_support', 'Now Supporting Malayalam Language')}
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {t('hero.title', 'Transform Text into Professional Videos')}
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            {t('hero.description', 'Create stunning videos from text using AI-powered Text-to-Speech technology. Perfect for content creators, educators, and businesses.')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg" className="text-lg px-8">
                <Sparkles className="w-5 h-5 mr-2" />
                {t('button.start_creating', 'Start Creating Free')}
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-lg px-8" onClick={handleDemoLogin} disabled={isDemoMode}>
              <Play className="w-5 h-5 mr-2" />
              {isDemoMode ? t('loading.loading_demo', 'Loading Demo...') : t('button.watch_demo', 'Watch Demo')}
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">{t('features.title', 'Powerful Features')}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-300 mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Voice Samples */}
      <section className="py-16 px-4 bg-white dark:bg-slate-800">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">{t('voices.title', 'Premium Voice Collection')}</h2>
          <Tabs defaultValue="malayalam" className="max-w-4xl mx-auto">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="malayalam">{t('language.malayalam', 'Malayalam Voices')}</TabsTrigger>
              <TabsTrigger value="english">{t('language.english', 'English Voices')}</TabsTrigger>
            </TabsList>
            <TabsContent value="malayalam" className="mt-8">
              <div className="grid md:grid-cols-2 gap-4">
                {voiceSamples.filter(v => v.language === t('language.malayalam', 'Malayalam')).map((voice, index) => (
                  <Card key={index} className="flex items-center justify-between p-4">
                    <div>
                      <h3 className="font-semibold">{voice.name}</h3>
                      <p className="text-sm text-muted-foreground">{voice.gender} • {voice.language}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Play className="w-4 h-4 mr-2" />
                      {t('button.sample', 'Sample')}
                    </Button>
                  </Card>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="english" className="mt-8">
              <div className="grid md:grid-cols-2 gap-4">
                {voiceSamples.filter(v => v.language === t('language.english', 'English')).map((voice, index) => (
                  <Card key={index} className="flex items-center justify-between p-4">
                    <div>
                      <h3 className="font-semibold">{voice.name}</h3>
                      <p className="text-sm text-muted-foreground">{voice.gender} • {voice.language}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Play className="w-4 h-4 mr-2" />
                      {t('button.sample', 'Sample')}
                    </Button>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">{t('how_it_works.title', 'How It Works')}</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: 1, title: t('how_it_works.step1.title', 'Write Text'), description: t('how_it_works.step1.desc', 'Type or paste your content') },
              { step: 2, title: t('how_it_works.step2.title', 'Choose Voice'), description: t('how_it_works.step2.desc', 'Select from our voice library') },
              { step: 3, title: t('how_it_works.step3.title', 'Customize'), description: t('how_it_works.step3.desc', 'Add backgrounds and branding') },
              { step: 4, title: t('how_it_works.step4.title', 'Generate'), description: t('how_it_works.step4.desc', 'Download your video') }
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto text-center">
          <FileVideo className="w-16 h-16 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">{t('cta.title', 'Ready to Create Amazing Videos?')}</h2>
          <p className="text-xl mb-8 opacity-90">
            {t('cta.description', 'Join thousands of creators using VoiceVideo AI to transform their content')}
          </p>
          <Link href="/auth/register">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              {t('button.get_started', 'Get Started Free')}
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white dark:bg-slate-900 py-8 px-4">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>© 2024 VoiceVideo AI. {t('footer.powered_by', 'Powered by Puter.js AI Technology')}.</p>
        </div>
      </footer>
    </div>
  )
}