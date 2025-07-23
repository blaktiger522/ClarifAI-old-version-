import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LanguageState {
  isAutoDetectEnabled: boolean;
  toggleAutoDetect: () => void;
  detectHandwriting: (text: string) => Promise<string>;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      isAutoDetectEnabled: true,
      
      toggleAutoDetect: () => set((state) => ({
        isAutoDetectEnabled: !state.isAutoDetectEnabled
      })),
      
      detectHandwriting: async (text) => {
        try {
          // In a real app, this would call a handwriting detection API
          // For now, we'll just return the text as is since we're English-only
          console.log('Detecting handwriting for:', text);
          
          // Mock detection - in reality would use a service like Google Cloud Vision API
          return text;
        } catch (error) {
          console.error('Error detecting handwriting:', error);
          return text; // Return original text on error
        }
      }
    }),
    {
      name: 'language-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
