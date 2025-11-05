import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Fetch all translations from database
    const translations = await db.translation.findMany()

    // Format translations into a key-value object
    const formattedTranslations: Record<string, Record<string, string>> = {}
    
    translations.forEach(translation => {
      if (!formattedTranslations[translation.key]) {
        formattedTranslations[translation.key] = {}
      }
      formattedTranslations[translation.key]['en'] = translation.en
      formattedTranslations[translation.key]['ml'] = translation.ml
    })

    // Add some default translations if database is empty
    if (Object.keys(formattedTranslations).length === 0) {
      const defaultTranslations = {
        'nav.home': { en: 'Home', ml: 'ഹോം' },
        'nav.dashboard': { en: 'Dashboard', ml: 'ഡാഷ്ബോർഡ്' },
        'nav.projects': { en: 'Projects', ml: 'പ്രോജക്റ്റുകൾ' },
        'nav.admin': { en: 'Admin', ml: 'അഡ്മിൻ' },
        'button.create_project': { en: 'Create Project', ml: 'പ്രോജക്റ്റ് നിർമ്മിക്കുക' },
        'button.generate_audio': { en: 'Generate Audio', ml: 'ഓഡിയോ ജനറേറ്റ് ചെയ്യുക' },
        'button.render_video': { en: 'Render Video', ml: 'വീഡിയോ റെൻഡർ ചെയ്യുക' },
        'button.save': { en: 'Save', ml: 'സേവ് ചെയ്യുക' },
        'button.cancel': { en: 'Cancel', ml: 'റദ്ദ് ചെയ്യുക' },
        'button.edit': { en: 'Edit', ml: 'എഡിറ്റ് ചെയ്യുക' },
        'button.delete': { en: 'Delete', ml: 'ഇല്ലാം ചെയ്യുക' },
        'button.download': { en: 'Download', ml: 'ഡൗൺലോഡ് ചെയ്യുക' },
        'button.play': { en: 'Play', ml: 'പ്ലേ ചെയ്യുക' },
        'form.project_name': { en: 'Project Name', ml: 'പ്രോജക്റ്റ് പേര്' },
        'form.description': { en: 'Description', ml: 'വിവരണം' },
        'form.text_content': { en: 'Text Content', ml: 'ടെക്സ്റ്റ് ഉള്ളട' },
        'form.select_voice': { en: 'Select Voice', ml: 'ശബ്ദം തിരഞ്ഞെടുക്കുക' },
        'form.voice_speed': { en: 'Voice Speed', ml: 'ശബ്ദത്തിന്റെ വേഗത' },
        'form.voice_pitch': { en: 'Voice Pitch', ml: 'ശബ്ദത്തിന്റെ പിച്ച്' },
        'error.auth_required': { en: 'Authentication required', ml: 'പ്രാമാണീകരണം ആവശ്യമാണ്' },
        'error.invalid_credentials': { en: 'Invalid credentials', ml: 'അസാധുവായ തിരിച്ചറിയൽ വിവരങ്ങൾ' },
        'error.project_not_found': { en: 'Project not found', ml: 'പ്രോജക്റ്റ് കണ്ടെത്തിയില്ല' },
        'error.network_error': { en: 'Network error', ml: 'നെറ്റ്‌വർക്ക് പിശക്' },
        'success.project_created': { en: 'Project created successfully', ml: 'പ്രോജക്റ്റ് വിജയകരമായി നിർമ്മിച്ചു' },
        'success.audio_generated': { en: 'Audio generated successfully', ml: 'ഓഡിയോ വിജയകരമായി ജനറേറ്റ് ചെയ്തു' },
        'success.video_rendered': { en: 'Video rendered successfully', ml: 'വീഡിയോ വിജയകരമായി റെൻഡർ ചെയ്തു' },
        'status.pending': { en: 'Pending', ml: 'കാത്തിരിക്കുന്നു' },
        'status.processing': { en: 'Processing', ml: 'പ്രോസസ്സ് ചെയ്യുന്നു' },
        'status.completed': { en: 'Completed', ml: 'പൂർത്തിയായി' },
        'status.failed': { en: 'Failed', ml: 'പരാജയപ്പെട്ടു' },
        'language.english': { en: 'English', ml: 'ഇംഗ്ലീഷ്' },
        'language.malayalam': { en: 'Malayalam', ml: 'മലയാളം' },
        'voice.male': { en: 'Male', ml: 'പുരുഷൻ' },
        'voice.female': { en: 'Female', ml: 'സ്ത്രീ' },
        'quality.720p': { en: '720p', ml: '720p' },
        'quality.1080p': { en: '1080p', ml: '1080p' },
        'quality.4k': { en: '4K', ml: '4K' }
      }

      return NextResponse.json({
        success: true,
        translations: defaultTranslations
      })
    }

    return NextResponse.json({
      success: true,
      translations: formattedTranslations
    })

  } catch (error) {
    console.error('Error fetching translations:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}