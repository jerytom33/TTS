import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Adding comprehensive translations...')

  const translations = [
    // Navigation
    { key: 'nav.home', en: 'Home', ml: 'ഹോം', category: 'ui' },
    { key: 'nav.dashboard', en: 'Dashboard', ml: 'ഡാഷ്ബോർഡ്', category: 'ui' },
    { key: 'nav.projects', en: 'Projects', ml: 'പ്രോജക്റ്റുകൾ', category: 'ui' },
    { key: 'nav.admin', en: 'Admin', ml: 'അഡ്മിൻ', category: 'ui' },
    
    // Buttons
    { key: 'button.create_project', en: 'Create Project', ml: 'പ്രോജക്റ്റ് നിർമ്മിക്കുക', category: 'ui' },
    { key: 'button.generate_audio', en: 'Generate Audio', ml: 'ഓഡിയോ ജനറേറ്റ് ചെയ്യുക', category: 'ui' },
    { key: 'button.render_video', en: 'Render Video', ml: 'വീഡിയോ റെൻഡർ ചെയ്യുക', category: 'ui' },
    { key: 'button.save', en: 'Save', ml: 'സേവ് ചെയ്യുക', category: 'ui' },
    { key: 'button.cancel', en: 'Cancel', ml: 'റദ്ദ് ചെയ്യുക', category: 'ui' },
    { key: 'button.edit', en: 'Edit', ml: 'എഡിറ്റ് ചെയ്യുക', category: 'ui' },
    { key: 'button.delete', en: 'Delete', ml: 'ഇല്ലാം ചെയ്യുക', category: 'ui' },
    { key: 'button.download', en: 'Download', ml: 'ഡൗൺലോഡ് ചെയ്യുക', category: 'ui' },
    { key: 'button.play', en: 'Play', ml: 'പ്ലേ ചെയ്യുക', category: 'ui' },
    { key: 'button.try_demo', en: 'Try Demo', ml: 'ഡെമോ നോക്കുക', category: 'ui' },
    { key: 'button.sign_in', en: 'Sign In', ml: 'സൈൻ ഇൻ ചെയ്യുക', category: 'ui' },
    { key: 'button.start_creating', en: 'Start Creating Free', ml: 'സൗജന്യമായി ആരംഭിക്കുക', category: 'ui' },
    { key: 'button.watch_demo', en: 'Watch Demo', ml: 'ഡെമോ കാണുക', category: 'ui' },
    { key: 'button.sample', en: 'Sample', ml: 'സാമ്പിൾ', category: 'ui' },
    { key: 'button.get_started', en: 'Get Started Free', ml: 'സൗജന്യമായി ആരംഭിക്കുക', category: 'ui' },
    { key: 'button.duplicate', en: 'Duplicate', ml: 'പകർപ്പെടുക', category: 'ui' },
    
    // Forms
    { key: 'form.project_name', en: 'Project Name', ml: 'പ്രോജക്റ്റ് പേര്', category: 'ui' },
    { key: 'form.description', en: 'Description', ml: 'വിവരണം', category: 'ui' },
    { key: 'form.text_content', en: 'Text Content', ml: 'ടെക്സ്റ്റ് ഉള്ളട', category: 'ui' },
    { key: 'form.select_voice', en: 'Select Voice', ml: 'ശബ്ദം തിരഞ്ഞെടുക്കുക', category: 'ui' },
    { key: 'form.voice_speed', en: 'Voice Speed', ml: 'ശബ്ദത്തിന്റെ വേഗത', category: 'ui' },
    { key: 'form.voice_pitch', en: 'Voice Pitch', ml: 'ശബ്ദത്തിന്റെ പിച്ച്', category: 'ui' },
    { key: 'form.email', en: 'Email', ml: 'ഇമെയിൽ', category: 'ui' },
    { key: 'form.password', en: 'Password', ml: 'പാസ്സ്‌വേഡ്', category: 'ui' },
    { key: 'form.name', en: 'Name', ml: 'പേര്', category: 'ui' },
    
    // Status
    { key: 'status.pending', en: 'Pending', ml: 'കാത്തിരിക്കുന്നു', category: 'ui' },
    { key: 'status.processing', en: 'Processing', ml: 'പ്രോസസ്സ് ചെയ്യുന്നു', category: 'ui' },
    { key: 'status.completed', en: 'Completed', ml: 'പൂർത്തിയായി', category: 'ui' },
    { key: 'status.failed', en: 'Failed', ml: 'പരാജയപ്പെട്ടു', category: 'ui' },
    { key: 'status.draft', en: 'Draft', ml: 'ഡ്രാഫ്റ്റ്', category: 'ui' },
    
    // Languages
    { key: 'language.english', en: 'English', ml: 'ഇംഗ്ലീഷ്', category: 'ui' },
    { key: 'language.malayalam', en: 'Malayalam', ml: 'മലയാളം', category: 'ui' },
    
    // Voice types
    { key: 'voice.male', en: 'Male', ml: 'പുരുഷൻ', category: 'ui' },
    { key: 'voice.female', en: 'Female', ml: 'സ്ത്രീ', category: 'ui' },
    
    // Quality
    { key: 'quality.720p', en: '720p', ml: '720p', category: 'ui' },
    { key: 'quality.1080p', en: '1080p', ml: '1080p', category: 'ui' },
    { key: 'quality.4k', en: '4K', ml: '4K', category: 'ui' },
    
    // Errors
    { key: 'error.auth_required', en: 'Authentication required', ml: 'പ്രാമാണീകരണം ആവശ്യമാണ്', category: 'error' },
    { key: 'error.invalid_credentials', en: 'Invalid credentials', ml: 'അസാധുവായ തിരിച്ചറിയൽ വിവരങ്ങൾ', category: 'error' },
    { key: 'error.project_not_found', en: 'Project not found', ml: 'പ്രോജക്റ്റ് കണ്ടെത്തിയില്ല', category: 'error' },
    { key: 'error.network_error', en: 'Network error', ml: 'നെറ്റ്‌വർക്ക് പിശക്', category: 'error' },
    
    // Success messages
    { key: 'success.project_created', en: 'Project created successfully', ml: 'പ്രോജക്റ്റ് വിജയകരമായി നിർമ്മിച്ചു', category: 'success' },
    { key: 'success.audio_generated', en: 'Audio generated successfully', ml: 'ഓഡിയോ വിജയകരമായി ജനറേറ്റ് ചെയ്തു', category: 'success' },
    { key: 'success.video_rendered', en: 'Video rendered successfully', ml: 'വീഡിയോ വിജയകരമായി റെൻഡർ ചെയ്തു', category: 'success' },
    
    // Features
    { key: 'features.malayalam_tts', en: 'Malayalam TTS Support', ml: 'മലയാളം TTS പിന്തുണ', category: 'ui' },
    { key: 'features.malayalam_tts_desc', en: 'High-quality Text-to-Speech synthesis with native Malayalam voices', ml: 'തദ്ദേശീയ മലയാളം ശബ്ദങ്ങളുമായി ഉന്നത നിലവാരത്തിലുള്ള ടെക്സ്റ്റ്-ടു-സ്പീച്ച് സിന്തസിസ്', category: 'ui' },
    { key: 'features.video_generation', en: 'Video Generation', ml: 'വീഡിയോ ജനറേഷൻ', category: 'ui' },
    { key: 'features.video_generation_desc', en: 'Convert text to professional videos with custom backgrounds and branding', ml: 'ഇഷ്‌ടം പശ്ചാത്തലകളും ബ്രാൻഡിംഗും ഉപയോഗിച്ച് ടെക്സ്റ്റ് പ്രൊഫഷണൽ വീഡിയോകളായി പരിവർത്തിക്കുക', category: 'ui' },
    { key: 'features.multilingual_ui', en: 'Multi-Language UI', ml: 'ബഹുഭാഷാ UI', category: 'ui' },
    { key: 'features.multilingual_ui_desc', en: 'Full interface support in English and Malayalam', ml: 'ഇംഗ്ലീഷ്, മലയാളം ഭാഷകളിൽ പൂർണ്ണമായ ഇന്റർഫേസ് പിന്തുണ', category: 'ui' },
    { key: 'features.lightning_fast', en: 'Lightning Fast', ml: 'മിന്നൽ വേഗത്തിൽ', category: 'ui' },
    { key: 'features.lightning_fast_desc', en: 'Powered by Puter.js AI for rapid audio generation', ml: 'വേഗത്തിൽ ഓഡിയോ ജനറേഷനായി Puter.js AI നൽകിയ പവർ', category: 'ui' },
    { key: 'features.enterprise_security', en: 'Enterprise Security', ml: 'എന്റർപ്രൈസ് സുരക്ഷാ', category: 'ui' },
    { key: 'features.enterprise_security_desc', en: 'Secure authentication and data protection', ml: 'സുരക്ഷിതമായ പ്രാമാണീകരണവും ഡാറ്റാ സംരക്ഷണവും', category: 'ui' },
    { key: 'features.cloud_based', en: 'Cloud-Based', ml: 'ക്ലൗഡ്-അധിഷ്ഠിതം', category: 'ui' },
    { key: 'features.cloud_based_desc', en: 'Access your projects from anywhere, anytime', ml: 'എവിടെ നിന്നും എപ്പോൾ നിങ്ങളുടെ പ്രോജക്റ്റുകൾ ആക്‌സസ് ചെയ്യുക', category: 'ui' },
    
    // Hero section
    { key: 'hero.malayalam_support', en: 'Now Supporting Malayalam Language', ml: 'ഇപ്പോൾ മലയാളം ഭാഷ പിന്തുണ', category: 'ui' },
    { key: 'hero.title', en: 'Transform Text into Professional Videos', ml: 'ടെക്സ്റ്റ് പ്രൊഫഷണൽ വീഡിയോകളായി പരിവർത്തിക്കുക', category: 'ui' },
    { key: 'hero.description', en: 'Create stunning videos from text using AI-powered Text-to-Speech technology. Perfect for content creators, educators, and businesses.', ml: 'AI-ചാലിത ടെക്സ്റ്റ്-ടു-സ്പീച്ച് സാങ്കേതിക് ഉപയോഗിച്ച് ടെക്സ്റ്റിൽ നിന്ന് മനോഹരമായ വീഡിയോകൾ സൃഷ്ടിക്കുക. കണ്ടന്റ് നിർമാതാക്കൾ, അധ്യാപകർ, ബിസിനസ്സുകൾക്ക് പര്യാപ്തം.', category: 'ui' },
    
    // Loading states
    { key: 'loading.loading', en: 'Loading...', ml: 'ലോഡ് ചെയ്യുന്നു...', category: 'ui' },
    { key: 'loading.loading_demo', en: 'Loading Demo...', ml: 'ഡെമോ ലോഡ് ചെയ്യുന്നു...', category: 'ui' },
    { key: 'loading.projects', en: 'Loading projects...', ml: 'പ്രോജക്റ്റുകൾ ലോഡ് ചെയ്യുന്നു...', category: 'ui' },
    
    // Dashboard
    { key: 'dashboard.description', en: 'Manage your video projects', ml: 'നിങ്ങളുടെ വീഡിയോ പ്രോജക്റ്റുകൾ നിയന്ത്രിക്കുക', category: 'ui' },
    { key: 'stats.total_projects', en: 'Total Projects', ml: 'മൊത്തം പ്രോജക്റ്റുകൾ', category: 'ui' },
    { key: 'stats.completed', en: 'Completed', ml: 'പൂർത്തിയായത്', category: 'ui' },
    { key: 'stats.processing', en: 'Processing', ml: 'പ്രോസസ്സ് ചെയ്യുന്നു', category: 'ui' },
    { key: 'stats.drafts', en: 'Drafts', ml: 'ഡ്രാഫ്റ്റുകൾ', category: 'ui' },
    
    // Search and filters
    { key: 'search.projects', en: 'Search projects...', ml: 'പ്രോജക്റ്റുകൾ തിരയുക...', category: 'ui' },
    
    // Project related
    { key: 'project.no_description', en: 'No description', ml: 'വിവരണമില്ല', category: 'ui' },
    { key: 'project.content_preview', en: 'Content Preview:', ml: 'ഉള്ളട പ്രിവ്യൂ:', category: 'ui' },
    { key: 'project.characters', en: 'characters', ml: 'അക്ഷരങ്ങൾ', category: 'ui' },
    { key: 'project.videos', en: 'video', ml: 'വീഡിയോ', category: 'ui' },
    { key: 'project.recent_videos', en: 'Recent Videos:', ml: 'സമീപകാല വീഡിയോകൾ:', category: 'ui' },
    
    // No projects state
    { key: 'no_projects.title', en: 'No projects found', ml: 'പ്രോജക്റ്റുകൾ ഒന്നും കണ്ടെത്തിയില്ല', category: 'ui' },
    { key: 'no_projects.search', en: 'Try adjusting your search terms', ml: 'നിങ്ങളുടെ തിരയൽ നിബന്ധനങ്ങൾ ക്രമീകരിക്കുക', category: 'ui' },
    { key: 'no_projects.create', en: 'Create your first project to get started', ml: 'ആരംഭിക്കാൻ നിങ്ങളുടെ ആദ്യത്തൻ പ്രോജക്റ്റ് സൃഷ്ടിക്കുക', category: 'ui' },
    
    // Voices section
    { key: 'voices.title', en: 'Premium Voice Collection', ml: 'പ്രീമിയം ശബ്ദ ശേഖരം', category: 'ui' },
    
    // How it works
    { key: 'how_it_works.title', en: 'How It Works', ml: 'ഇത് എങ്ങനെ പ്രവർത്തിക്കുന്നു', category: 'ui' },
    { key: 'how_it_works.step1.title', en: 'Write Text', ml: 'ടെക്സ്റ്റ് എഴുതുക', category: 'ui' },
    { key: 'how_it_works.step1.desc', en: 'Type or paste your content', ml: 'നിങ്ങളുടെ ഉള്ളട ടൈപ്പ് ചെയ്യുക അല്ലെങ്കിൽ പേസ്റ്റ് ചെയ്യുക', category: 'ui' },
    { key: 'how_it_works.step2.title', en: 'Choose Voice', ml: 'ശബ്ദം തിരഞ്ഞെടുക്കുക', category: 'ui' },
    { key: 'how_it_works.step2.desc', en: 'Select from our voice library', ml: 'ഞങ്ങളുടെ ശബ്ദ ലൈബ്രറിയിൽ നിന്ന് തിരഞ്ഞെടുക്കുക', category: 'ui' },
    { key: 'how_it_works.step3.title', en: 'Customize', ml: 'ഇഷ്‌ടം ചെയ്യുക', category: 'ui' },
    { key: 'how_it_works.step3.desc', en: 'Add backgrounds and branding', ml: 'പശ്ചാത്തലകളും ബ്രാൻഡിംഗും ചേർക്കുക', category: 'ui' },
    { key: 'how_it_works.step4.title', en: 'Generate', ml: 'ജനറേറ്റ് ചെയ്യുക', category: 'ui' },
    { key: 'how_it_works.step4.desc', en: 'Download your video', ml: 'നിങ്ങളുടെ വീഡിയോ ഡൗൺലോഡ് ചെയ്യുക', category: 'ui' },
    
    // CTA section
    { key: 'cta.title', en: 'Ready to Create Amazing Videos?', ml: 'അതിമനോഹരമായ വീഡിയോകൾ സൃഷ്ടിക്കാൻ തയ്യാറായോ?', category: 'ui' },
    { key: 'cta.description', en: 'Join thousands of creators using VoiceVideo AI to transform their content', ml: 'അവരുടെ ഉള്ളട പരിവർത്തിക്കാൻ VoiceVideo AI ഉപയോഗിക്കുന്ന ആയിരക്കൾ ആയിരക്കുക', category: 'ui' },
    
    // Footer
    { key: 'footer.powered_by', en: 'Powered by Puter.js AI Technology', ml: 'Puter.js AI സാങ്കേതിക് നൽകിയ പവർ', category: 'ui' },
    
    // Confirmations
    { key: 'confirm.delete_project', en: 'Are you sure you want to delete this project?', ml: 'ഈ പ്രോജക്റ്റ് ഇല്ലാം ചെയ്യാൻ നിങ്ങൾക്ക് തീർച്ചയാണോ?', category: 'ui' }
  ]

  for (const translation of translations) {
    await prisma.translation.upsert({
      where: { key: translation.key },
      update: translation,
      create: translation
    })
  }

  console.log('Added comprehensive translations for English and Malayalam')
}

main()
  .catch((e) => {
    console.error('Error adding translations:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })