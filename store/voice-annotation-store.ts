import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface VoiceAnnotation {
  id: string;
  duration: number;
  timestamp: number;
  transcription: string;
}

interface VoiceAnnotationState {
  annotations: Record<string, VoiceAnnotation[]>;
  addAnnotation: (transcriptionId: string, annotation: VoiceAnnotation) => void;
  removeAnnotation: (transcriptionId: string, annotationId: string) => void;
  getAnnotations: (transcriptionId: string) => VoiceAnnotation[];
  updateAnnotation: (transcriptionId: string, annotationId: string, updates: Partial<VoiceAnnotation>) => void;
}

export const useVoiceAnnotationStore = create<VoiceAnnotationState>()(
  persist(
    (set, get) => ({
      annotations: {},
      
      addAnnotation: (transcriptionId, annotation) => set((state) => {
        const currentAnnotations = state.annotations[transcriptionId] || [];
        
        return {
          annotations: {
            ...state.annotations,
            [transcriptionId]: [...currentAnnotations, annotation]
          }
        };
      }),
      
      removeAnnotation: (transcriptionId, annotationId) => set((state) => {
        const currentAnnotations = state.annotations[transcriptionId] || [];
        
        return {
          annotations: {
            ...state.annotations,
            [transcriptionId]: currentAnnotations.filter(a => a.id !== annotationId)
          }
        };
      }),
      
      getAnnotations: (transcriptionId) => {
        return get().annotations[transcriptionId] || [];
      },
      
      updateAnnotation: (transcriptionId, annotationId, updates) => set((state) => {
        const currentAnnotations = state.annotations[transcriptionId] || [];
        
        return {
          annotations: {
            ...state.annotations,
            [transcriptionId]: currentAnnotations.map(a => 
              a.id === annotationId ? { ...a, ...updates } : a
            )
          }
        };
      })
    }),
    {
      name: 'voice-annotation-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
