// Shared types between client and server

// Transcription request and response types
export interface TranscriptionRequest {
  imageBase64: string;
}

export interface TranscriptionResponse {
  text: string;
  confidence: number;
  language: string;
  processingTime: number;
  fallbackUsed?: boolean;
  error?: string;
}

// Enhancement request and response types
export interface EnhancementRequest {
  imageBase64: string;
  text: string;
  type: 'basic' | 'numbers' | 'smart' | 'completion' | 'complex-words';
}

export interface EnhancementChange {
  original: string;
  enhanced: string;
  reason: string;
}

export interface EnhancementResponse {
  text: string;
  confidence: number;
  changes?: EnhancementChange[];
  fallbackUsed?: boolean;
  error?: string;
}

// Analysis request and response types
export interface AnalysisRequest {
  imageBase64: string;
  text: string;
}

export interface AnalysisResponse {
  readability: {
    score: number;
    grade: string;
    assessment: string;
  };
  sentiment: {
    score: number;
    label: 'positive' | 'negative' | 'neutral';
  };
  topics: string[];
  keyPhrases: string[];
  entities: Array<{
    text: string;
    type: string;
    confidence: number;
  }>;
  fallbackUsed?: boolean;
  error?: string;
}

// Transcription data stored in the app
export interface Transcription {
  id: string;
  imageUri: string;
  originalText: string;
  enhancedText: string;
  title: string;
  createdAt: number;
  updatedAt?: number;
  tags?: string[];
  favorite?: boolean;
  notes?: string;
  language?: string;
  confidence?: number;
  analysis?: Partial<AnalysisResponse>;
}



// Voice annotation data
export interface VoiceAnnotation {
  id: string;
  transcriptionId: string;
  audioUri: string;
  text: string;
  startPosition: number;
  endPosition: number;
  createdAt: number;
  duration: number;
}

// Collaboration data
export interface Collaborator {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'editor' | 'viewer';
  joinedAt: number;
}

export interface CollaborationSession {
  id: string;
  transcriptionId: string;
  collaborators: Collaborator[];
  createdAt: number;
  updatedAt: number;
  expiresAt?: number;
  status: 'active' | 'expired' | 'closed';
}

// Integration data
export interface Integration {
  id: string;
  name: string;
  type: 'storage' | 'editor' | 'ai' | 'other';
  connected: boolean;
  lastSyncAt?: number;
  settings?: Record<string, any>;
}

// User preferences
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  fontSize: number;
  language: string;
  autoEnhance: boolean;
  saveOriginal: boolean;
  defaultExportFormat: 'txt' | 'pdf' | 'docx';
  accessibility: {
    highContrast: boolean;
    largeText: boolean;
    reduceMotion: boolean;
    screenReader: boolean;
  };
}
