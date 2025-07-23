import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface OnboardingState {
  hasCompletedTutorial: boolean;
  currentStep: number;
  setHasCompletedTutorial: (completed: boolean) => void;
  setCurrentStep: (step: number) => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      hasCompletedTutorial: false,
      currentStep: 0,
      setHasCompletedTutorial: (completed) => set({ hasCompletedTutorial: completed }),
      setCurrentStep: (step) => set({ currentStep: step }),
      reset: () => set({ hasCompletedTutorial: false, currentStep: 0 }),
    }),
    {
      name: 'onboarding-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
