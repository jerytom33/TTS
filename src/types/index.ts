// Database Types (generated from Prisma)
export type {
  User,
  UserSettings,
  UserSession,
  Project,
  Voice,
  Translation,
  SystemConfig,
  UsageAnalytics,
  UserRole,
  ProjectStatus,
  VoiceGender
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

export interface TTSCreatorState {
  textContent: string
  selectedVoice: Voice | null
  voiceSpeed: number
  voicePitch: number
  isGeneratingAudio: boolean
  audioPreviewUrl: string | null
}

// Admin Types
export interface AdminStats {
  totalUsers: number
  totalProjects: number
  activeJobs: number
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
export interface TTSCreatorProps {
  project?: Project
  onSave?: (project: Project) => void
  onCancel?: () => void
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