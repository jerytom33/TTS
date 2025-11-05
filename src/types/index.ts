// Database Types (generated from Prisma)
export type {
  User,
  UserSettings,
  UserSession,
  Project,
  GeneratedVideo,
  Voice,
  Translation,
  SystemConfig,
  RenderQueue,
  UsageAnalytics,
  UserRole,
  ProjectStatus,
  VideoStatus,
  BackgroundType,
  VoiceGender,
  QueueStatus
} from '@prisma/client'

// API Request/Response Types
export interface TTSRequest {
  text: string
  voiceId: string
  speed?: number
  pitch?: number
  language?: string
}

export interface TTSResponse {
  success: boolean
  audioUrl?: string
  duration?: number
  error?: string
}

export interface VideoRenderRequest {
  projectId: string
  quality: string
  backgroundType: BackgroundType
  backgroundColor?: string
  backgroundImageUrl?: string
  backgroundVideoUrl?: string
  watermarkUrl?: string
  bgmUrl?: string
  bgmVolume?: number
}

export interface VideoRenderResponse {
  success: boolean
  queueId?: string
  estimatedTime?: number
  error?: string
}

// UI State Types
export interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

export interface ProjectState {
  projects: Project[]
  currentProject: Project | null
  isLoading: boolean
  error: string | null
}

export interface VideoCreatorState {
  textContent: string
  selectedVoice: Voice | null
  voiceSpeed: number
  voicePitch: number
  backgroundType: BackgroundType
  backgroundColor: string
  backgroundImageUrl: string | null
  backgroundVideoUrl: string | null
  watermarkUrl: string | null
  bgmUrl: string | null
  bgmVolume: number
  isGeneratingAudio: boolean
  audioPreviewUrl: string | null
  isRenderingVideo: boolean
  renderProgress: number
}

// Admin Types
export interface AdminStats {
  totalUsers: number
  totalProjects: number
  totalVideos: number
  activeRenderJobs: number
  failedJobs: number
}

export interface VoiceManagementData {
  voices: Voice[]
  isLoading: boolean
  error: string | null
}

export interface TranslationManagementData {
  translations: Translation[]
  isLoading: boolean
  error: string | null
  selectedCategory: string
}

// Component Props Types
export interface VideoCreatorProps {
  projectId?: string
  onSave?: (project: Project) => void
  onCancel?: () => void
}

export interface ProjectCardProps {
  project: Project
  onEdit: (project: Project) => void
  onDelete: (projectId: string) => void
  onDuplicate: (project: Project) => void
}

export interface VoiceSelectorProps {
  voices: Voice[]
  selectedVoiceId: string
  onVoiceChange: (voiceId: string) => void
  language?: string
}

export interface BackgroundSelectorProps {
  backgroundType: BackgroundType
  backgroundColor: string
  backgroundImageUrl: string | null
  backgroundVideoUrl: string | null
  onChange: (updates: Partial<BackgroundSelectorProps>) => void
}

// Configuration Types
export interface AppConfig {
  apiBaseUrl: string
  maxTextLength: number
  supportedLanguages: string[]
  defaultVoiceSpeed: number
  defaultVoicePitch: number
  maxFileSize: number
  supportedVideoFormats: string[]
  supportedAudioFormats: string[]
}

export interface ThemeConfig {
  primaryColor: string
  secondaryColor: string
  accentColor: string
  backgroundColor: string
  textColor: string
  borderColor: string
}

// Error Types
export interface AppError {
  code: string
  message: string
  details?: any
  timestamp: Date
}

export interface ValidationError {
  field: string
  message: string
  code: string
}

// Analytics Types
export interface AnalyticsEvent {
  eventType: string
  userId?: string
  eventData?: any
  sessionId?: string
  timestamp: Date
}

// Export/Import Types
export interface ProjectExport {
  project: Project
  generatedVideos: GeneratedVideo[]
  exportDate: Date
  version: string
}

export interface VoiceImport {
  name: string
  displayName: string
  languageCode: string
  languageName: string
  gender: VoiceGender
  provider: string
  providerVoiceId: string
  isPremium: boolean
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>