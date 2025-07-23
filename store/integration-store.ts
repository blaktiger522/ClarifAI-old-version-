import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface IntegrationState {
  connectedIntegrations: string[];
  integrationSettings: Record<string, any>;
  connectIntegration: (id: string) => void;
  disconnectIntegration: (id: string) => void;
  updateIntegrationSettings: (id: string, settings: any) => void;
}

export const useIntegrationStore = create<IntegrationState>()(
  persist(
    (set) => ({
      connectedIntegrations: [],
      integrationSettings: {},
      
      connectIntegration: (id) => set((state) => ({
        connectedIntegrations: [...state.connectedIntegrations, id],
        integrationSettings: {
          ...state.integrationSettings,
          [id]: {
            autoSync: true,
            syncFrequency: 'daily',
            folderLocation: 'Handwrite AI',
            lastSync: null,
          }
        }
      })),
      
      disconnectIntegration: (id) => set((state) => ({
        connectedIntegrations: state.connectedIntegrations.filter(i => i !== id),
      })),
      
      updateIntegrationSettings: (id, settings) => set((state) => ({
        integrationSettings: {
          ...state.integrationSettings,
          [id]: {
            ...state.integrationSettings[id],
            ...settings,
          }
        }
      })),
    }),
    {
      name: 'integration-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
