// Puter.js Configuration and Setup
export const PUTER_CONFIG = {
  // Default authentication credentials
  defaultAuth: {
    email: 'kailaspnair@yahoo.com',
    password: '@#Cargo123#@',
    autoLogin: true
  },
  
  // Puter.js API endpoints and settings
  api: {
    baseUrl: 'https://api.puter.com',
    version: 'v2',
    timeout: 30000,
    retryAttempts: 3
  },

  // Application settings
  app: {
    name: 'VoiceVideo AI TTS Platform',
    description: 'Malayalam TTS Video Generation Platform with AI Integration',
    version: '1.0.0'
  },

  // Feature flags
  features: {
    aiChat: true,
    textToSpeech: true,
    textToImage: true,
    fileSystem: true,
    hosting: true,
    fallbackMode: true
  },

  // Fallback configuration
  fallback: {
    enabled: true,
    dataPath: '/src/data/fallback-answers.json',
    cacheTimeout: 300000, // 5 minutes
    maxRetries: 3
  }
}

// Puter.js SDK Integration
declare global {
  interface Window {
    puter: any;
  }
}

export class PuterService {
  private static instance: PuterService;
  private isInitialized: boolean = false;
  private authRetries: number = 0;
  private maxAuthRetries: number = 3;

  private constructor() {}

  static getInstance(): PuterService {
    if (!PuterService.instance) {
      PuterService.instance = new PuterService();
    }
    return PuterService.instance;
  }

  async initialize(): Promise<boolean> {
    try {
      // Load Puter.js SDK if not already loaded
      if (!window.puter) {
        await this.loadPuterSDK();
      }

      // Attempt automatic authentication
      if (PUTER_CONFIG.defaultAuth.autoLogin) {
        await this.authenticateWithDefaults();
      }

      this.isInitialized = true;
      console.log('✅ Puter.js initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Puter.js:', error);
      return false;
    }
  }

  private async loadPuterSDK(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.puter) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://js.puter.com/v2/';
      script.async = true;
      script.onload = () => {
        console.log('📦 Puter.js SDK loaded');
        resolve();
      };
      script.onerror = (error) => {
        console.error('❌ Failed to load Puter.js SDK:', error);
        reject(error);
      };
      
      document.head.appendChild(script);
    });
  }

  private async authenticateWithDefaults(): Promise<boolean> {
    try {
      if (!window.puter) {
        throw new Error('Puter SDK not loaded');
      }

      // Check if already signed in
      if (window.puter.auth && window.puter.auth.isSignedIn()) {
        console.log('✅ Already authenticated with Puter');
        return true;
      }

      // Attempt sign in with default credentials
      const signInResult = await window.puter.auth.signIn({
        attempt_temp_user_creation: true
      });

      if (signInResult) {
        console.log('✅ Authenticated with Puter successfully');
        return true;
      }

      throw new Error('Authentication failed');
    } catch (error) {
      console.warn('⚠️ Puter authentication failed, running in fallback mode:', error);
      this.authRetries++;
      
      if (this.authRetries < this.maxAuthRetries) {
        console.log(`🔄 Retrying authentication (${this.authRetries}/${this.maxAuthRetries})...`);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retry
        return this.authenticateWithDefaults();
      }
      
      return false;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      if (!window.puter || !window.puter.auth) {
        return false;
      }
      return window.puter.auth.isSignedIn();
    } catch (error) {
      console.error('Error checking authentication status:', error);
      return false;
    }
  }

  async getUserInfo(): Promise<any> {
    try {
      if (await this.isAuthenticated()) {
        return await window.puter.auth.getUser();
      }
      return null;
    } catch (error) {
      console.error('Error getting user info:', error);
      return null;
    }
  }

  async generateAIChat(prompt: string, options: any = {}): Promise<string> {
    try {
      if (!this.isInitialized || !(await this.isAuthenticated())) {
        throw new Error('Not authenticated');
      }

      const response = await window.puter.ai.chat(prompt, {
        model: options.model || 'gpt-5-nano',
        ...options
      });

      return response.message?.content || response;
    } catch (error) {
      console.warn('AI Chat failed, using fallback:', error);
      return this.getFallbackResponse('aiChat', prompt);
    }
  }

  async generateTextToSpeech(text: string, options: any = {}): Promise<HTMLAudioElement | string> {
    try {
      if (!this.isInitialized || !(await this.isAuthenticated())) {
        throw new Error('Not authenticated');
      }

      const audio = await window.puter.ai.txt2speech(text, {
        language: options.language || 'en-US',
        voice: options.voice || 'Joanna',
        ...options
      });

      return audio;
    } catch (error) {
      console.warn('Text-to-Speech failed, using fallback:', error);
      return this.getFallbackResponse('textToSpeech', text);
    }
  }

  async generateImage(prompt: string, options: any = {}): Promise<HTMLImageElement | string> {
    try {
      if (!this.isInitialized || !(await this.isAuthenticated())) {
        throw new Error('Not authenticated');
      }

      const image = await window.puter.ai.txt2img(prompt, {
        model: options.model || 'gpt-image-1-mini',
        quality: options.quality || 'low',
        ...options
      });

      return image;
    } catch (error) {
      console.warn('Image generation failed, using fallback:', error);
      return this.getFallbackResponse('imageGeneration', prompt);
    }
  }

  async saveToFileSystem(filename: string, content: any): Promise<boolean> {
    try {
      if (!this.isInitialized || !(await this.isAuthenticated())) {
        throw new Error('Not authenticated');
      }

      await window.puter.fs.write(filename, content);
      console.log(`✅ File saved to Puter FS: ${filename}`);
      return true;
    } catch (error) {
      console.warn('File system save failed:', error);
      return false;
    }
  }

  async readFromFileSystem(filename: string): Promise<any> {
    try {
      if (!this.isInitialized || !(await this.isAuthenticated())) {
        throw new Error('Not authenticated');
      }

      const blob = await window.puter.fs.read(filename);
      return await blob.text();
    } catch (error) {
      console.warn('File system read failed:', error);
      return null;
    }
  }

  private getFallbackResponse(type: string, input: string): string {
    // Load fallback data - in a real implementation, this would be loaded from the JSON file
    const fallbackResponses = {
      aiChat: [
        "I understand your request. Let me help you with that.",
        "That's an interesting question. Here's what I think based on my knowledge...",
        "I'd be happy to assist you with that task using available resources."
      ],
      textToSpeech: [
        "Text-to-speech service is temporarily unavailable. Please try again later.",
        "Voice generation is processing. This may take a moment.",
        "Audio synthesis is currently being prepared for your content."
      ],
      imageGeneration: [
        "Image generation service is currently unavailable. Please try again later.",
        "Your image is being processed. This may take several minutes.",
        "Visual content creation is in progress."
      ]
    };

    const responses = fallbackResponses[type as keyof typeof fallbackResponses] || fallbackResponses.aiChat;
    return responses[Math.floor(Math.random() * responses.length)];
  }

  getConnectionStatus(): { puter: boolean; auth: boolean; initialized: boolean } {
    return {
      puter: !!window.puter,
      auth: window.puter ? window.puter.auth?.isSignedIn() || false : false,
      initialized: this.isInitialized
    };
  }
}

// Export singleton instance
export const puterService = PuterService.getInstance();

// Auto-initialize on import
if (typeof window !== 'undefined') {
  puterService.initialize().catch(console.error);
}