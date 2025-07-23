import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transcription } from '@/types';
import { Platform } from 'react-native';

// Debug flag - set to true to enable verbose logging
const DEBUG = true;

// Create a more resilient storage implementation
const createResilientStorage = () => {
  return {
    getItem: async (name: string): Promise<string | null> => {
      try {
        if (DEBUG) console.log(`Reading from storage: ${name}`);
        return await AsyncStorage.getItem(name);
      } catch (error) {
        console.error('Error reading from storage:', error);
        return null;
      }
    },
    setItem: async (name: string, value: string): Promise<void> => {
      try {
        if (DEBUG) console.log(`Writing to storage: ${name}`);
        await AsyncStorage.setItem(name, value);
      } catch (error) {
        console.error('Error writing to storage:', error);
      }
    },
    removeItem: async (name: string): Promise<void> => {
      try {
        if (DEBUG) console.log(`Removing from storage: ${name}`);
        await AsyncStorage.removeItem(name);
      } catch (error) {
        console.error('Error removing from storage:', error);
      }
    },
  };
};

// Create a web storage implementation with error handling
const createWebStorage = () => {
  return {
    getItem: (name: string): string | null => {
      try {
        if (DEBUG) console.log(`Reading from web storage: ${name}`);
        return localStorage.getItem(name);
      } catch (error) {
        console.error('Error reading from web storage:', error);
        return null;
      }
    },
    setItem: (name: string, value: string): void => {
      try {
        if (DEBUG) console.log(`Writing to web storage: ${name}`);
        localStorage.setItem(name, value);
      } catch (error) {
        console.error('Error writing to web storage:', error);
      }
    },
    removeItem: (name: string): void => {
      try {
        if (DEBUG) console.log(`Removing from web storage: ${name}`);
        localStorage.removeItem(name);
      } catch (error) {
        console.error('Error removing from web storage:', error);
      }
    },
  };
};

interface TranscriptionState {
  transcriptions: Transcription[];
  currentImage: string | null;
  isProcessing: boolean;
  error: string | null;
  addTranscription: (transcription: Transcription) => void;
  removeTranscription: (id: string) => void;
  updateTranscription: (id: string, updates: Partial<Transcription>) => void;
  setCurrentImage: (uri: string | null) => void;
  setIsProcessing: (isProcessing: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  transcriptions: [],
  currentImage: null,
  isProcessing: false,
  error: null,
};

export const useTranscriptionStore = create<TranscriptionState>()(
  persist(
    (set, get) => ({
      ...initialState,
      addTranscription: (transcription) => {
        if (DEBUG) console.log('Adding transcription:', transcription.id);
        set((state) => ({
          transcriptions: [transcription, ...state.transcriptions],
          error: null,
        }));
      },
      removeTranscription: (id) => {
        if (DEBUG) console.log('Removing transcription:', id);
        set((state) => ({
          transcriptions: state.transcriptions.filter((t) => t.id !== id),
          error: null,
        }));
      },
      updateTranscription: (id, updates) => {
        if (DEBUG) console.log('Updating transcription:', id);
        set((state) => ({
          transcriptions: state.transcriptions.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
          error: null,
        }));
      },
      setCurrentImage: (uri) => {
        if (DEBUG) console.log('Setting current image:', uri ? uri.substring(0, 30) + '...' : 'null');
        set({ 
          currentImage: uri,
          isProcessing: false,
          error: null,
        });
      },
      setIsProcessing: (isProcessing) => {
        if (DEBUG) console.log('Setting isProcessing:', isProcessing);
        set({ isProcessing });
      },
      setError: (error) => {
        if (DEBUG) console.log('Setting error:', error);
        set({ error, isProcessing: false });
      },
      reset: () => {
        if (DEBUG) console.log('Resetting transcription store');
        set(initialState);
      },
    }),
    {
      name: 'transcription-storage',
      storage: Platform.OS === 'web' 
        ? createJSONStorage(() => createWebStorage()) 
        : createJSONStorage(() => createResilientStorage()),
      partialize: (state) => ({
        // Only persist these properties
        transcriptions: state.transcriptions,
        // Don't persist these properties
        // currentImage: undefined,
        // isProcessing: undefined,
        // error: undefined,
      }),
      onRehydrateStorage: () => {
        if (DEBUG) console.log('Rehydrating transcription store');
        return (state) => {
          if (DEBUG) console.log('Rehydration complete:', state ? 'successful' : 'failed');
        };
      },
    }
  )
);
