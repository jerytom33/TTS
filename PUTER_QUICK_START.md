# Quick Start: Puter Voice Generation

## What's Working ✅

- **Automatic Authentication**: App auto-logs in with `kailaspnair@yahoo.com` / `@#Cargo123#@`
- **Voice Generation**: Puter.js `puter.ai.txt2speech()` ready to use
- **REST API**: `/api/tts/generate` endpoint with Bearer token auth
- **Database Logging**: All TTS requests logged to `usageAnalytics`
- **Fallback System**: Works offline with cached voice profiles
- **Production Build**: Clean build with no TypeScript errors

## Key Files

| File | Purpose |
|------|---------|
| `src/contexts/puter-context.tsx` | Puter.js initialization & authentication |
| `src/app/api/tts/generate/route.ts` | TTS API endpoint |
| `src/lib/puter-client.ts` | Client-side TTS helpers |
| `docs/PUTER_VOICE_GENERATION.md` | Complete documentation |

## How to Use

### 1. In a React Component

```typescript
'use client'
import { usePuter } from '@/contexts/puter-context'

export function MyVoiceComponent() {
  const { generateTextToSpeech } = usePuter()

  const speak = async () => {
    const audio = await generateTextToSpeech('Hello world', {
      voice: 'Joanna',
      language: 'en-US'
    })
    // audio is an HTMLAudioElement
    audio.play()
  }

  return <button onClick={speak}>Speak</button>
}
```

### 2. Via REST API

```bash
curl -X POST http://localhost:3000/api/tts/generate \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello world",
    "voiceId": "Joanna",
    "projectId": "proj_123",
    "language": "en"
  }'
```

### 3. Using the Client Library

```typescript
import { generateSpeechWithPuter } from '@/lib/puter-client'

const result = await generateSpeechWithPuter({
  text: 'Hello world',
  voice: 'Joanna',
  language: 'en-US'
})

console.log('Audio URL:', result.audioUrl)
```

## Supported Voices

- **Joanna** (English Female) ⭐ Default
- **Matthew** (English Male)
- **Emma** (British Female)
- **Brian** (British Male)
- Plus 490+ more from AWS Polly and OpenAI

## Rate Limits

- **10 TTS requests per minute** per user
- Returns `429 Too Many Requests` if exceeded
- Resets every 60 seconds

## Troubleshooting

**Q: My voice generation says "failed"**
A: Check browser console. If Puter.js isn't loaded, the system uses fallback voices. This is normal.

**Q: How do I change authentication credentials?**
A: Edit `src/contexts/puter-context.tsx` line ~70 (in the authentication attempt)

**Q: Can I add Malayalam voices?**
A: Yes! Add voice profiles to the `voices` table with `languageCode: 'ml'` and use them in requests.

**Q: Do I need API keys?**
A: No! Puter.js user-pays model means the account holder (kailaspnair@yahoo.com) covers costs.

## Commands

```bash
# Build for production
npm run build

# Start dev server
npm run dev

# View database
npm run studio

# Seed database
npm run db:seed

# Check TTS route
curl http://localhost:3000/api/health
```

## Next: Try It Out

1. Run `npm run dev`
2. Open http://localhost:3000/dashboard
3. Create a new project
4. Generate voice using the dashboard component
5. Check browser console for logs

---

**Documentation**: See `docs/PUTER_VOICE_GENERATION.md` for detailed guide
