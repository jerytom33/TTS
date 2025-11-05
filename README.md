# VoiceVideo AI - Malayalam TTS Video Generation Platform

A comprehensive, enterprise-grade SAAS platform for Text-to-Speech (TTS) Video Generation with robust support for the Malayalam language. Built with Next.js 15, TypeScript, Tailwind CSS, and powered by AI technology.

## 🚀 Features

### Core Capabilities
- **User Management**: Secure registration, login, and session management
- **Project Management**: Create, save, edit, and delete video projects
- **Rich Text Input**: Advanced text editor for content creation
- **Voice Selection**: Premium voice library with Malayalam and English support
- **Audio Preview**: Real-time audio generation and preview
- **Video Generation**: Create professional videos with custom backgrounds
- **Project Dashboard**: Comprehensive project management interface
- **Video Export**: Multiple quality options (720p, 1080p, 4K)

### Advanced Features
- **Voice Control**: Adjustable speed, pitch, and pauses
- **Dynamic Backgrounds**: Support for images, videos, and slideshows
- **Custom Branding**: Watermark and logo overlay support
- **Background Music**: BGM integration with volume control
- **AI Integration**: Powered by ZAI Web Development SDK for TTS
- **Multi-language UI**: English and Malayalam interface support
- **Real-time Updates**: Live progress tracking for video generation

## 🛠 Technology Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 with shadcn/ui components
- **State Management**: React Context, Zustand
- **UI Components**: Complete shadcn/ui component library
- **Icons**: Lucide React

### Backend
- **Database**: SQLite with Prisma ORM
- **API**: Next.js API Routes
- **Authentication**: Custom JWT-based auth system
- **AI Integration**: ZAI Web Development SDK (Puter.js alternative)
- **File Storage**: Local storage (configurable for cloud)

### Development Tools
- **Package Manager**: npm
- **Linting**: ESLint with Next.js configuration
- **Type Checking**: TypeScript strict mode
- **Hot Reload**: Next.js development server

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone <repository-url>
cd voicevideo-ai
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env.local` file in the root directory:
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret-key"
ZAI_API_KEY="your-zai-api-key"
```

### 4. Database Setup
```bash
# Push database schema
npm run db:push

# Generate Prisma client
npm run db:generate

# Seed database with sample data
npx tsx prisma/seed.ts
```

### 5. Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── tts/           # TTS generation
│   │   ├── voices/        # Voice management
│   │   └── projects/      # Project CRUD
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Main dashboard
│   └── globals.css        # Global styles
├── components/            # Reusable UI components
│   └── ui/               # shadcn/ui components
├── contexts/             # React contexts
│   └── auth-context.tsx  # Authentication context
├── features/             # Feature-based modules
│   ├── auth/             # Authentication features
│   ├── project-dashboard/# Project management
│   ├── video-creator/    # Video creation interface
│   └── admin-panel/      # Admin dashboard
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries
│   ├── db.ts            # Database client
│   └── utils.ts         # Helper functions
├── stores/               # State management
└── types/               # TypeScript type definitions
```

## 🔐 Authentication

### Demo Account
- **Email**: demo@example.com
- **Password**: demo123

### Authentication Flow
1. User registers/logs in via `/auth/login` or `/auth/register`
2. JWT token is generated and stored in localStorage
3. Token is validated on each API request
4. Session expires after 7 days

## 🎤 Voice Support

### Malayalam Voices
- **Priya** (Female) - Standard quality
- **Rahul** (Male) - Standard quality  
- **Anjali** (Female) - Premium quality

### English Voices
- **Sarah** (Female) - Standard quality
- **John** (Male) - Standard quality

## 🎬 Video Creation Workflow

1. **Create Project**: Enter project name and description
2. **Add Content**: Input or paste text content
3. **Select Voice**: Choose from available voices
4. **Adjust Settings**: Configure speed, pitch, and audio settings
5. **Customize Visual**: Select background, colors, and branding
6. **Generate Audio**: Create TTS audio preview
7. **Render Video**: Process final video with all settings
8. **Export**: Download in preferred quality

## 🔧 Configuration

### System Settings
All system configurations are managed through the `SystemConfig` table:
- `max_text_length`: Maximum characters for TTS (default: 10,000)
- `supported_languages`: Available language codes
- `default_voice_speed`: Default playback speed
- `max_file_size`: Maximum upload file size
- `rate_limit_per_minute`: API rate limiting

### Voice Management
Voices are managed through the `Voice` table with:
- Multi-language support
- Gender categorization
- Premium/free tier classification
- Provider integration (Puter.js, OpenAI, etc.)

## 📊 Analytics & Monitoring

### Usage Tracking
- Project creation events
- Audio generation metrics
- Video rendering statistics
- User engagement analytics

### Error Handling
- Centralized error logging
- User-friendly error messages
- Automatic retry mechanisms
- Performance monitoring

## 🌍 Internationalization

### Supported Languages
- **English** (en)
- **Malayalam** (ml)

### Translation Management
All UI text is managed through the `Translation` table:
- Dynamic text loading
- Context-aware translations
- Category-based organization
- Admin-manageable content

## 🔒 Security Features

- JWT-based authentication
- Session management with expiration
- Rate limiting on API endpoints
- Input validation and sanitization
- Secure file upload handling
- CORS protection

## 📈 Performance Optimizations

- Lazy loading of components
- Optimized database queries
- Efficient state management
- Image and video optimization
- Progressive loading
- Caching strategies

## 🧪 Testing

### Code Quality
```bash
# Run linting
npm run lint

# Type checking
npx tsc --noEmit
```

### Database Operations
```bash
# Reset database
npm run db:reset

# View database
npx prisma studio
```

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Environment Variables
```env
NODE_ENV=production
DATABASE_URL=production-database-url
NEXTAUTH_SECRET=production-secret
ZAI_API_KEY=production-api-key
```

## 📝 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/validate` - Token validation
- `PUT /api/auth/profile` - Profile update

### TTS Endpoints
- `POST /api/tts/generate` - Generate audio from text
- `GET /api/voices` - Get available voices

### Project Endpoints
- `GET /api/projects` - List user projects
- `POST /api/projects/create` - Create new project
- `PUT /api/projects/update` - Update project
- `DELETE /api/projects/delete` - Delete project

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the demo account functionality

## 🔄 Future Enhancements

- [ ] Real-time collaboration
- [ ] Advanced video editing
- [ ] Cloud storage integration
- [ ] Payment processing
- [ ] Advanced analytics dashboard
- [ ] Mobile app development
- [ ] Additional language support
- [ ] Voice cloning technology
- [ ] AI-powered content suggestions
- [ ] Template library

---

**Built with ❤️ using Next.js 15, TypeScript, and AI technology**